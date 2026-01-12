import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getLatestReport, getAllRuns, getPageScores } from '@/lib/reports';
import { setCachedInsights, setGenerating, getCachedInsights, getCachedCompetitorData, type DeviceScores } from '@/lib/cache';
import { getConfig, isAIEnabled } from '@/lib/config';
import type { AIInsightsResponse } from '@/lib/types/insights';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum allowed on hobby plan

/**
 * POST /api/ai-insights/refresh
 *
 * Generates fresh AI insights using Anthropic API and stores in cache.
 * Uses Haiku model for faster responses (5-10x faster than Sonnet).
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already generating
    const cached = await getCachedInsights();
    if (cached?.isGenerating) {
      return NextResponse.json({
        status: 'already_generating',
        message: 'AI insights are already being generated. Please wait.',
      });
    }

    // Mark as generating
    await setGenerating(true);

    const config = getConfig();

    if (!isAIEnabled()) {
      await setGenerating(false);
      return NextResponse.json(
        { error: 'AI insights not configured. Set ANTHROPIC_API_KEY environment variable.' },
        { status: 500 }
      );
    }

    // Check if page-specific analysis is requested
    let pagePath: string | null = null;
    let pageScores: DeviceScores | null = null;
    let pageUrl = config.app.targetBaseUrl;

    try {
      const body = await request.json();
      pagePath = body.page || null;
    } catch {
      // No body or invalid JSON - use overall site analysis
    }

    if (pagePath) {
      // Get page-specific scores (now async)
      const page = await getPageScores(pagePath);
      if (!page) {
        await setGenerating(false);
        return NextResponse.json(
          { error: `Page not found: ${pagePath}. Run a scan first.` },
          { status: 404 }
        );
      }
      pageScores = page.scores;
      pageUrl = page.url;
    }

    const latestReport = pagePath && pageScores
      ? { scores: pageScores, url: pageUrl }
      : await getLatestReport();

    if (!latestReport) {
      await setGenerating(false);
      return NextResponse.json(
        { error: 'No performance data available. Run a scan first.' },
        { status: 404 }
      );
    }

    const allRuns = await getAllRuns();
    const recentRuns = allRuns.slice(0, 7);

    // Calculate trend data
    const trendAnalysis = recentRuns.map((run) => {
      const mobile = run.reports[0]?.scores?.mobile;
      const desktop = run.reports[0]?.scores?.desktop;
      return {
        date: run.date.toISOString().split('T')[0],
        mobilePerf: mobile?.performance || 0,
        desktopPerf: desktop?.performance || 0,
        mobileSEO: mobile?.seo || 0,
        desktopSEO: desktop?.seo || 0,
        mobileA11y: mobile?.accessibility || 0,
        desktopA11y: desktop?.accessibility || 0,
      };
    });

    // Calculate score changes
    const latestScores = trendAnalysis[0];
    const previousScores = trendAnalysis[1] || latestScores;
    const scoreChanges = {
      mobilePerf: latestScores.mobilePerf - previousScores.mobilePerf,
      desktopPerf: latestScores.desktopPerf - previousScores.desktopPerf,
      mobileSEO: latestScores.mobileSEO - previousScores.mobileSEO,
      desktopSEO: latestScores.desktopSEO - previousScores.desktopSEO,
    };

    // Check for cached competitor data
    const competitorCache = await getCachedCompetitorData();
    let competitorSection = '';
    if (competitorCache?.data) {
      const { rankings, competitorProfiles, contentGaps } = competitorCache.data;
      competitorSection = `
## COMPETITOR INTELLIGENCE (Last updated: ${new Date(competitorCache.timestamp).toISOString()})

### Keyword Rankings
${rankings?.slice(0, 5).map((r: { keyword: string; sitePosition?: number | null; opportunity: string }) =>
  `- "${r.keyword}": Your position ${r.sitePosition ?? 'Not ranking'} (Opportunity: ${r.opportunity})`
).join('\n') || 'No ranking data available'}

### Top Competitors
${competitorProfiles?.slice(0, 3).map((c: { domain: string; organicTraffic: number; organicKeywords: number }) =>
  `- ${c.domain}: ${c.organicTraffic.toLocaleString()} monthly traffic, ${c.organicKeywords.toLocaleString()} keywords`
).join('\n') || 'No competitor profiles available'}

### Content Gap Opportunities
${contentGaps?.slice(0, 5).map((g: { keyword: string; searchVolume: number; difficulty: number }) =>
  `- "${g.keyword}" (${g.searchVolume} searches/mo, difficulty: ${g.difficulty})`
).join('\n') || 'No content gaps identified'}

Include competitive insights in your recommendations where relevant.
`;
    }

    const anthropic = new Anthropic({ apiKey: config.ai.apiKey! });

    // Build site context from configuration
    const siteDescription = config.app.siteDescription
      ? `${config.app.targetDomain} - ${config.app.siteDescription}`
      : config.app.targetDomain;

    // Build page context for specific page analysis
    const pageContext = pagePath
      ? `\n## PAGE BEING ANALYZED\nURL: ${pageUrl}\nPath: ${pagePath}\n\nProvide page-specific recommendations for this particular page, focusing on improvements relevant to its purpose and content.\n`
      : '';

    // Enhanced prompt for comprehensive analysis
    const prompt = `You are an SEO strategist analyzing ${siteDescription}.
${pageContext}
## CURRENT SCORES${pagePath ? ` (for ${pagePath})` : ' (site-wide average)'}
| Metric | Mobile | Desktop |
|--------|--------|---------|
| Performance | ${latestReport.scores.mobile?.performance ?? 'N/A'} | ${latestReport.scores.desktop?.performance ?? 'N/A'} |
| Accessibility | ${latestReport.scores.mobile?.accessibility ?? 'N/A'} | ${latestReport.scores.desktop?.accessibility ?? 'N/A'} |
| Best Practices | ${latestReport.scores.mobile?.['best-practices'] ?? 'N/A'} | ${latestReport.scores.desktop?.['best-practices'] ?? 'N/A'} |
| SEO | ${latestReport.scores.mobile?.seo ?? 'N/A'} | ${latestReport.scores.desktop?.seo ?? 'N/A'} |

## CHANGES FROM LAST RUN
- Mobile Performance: ${scoreChanges.mobilePerf > 0 ? '+' : ''}${scoreChanges.mobilePerf}
- Desktop Performance: ${scoreChanges.desktopPerf > 0 ? '+' : ''}${scoreChanges.desktopPerf}

## SCORE PRIORITIZATION ANALYSIS
Analyze the scores above and prioritize recommendations based on:
1. **Lowest scores first** - Categories scoring below 90 need immediate attention
2. **Device-specific issues** - If desktop scores differ significantly from mobile, provide device-specific recommendations
3. **Priority order** - Address scores in this order: <90 (critical), 90-95 (needs improvement), >95 (optimize)

Device comparison:
- Performance: Mobile ${latestReport.scores.mobile?.performance ?? 'N/A'} vs Desktop ${latestReport.scores.desktop?.performance ?? 'N/A'} ${(latestReport.scores.desktop?.performance ?? 0) < (latestReport.scores.mobile?.performance ?? 0) ? '⚠️ DESKTOP NEEDS ATTENTION' : ''}
- Accessibility: Mobile ${latestReport.scores.mobile?.accessibility ?? 'N/A'} vs Desktop ${latestReport.scores.desktop?.accessibility ?? 'N/A'}
- Best Practices: Mobile ${latestReport.scores.mobile?.['best-practices'] ?? 'N/A'} vs Desktop ${latestReport.scores.desktop?.['best-practices'] ?? 'N/A'}
- SEO: Mobile ${latestReport.scores.mobile?.seo ?? 'N/A'} vs Desktop ${latestReport.scores.desktop?.seo ?? 'N/A'}

For any category with score < 90, you MUST include at least one insight with specific recommendations. For device discrepancies > 5 points, include device-specific recommendations.
${competitorSection}
## IMPLEMENTATION SPECIFICITY REQUIREMENTS
For EVERY recommendation, you MUST include:
1. **Specific files or URLs** - Name the exact file paths (e.g., "app/page.tsx", "components/Hero.tsx") or page URLs affected
2. **Step-by-step instructions** - Numbered implementation steps that a developer can follow
3. **Expected impact** - Quantified where possible (e.g., "5-10 point Performance improvement", "15% CTR increase")
4. **Time estimate** - Realistic implementation time in minutes (e.g., 30, 60, 120)
5. **Required tools** - List any tools, libraries, or access needed (e.g., "next/image", "Chrome DevTools", "Vercel dashboard")

## TASK
Provide a comprehensive JSON analysis${pagePath ? ` specifically for the ${pagePath} page` : ''}. For content suggestions, provide DETAILED article outlines with 5-7 sections each.

{
  "summary": "2-3 sentence executive summary of findings",
  "overallHealthScore": 85,
  "insights": [
    {
      "category": "Performance|SEO|Accessibility|Best Practices",
      "severity": "high|medium|low",
      "finding": "Specific finding with data (e.g., 'LCP of 4.2s exceeds 2.5s threshold')",
      "recommendation": "What to do",
      "device": "mobile|desktop|both",
      "affectedPages": ["${config.app.targetBaseUrl}", "${config.app.targetBaseUrl}/support"],
      "implementation": {
        "steps": ["1. Open app/page.tsx", "2. Add priority attribute to hero image", "3. Test with Lighthouse"],
        "targetFiles": ["app/page.tsx", "components/Hero.tsx"],
        "targetUrls": ["${config.app.targetBaseUrl}"],
        "estimatedTimeMinutes": 30,
        "requiredTools": ["Chrome DevTools", "next/image"],
        "codeExample": "<Image src='/hero.jpg' priority />",
        "expectedMetrics": [{"metric": "LCP", "before": "4.2s", "after": "< 2.5s"}]
      },
      "actionItems": [{"type": "technical", "title": "Action", "description": "Steps", "implementation": "Code/steps", "estimatedImpact": "Expected result", "effort": "low|medium|high", "priority": 1}]
    }
  ],
  "contentSuggestions": [
    {
      "topic": "Specific blog topic relevant to target audience",
      "headline": "SEO-optimized headline",
      "rationale": "Why this topic matters for the target audience",
      "targetKeywords": ["primary keyword", "secondary keyword", "third keyword", "fourth keyword", "long-tail phrase"],
      "searchVolume": "500-1000",
      "difficulty": "low|medium|high",
      "priority": "high|medium|low",
      "outline": [
        "Introduction: Hook and problem statement",
        "Section 2: Core concept explanation",
        "Section 3: Benefits/Use cases",
        "Section 4: Implementation/How-to",
        "Section 5: Best practices",
        "Section 6: Case study or example",
        "Conclusion: Summary and CTA"
      ],
      "keyTakeaways": [
        "Key point 1 readers should remember",
        "Key point 2 with actionable insight",
        "Key point 3 linking to your solution"
      ],
      "callToAction": "Specific CTA suggestion for the article",
      "wordCountTarget": 2000,
      "estimatedReadTime": "8-10 minutes",
      "aiWritingPrompt": "Write a comprehensive blog article titled '[headline]' targeting the site's audience. The article should be approximately [wordCountTarget] words and include the following sections: [outline joined by commas]. Naturally incorporate these keywords throughout: [targetKeywords joined]. The tone should be professional but accessible, with practical examples and actionable advice. Include a compelling introduction addressing [rationale] and end with a clear call-to-action. Include relevant statistics and cite sources where applicable."
    }
  ],
  "schemaSuggestions": [
    {
      "type": "Organization + SoftwareApplication",
      "pageUrl": "${config.app.targetBaseUrl}",
      "pageType": "homepage",
      "schemaTypes": ["Organization", "SoftwareApplication", "WebSite"],
      "description": "Combined schema for homepage establishes brand identity and software details for rich snippets",
      "jsonLd": "Generate appropriate Organization and SoftwareApplication schema with site-specific details",
      "targetPages": ["Homepage"],
      "implementationNotes": "Add to <head> section using next/script. This combined graph structure allows multiple schemas on one page.",
      "targetFile": "app/layout.tsx",
      "implementationSteps": ["1. Open app/layout.tsx", "2. Import Script from next/script", "3. Add <Script type='application/ld+json' dangerouslySetInnerHTML={{__html: jsonLd}} />", "4. Validate with Google Rich Results Test"],
      "estimatedTimeMinutes": 20,
      "validationUrl": "https://search.google.com/test/rich-results"
    },
    {
      "type": "FAQPage",
      "pageUrl": "${config.app.targetBaseUrl}/support",
      "pageType": "support",
      "schemaTypes": ["FAQPage"],
      "description": "FAQ schema enables rich FAQ snippets in search results, increasing visibility and CTR",
      "jsonLd": "Generate FAQPage schema with actual FAQ content from the site",
      "targetPages": ["Support", "FAQ"],
      "implementationNotes": "Add actual FAQ content from your support pages. Each Q&A pair should be added as a mainEntity item."
    },
    {
      "type": "Article/BlogPosting",
      "pageUrl": "${config.app.targetBaseUrl}/blog",
      "pageType": "blog",
      "schemaTypes": ["Article", "BlogPosting"],
      "description": "Article schema improves blog post visibility and may enable rich snippets with author and date info",
      "jsonLd": "Generate BlogPosting schema with site-specific details and dynamic content",
      "targetPages": ["Blog posts", "Informational pages"],
      "implementationNotes": "Add to each blog post dynamically, replacing bracketed values with actual content. Use datePublished and dateModified for freshness signals."
    },
    {
      "type": "WebPage",
      "pageUrl": "${config.app.targetBaseUrl}/privacy",
      "pageType": "legal",
      "schemaTypes": ["WebPage"],
      "description": "Basic WebPage schema for legal/policy pages signals content type to search engines",
      "jsonLd": "Generate WebPage schema for legal pages with site-specific details",
      "targetPages": ["Privacy", "Terms", "Security Policy"],
      "implementationNotes": "Apply to all legal/policy pages. Change name and description to match each page."
    },
    {
      "type": "HowTo",
      "pageUrl": "${config.app.targetBaseUrl}/support/how-to",
      "pageType": "support",
      "schemaTypes": ["HowTo"],
      "description": "HowTo schema can enable step-by-step rich snippets for support/tutorial content",
      "jsonLd": "Generate HowTo schema with actual tutorial steps from the site",
      "targetPages": ["How-to guides", "Tutorial pages"],
      "implementationNotes": "Add to tutorial/how-to pages. Each step should be a HowToStep with clear instructions."
    }
  ],
  "copyImprovements": [
    {
      "location": "Homepage",
      "pageUrl": "${config.app.targetBaseUrl}",
      "pageType": "homepage",
      "element": "Hero headline",
      "category": "headline",
      "currentCopy": "Current hero text",
      "suggestedCopy": "Improved hero text with stronger value proposition",
      "rationale": "Why this messaging converts better",
      "expectedImpact": "15-25% improvement in engagement",
      "priority": "high",
      "targetFile": "app/page.tsx or components/Hero.tsx",
      "implementationSteps": ["1. Open the Hero component file", "2. Locate the h1 element", "3. Replace the current text with the suggested copy", "4. Test across device sizes"],
      "estimatedTimeMinutes": 15,
      "abTestSuggestion": "Run A/B test for 2 weeks with 50/50 traffic split"
    },
    {
      "location": "Homepage",
      "pageUrl": "${config.app.targetBaseUrl}",
      "pageType": "homepage",
      "element": "Primary CTA button",
      "category": "cta",
      "currentCopy": "Current CTA text",
      "suggestedCopy": "Action-oriented CTA with urgency",
      "rationale": "Why this CTA is more compelling",
      "expectedImpact": "10-20% click-through improvement",
      "priority": "high",
      "targetFile": "components/CTAButton.tsx",
      "implementationSteps": ["1. Find the primary CTA component", "2. Update the button text", "3. Consider adding urgency indicator", "4. Verify tracking is in place"],
      "estimatedTimeMinutes": 10
    },
    {
      "location": "Support Page",
      "pageUrl": "${config.app.targetBaseUrl}/support",
      "pageType": "support",
      "element": "Page header",
      "category": "headline",
      "currentCopy": "Current support header",
      "suggestedCopy": "More helpful, user-focused header",
      "rationale": "Why this builds trust",
      "expectedImpact": "Reduced support tickets, better UX",
      "priority": "medium",
      "targetFile": "app/support/page.tsx",
      "implementationSteps": ["1. Navigate to support page component", "2. Update the page title/header", "3. Ensure consistent styling"],
      "estimatedTimeMinutes": 10
    }
  ],
  "quickWins": [
    {
      "type": "technical",
      "title": "Add image lazy loading",
      "description": "Implement lazy loading for below-the-fold images to improve initial page load",
      "implementation": "Add loading='lazy' attribute to all <img> tags that are below the fold, or use next/image component with lazy loading enabled",
      "codeSnippet": "<img src='hero.jpg' alt='Hero' loading='lazy' />",
      "estimatedImpact": "5-10 point improvement in Performance score, faster LCP",
      "effort": "low",
      "priority": 1,
      "category": "performance",
      "timeToImplement": "30 minutes",
      "tools": ["next/image", "browser DevTools"]
    },
    {
      "type": "schema",
      "title": "Add FAQ schema to support pages",
      "description": "Implement FAQPage structured data to enable rich FAQ snippets in search results",
      "implementation": "Add JSON-LD script to support page with FAQPage schema containing actual FAQ content",
      "codeSnippet": "<script type='application/ld+json'>{\"@context\": \"https://schema.org\", \"@type\": \"FAQPage\", \"mainEntity\": [...]}</script>",
      "estimatedImpact": "Increased search visibility, higher CTR from SERP",
      "effort": "low",
      "priority": 2,
      "category": "seo",
      "pageUrl": "${config.app.targetBaseUrl}/support",
      "timeToImplement": "1 hour"
    },
    {
      "type": "content",
      "title": "Optimize meta descriptions",
      "description": "Add compelling, keyword-rich meta descriptions to pages with missing or generic descriptions",
      "implementation": "Update each page's metadata with unique, action-oriented descriptions under 160 characters",
      "beforeAfter": {
        "before": "Company Name - Product",
        "after": "Clear value proposition with benefits and call-to-action. Compelling description under 160 characters."
      },
      "estimatedImpact": "10-20% improvement in organic CTR",
      "effort": "low",
      "priority": 3,
      "category": "seo",
      "timeToImplement": "45 minutes"
    }
  ],
  "competitorInsights": ${competitorSection ? `[
    {"competitor": "domain.com", "insight": "What they're doing well/poorly", "opportunity": "How to capitalize on this insight", "priority": "high|medium|low"}
  ]` : 'null'}
}

Provide COMPREHENSIVE analysis with:
- 5-7 insights based on the scores. EACH insight MUST include:
  * device field ("mobile", "desktop", or "both")
  * affectedPages array with specific URLs
  * implementation object with: steps (numbered), targetFiles, targetUrls, estimatedTimeMinutes, requiredTools, codeExample (if applicable), and expectedMetrics (before/after)
- 5-7 detailed content suggestions - EACH must include: full 7-section outline, 5+ target keywords, aiWritingPrompt (fill in the template with actual values), wordCountTarget (2000-2500), and estimatedReadTime
- 3-5 schema suggestions for DIFFERENT page types. EACH MUST include: targetFile, implementationSteps (numbered), estimatedTimeMinutes, and validationUrl. Use real site data
- 7-10 copy improvements covering MULTIPLE pages. EACH MUST include: targetFile, implementationSteps (numbered), estimatedTimeMinutes, and optionally abTestSuggestion. Cover headlines, CTAs, descriptions, navigation, and social proof
- 8-10 quick wins with DETAILED implementation. EACH MUST include: codeSnippet, category, timeToImplement, tools array, and optionally beforeAfter comparison${competitorSection ? '\n- 3-5 competitor insights based on the competitive data provided' : ''}

CRITICAL REQUIREMENTS:
1. For each contentSuggestion, the aiWritingPrompt must be COMPLETE with all placeholders filled in
2. Every recommendation MUST have specific file paths or URLs, numbered implementation steps, and time estimates
3. Performance recommendations MUST include before/after metrics expectations
4. All time estimates should be realistic (in minutes) for a developer to implement

Return ONLY valid JSON, no markdown formatting.`;

    // Use Haiku model for much faster responses (5-10x faster than Sonnet)
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 8000, // Increased for comprehensive analysis with more suggestions
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from AI');
    }

    let analysisResult: AIInsightsResponse;
    try {
      // Clean the response - remove any markdown formatting
      let jsonText = content.text.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.slice(7);
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.slice(3);
      }
      if (jsonText.endsWith('```')) {
        jsonText = jsonText.slice(0, -3);
      }
      jsonText = jsonText.trim();

      analysisResult = JSON.parse(jsonText);
    } catch (_parseError) {
      console.error('Failed to parse AI response:', content.text.substring(0, 500));
      await setGenerating(false);
      throw new Error('Failed to parse AI analysis response');
    }

    // Ensure all required fields exist
    const response: AIInsightsResponse = {
      summary: analysisResult.summary || 'Analysis complete.',
      overallHealthScore: analysisResult.overallHealthScore || 0,
      insights: analysisResult.insights || [],
      contentSuggestions: analysisResult.contentSuggestions || [],
      schemaSuggestions: analysisResult.schemaSuggestions || [],
      copyImprovements: analysisResult.copyImprovements || [],
      quickWins: analysisResult.quickWins || [],
      competitorInsights: analysisResult.competitorInsights || undefined,
      timestamp: new Date().toISOString(),
      analysisVersion: '2.1',
    };

    // Store in cache (only for site-wide analysis)
    if (!pagePath) {
      await setCachedInsights(response);
    } else {
      // Clear generating flag for page-specific analysis
      await setGenerating(false);
    }

    return NextResponse.json({
      status: 'success',
      message: `AI insights generated${pagePath ? ` for ${pagePath}` : ''} successfully`,
      data: response,
      page: pagePath || null,
    });

  } catch (error: unknown) {
    await setGenerating(false);
    console.error('AI insights refresh error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to generate AI insights', details: errorMessage },
      { status: 500 }
    );
  }
}
