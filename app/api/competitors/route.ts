import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  checkKeywordRankings,
  getKeywordData,
  getKeywordSuggestions,
  getCompetitorOverview,
  getRankedKeywordsForDomain,
  getDomainPagesSummary,
  getKeywordIdeas,
  type RankedKeyword,
  type DomainPageSummary,
  type KeywordIdea,
} from '@/lib/dataforseo';
import {
  setCachedCompetitorData,
  getCompetitorConfig,
  setCachedCompetitorKeywords,
  getCachedCompetitorKeywords,
  setCachedDomainPages,
  getCachedDomainPages,
  setCachedKeywordIdeas,
  getCachedKeywordIdeas,
} from '@/lib/cache';
import { getConfig, isCompetitorAnalysisEnabled } from '@/lib/config';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

interface CompetitorAnalysisResponse {
  rankings: {
    keyword: string;
    sitePosition: number | null;
    competitors: { domain: string; position: number }[];
    searchVolume: number;
    opportunity: 'high' | 'medium' | 'low';
    error?: string;
  }[];
  competitorProfiles: {
    domain: string;
    organicTraffic: number;
    organicKeywords: number;
    error?: string;
  }[];
  contentGaps: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    topCompetitor: string | null;
    topCompetitorPosition: number | null;
    suggestedAction: string;
  }[];
  keywordSuggestions: {
    keyword: string;
    searchVolume: number;
    difficulty: number;
    cpc: number;
  }[];
  // Extended data from Tasks 34, 41, 42
  competitorKeywords?: Record<string, RankedKeyword[]>; // Per-competitor ranked keywords
  domainPages?: DomainPageSummary[]; // Target site indexed pages
  keywordIdeas?: KeywordIdea[]; // Related keyword ideas
  timestamp: string;
  errors?: string[]; // Aggregated errors for display
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if DataForSEO is configured
    if (!isCompetitorAnalysisEnabled()) {
      return NextResponse.json(
        {
          error: 'DataForSEO not configured',
          message: 'Add DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD to environment variables',
        },
        { status: 500 }
      );
    }

    const config = getConfig();
    const searchParams = request.nextUrl.searchParams;
    const analysisType = searchParams.get('type') || 'full';

    // Get competitor configuration from cache (user-configurable)
    const competitorConfig = await getCompetitorConfig();
    const TARGET_KEYWORDS = competitorConfig.keywords;
    const COMPETITORS = competitorConfig.competitors;

    console.log(`Using ${COMPETITORS.length} competitors and ${TARGET_KEYWORDS.length} keywords from config`);

    const response: Partial<CompetitorAnalysisResponse> = {
      timestamp: new Date().toISOString(),
    };

    // Keyword Rankings Analysis
    if (analysisType === 'full' || analysisType === 'rankings') {
      console.log('Checking keyword rankings...');
      const rankings = await checkKeywordRankings(config.app.targetDomain, TARGET_KEYWORDS);

      // Get search volume data
      const keywordData = await getKeywordData(TARGET_KEYWORDS);
      const volumeMap = new Map(keywordData.map(k => [k.keyword, k.searchVolume]));

      response.rankings = rankings.map(r => ({
        keyword: r.keyword,
        sitePosition: r.position,
        competitors: r.competitors.filter(c =>
          COMPETITORS.some(comp => c.domain.includes(comp.replace('www.', '')))
        ).map(c => ({ domain: c.domain, position: c.position })),
        searchVolume: volumeMap.get(r.keyword) || 0,
        opportunity: !r.position ? 'high' : r.position > 10 ? 'medium' : 'low',
        error: r.error,
      }));
    }

    // Competitor Profiles
    if (analysisType === 'full' || analysisType === 'competitors') {
      console.log('Analyzing competitor profiles...');
      const profiles = await getCompetitorOverview(COMPETITORS);
      response.competitorProfiles = profiles.map(p => ({
        domain: p.domain,
        organicTraffic: p.organicTraffic,
        organicKeywords: p.organicKeywords,
        error: p.error,
      }));
    }

    // Content Gaps - derive from rankings where your site doesn't rank but competitors do
    if ((analysisType === 'full' || analysisType === 'gaps') && response.rankings) {
      console.log('Deriving content gaps from rankings...');

      // Helper function to generate detailed content recommendations
      const generateContentRecommendation = (keyword: string, searchVolume: number, topCompetitor: string | null, topCompetitorPosition: number | null) => {
        // Generate headline based on keyword
        const keywordTitleCase = keyword.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const headline = `The Complete Guide to ${keywordTitleCase}`;

        // Generate rationale
        const volumeDescription = searchVolume > 1000 ? 'high-volume' : searchVolume > 500 ? 'moderate-volume' : 'targeted';
        const rationale = `This ${volumeDescription} keyword (${searchVolume.toLocaleString()} monthly searches) represents a significant content gap. ${topCompetitor ? `${topCompetitor} currently ranks #${topCompetitorPosition}, showing there's demand and competition.` : 'Competitors are already targeting this term.'} Creating comprehensive content here positions your site as a thought leader in this space.`;

        // Generate article outline based on keyword type
        const isProductKeyword = keyword.includes('software') || keyword.includes('tracking') || keyword.includes('tool');
        const outline = isProductKeyword ? [
          `Introduction: Why ${keywordTitleCase} Matters`,
          `The Challenges of Traditional Approaches`,
          `Key Features to Look for in Modern Solutions`,
          `How AI and Automation Are Transforming the Industry`,
          `Implementation Best Practices`,
          `ROI Analysis: The Business Case for Better Solutions`,
          `Conclusion: Taking the Next Step`,
        ] : [
          `Introduction: Understanding ${keywordTitleCase}`,
          `Current Industry Trends and Statistics`,
          `Best Practices for Professionals`,
          `Common Challenges and How to Overcome Them`,
          `Technology Solutions That Can Help`,
          `Case Studies: Success Stories`,
          `Conclusion: Implementing These Strategies`,
        ];

        // Generate target keywords (include the main keyword plus related terms)
        const targetKeywords = [
          keyword,
          `best ${keyword}`,
          `${keyword} guide`,
          `${keyword} tips`,
          `how to ${keyword.split(' ').slice(-2).join(' ')}`,
        ].slice(0, 5);

        // Calculate word count based on search volume (higher volume = more comprehensive content)
        const wordCountTarget = searchVolume > 1000 ? 2500 : searchVolume > 500 ? 2000 : 1500;
        const estimatedReadTime = `${Math.round(wordCountTarget / 200)}-${Math.round(wordCountTarget / 180)} minutes`;

        // Generate AI writing prompt
        const aiWritingPrompt = `Write a comprehensive, SEO-optimized blog article titled "${headline}" targeting your audience.

The article should be approximately ${wordCountTarget} words and include the following sections:
${outline.map((section, i) => `${i + 1}. ${section}`).join('\n')}

Key requirements:
- Naturally incorporate these target keywords throughout: ${targetKeywords.join(', ')}
- Use a professional but accessible tone
- Include practical, actionable advice and real-world examples
- Reference industry statistics and trends where appropriate
- Address common pain points related to ${keyword}
- Highlight how modern solutions can help address these challenges
- Include a compelling introduction that hooks the reader
- End with a clear call-to-action

The article should position your brand as a thought leader while providing genuine value to readers seeking information about ${keyword}.`;

        return { headline, rationale, outline, targetKeywords, wordCountTarget, estimatedReadTime, aiWritingPrompt };
      };

      // Filter rankings where your site is not ranking (position is null)
      // but at least one competitor is ranking
      const gaps = response.rankings
        .filter(r => r.sitePosition === null && r.competitors.length > 0 && !r.error)
        .map(r => {
          // Sort competitors by position to get the top one
          const sortedCompetitors = [...r.competitors].sort((a, b) => a.position - b.position);
          const topCompetitor = sortedCompetitors[0];
          const topCompetitorDomain = topCompetitor?.domain.replace('www.', '') || null;

          // Generate detailed content recommendation
          const recommendation = generateContentRecommendation(
            r.keyword,
            r.searchVolume,
            topCompetitorDomain,
            topCompetitor?.position || null
          );

          // Generate a suggested action based on the keyword
          const suggestedAction = `Create an in-depth blog post or landing page targeting "${r.keyword}" to compete with ${topCompetitor?.domain || 'competitors'} who rank at position #${topCompetitor?.position || 'unknown'}.`;

          return {
            keyword: r.keyword,
            searchVolume: r.searchVolume,
            difficulty: Math.round(r.searchVolume > 1000 ? 70 : r.searchVolume > 500 ? 50 : 30),
            topCompetitor: topCompetitorDomain,
            topCompetitorPosition: topCompetitor?.position || null,
            suggestedAction,
            ...recommendation,
          };
        })
        // Sort by search volume descending
        .sort((a, b) => b.searchVolume - a.searchVolume)
        // Take top 10
        .slice(0, 10);

      response.contentGaps = gaps;
    }

    // Keyword Suggestions
    if (analysisType === 'full' || analysisType === 'keywords') {
      console.log('Getting keyword suggestions...');
      const suggestions = await getKeywordSuggestions('legal time tracking', 2840, 'en', 30);
      response.keywordSuggestions = suggestions.map(s => ({
        keyword: s.keyword,
        searchVolume: s.searchVolume,
        difficulty: s.difficulty,
        cpc: s.cpc,
      }));
    }

    // Competitor Ranked Keywords (Task 34)
    if (analysisType === 'full' || analysisType === 'competitor-keywords') {
      console.log('Getting competitor ranked keywords...');
      const competitorKeywords: Record<string, RankedKeyword[]> = {};

      for (const competitor of COMPETITORS) {
        // Check cache first
        const cached = await getCachedCompetitorKeywords(competitor);
        if (cached) {
          competitorKeywords[competitor] = cached;
          continue;
        }

        // Fetch from API
        const keywords = await getRankedKeywordsForDomain(competitor, { limit: 20 });
        competitorKeywords[competitor] = keywords;

        // Cache the result
        if (keywords.length > 0) {
          await setCachedCompetitorKeywords(competitor, keywords);
        }
      }

      response.competitorKeywords = competitorKeywords;
    }

    // Domain Pages Summary (Task 41)
    if (analysisType === 'full' || analysisType === 'domain-pages') {
      console.log('Getting domain pages summary...');
      const targetDomain = config.app.targetDomain;

      // Check cache first
      const cachedPages = await getCachedDomainPages(targetDomain);
      if (cachedPages) {
        response.domainPages = cachedPages;
      } else {
        // Fetch from API
        const pages = await getDomainPagesSummary(targetDomain, 50);
        response.domainPages = pages;

        // Cache the result
        if (pages.length > 0) {
          await setCachedDomainPages(targetDomain, pages);
        }
      }
    }

    // Keyword Ideas (Task 42)
    if (analysisType === 'full' || analysisType === 'keyword-ideas') {
      console.log('Getting keyword ideas...');
      const allIdeas: KeywordIdea[] = [];

      // Use first 3 keywords as seeds to avoid too many API calls
      const seedKeywords = TARGET_KEYWORDS.slice(0, 3);

      for (const seed of seedKeywords) {
        // Check cache first
        const cached = await getCachedKeywordIdeas(seed);
        if (cached) {
          allIdeas.push(...cached);
          continue;
        }

        // Fetch from API
        const ideas = await getKeywordIdeas(seed, { limit: 5 });
        allIdeas.push(...ideas);

        // Cache the result
        if (ideas.length > 0) {
          await setCachedKeywordIdeas(seed, ideas);
        }
      }

      // Deduplicate by keyword
      const seen = new Set<string>();
      response.keywordIdeas = allIdeas.filter(idea => {
        if (seen.has(idea.keyword)) return false;
        seen.add(idea.keyword);
        return true;
      });
    }

    // Collect any API errors for user visibility
    const errors: string[] = [];
    if (response.rankings) {
      const rankingErrors = response.rankings.filter(r => r.error).map(r => `Keyword "${r.keyword}": ${r.error}`);
      errors.push(...rankingErrors);
    }
    if (response.competitorProfiles) {
      const profileErrors = response.competitorProfiles.filter(p => p.error).map(p => `${p.domain}: ${p.error}`);
      errors.push(...profileErrors);
    }
    if (errors.length > 0) {
      response.errors = errors;
    }

    // Cache the competitor data for AI insights integration
    // Assert timestamp is defined (set at line 79) for type safety
    await setCachedCompetitorData(response as CompetitorAnalysisResponse);

    return NextResponse.json(response);

  } catch (error: unknown) {
    console.error('Competitor analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to run competitor analysis', details: errorMessage },
      { status: 500 }
    );
  }
}
