# Public Release Runbook

This runbook provides exact steps to publish the Lighthouse SEO Dashboard as a clean public repository. Every step includes verification commands that must pass before proceeding.

---

## A. Purpose and Scope

**Goal:** Create a clean public GitHub repository from an internal branch, containing no internal identifiers, company-specific content, secrets, or generated artifacts.

**What gets published:**
- Application source code (app/, components/, lib/, scripts/)
- Configuration templates (.env.example, package.json, tsconfig.json)
- Documentation (README.md, docs/SETUP.md, CONTRIBUTING.md, LICENSE)
- CI/CD workflows (.github/workflows/)

**What must NOT be published:**
- Company names, internal domains, or project codenames
- API keys, tokens, or credentials (even expired ones)
- Generated Lighthouse reports, screenshots, or CI artifacts
- AI assistant configuration files (CLAUDE.md, .taskmaster/, etc.)
- Git history containing any of the above

---

## B. Preconditions (Must-Pass Gates)

Complete these steps in order. If any step fails, stop and fix before continuing.

### Step 1: Install dependencies

```bash
npm ci
```

**Expected outcome:** Exit code 0, no errors.

**If this fails:** Check Node.js version (requires 20+), delete `node_modules` and `package-lock.json`, run `npm install`.

### Step 2: Run TypeScript type checking

```bash
npm run typecheck
```

**Expected outcome:** Exit code 0, no type errors.

**If this fails:** Fix all type errors before continuing. Do not proceed with type errors.

### Step 3: Run ESLint

```bash
npm run lint
```

**Expected outcome:** Exit code 0, no lint errors.

**If this fails:** Run `npm run lint -- --fix` for auto-fixable issues, manually fix others.

### Step 4: Run test suite

```bash
npm test
```

**Expected outcome:** All tests pass (currently 20 tests).

**If this fails:** Fix failing tests before continuing.

### Step 5: Run production build

```bash
npm run build
```

**Expected outcome:** Build completes successfully, all routes generated.

**If this fails:** Check build errors, fix any issues with imports or configurations.

### Step 6: Run public readiness verification

```bash
node scripts/verify-public-ready.mjs
```

**Expected outcome:** Message shows "PUBLIC RELEASE READY" with no issues found.

**If this fails:** The script lists exactly which files contain problems. Fix each one:
- For company-specific strings: Edit the file to remove or replace them
- For internal-only documents: Delete them with `rm <filepath>`
- Re-run verification until it passes

---

## C. Public-Safety Checks (Must-Pass Gates)

These checks verify no sensitive content will be published.

### Step 7: Verify no company terms in tracked files

Replace `COMPANY_NAME` with your internal company/project name (e.g., `AcmeCorp`, `MyStartup`, etc.):

```bash
git ls-files | xargs grep -l -i "COMPANY_NAME" 2>/dev/null && echo "FAIL: Company references found" || echo "PASS: No company references"
```

**Expected outcome:** "PASS: No company references"

**If this fails:** Edit or delete each listed file to remove company references, then re-run.

### Step 8: Verify no hardcoded domains

Replace `yourdomain.com` with your internal domain:

```bash
git ls-files | xargs grep -l "yourdomain\.com" 2>/dev/null && echo "FAIL: Domain references found" || echo "PASS: No domain references"
```

**Expected outcome:** "PASS: No domain references"

**If this fails:** Replace hardcoded domains with `example.com` or configuration variables.

### Step 9: Verify no tracked report artifacts

```bash
git ls-files | grep -E '(public/reports|__screenshot|lighthouse\.(html|json)|ci-result\.json)' && echo "FAIL: Report artifacts tracked" || echo "PASS: No report artifacts tracked"
```

**Expected outcome:** "PASS: No report artifacts tracked"

**If this fails:** Remove tracked artifacts:
```bash
git rm -r --cached public/reports/ 2>/dev/null
git rm --cached '**/lighthouse.html' '**/lighthouse.json' '**/ci-result.json' 2>/dev/null
```

### Step 10: Verify no large files tracked

```bash
git ls-files | xargs -I {} sh -c 'size=$(wc -c < "{}" 2>/dev/null || echo 0); if [ "$size" -gt 500000 ]; then echo "LARGE: {} ($size bytes)"; fi'
```

**Expected outcome:** No files listed (or only expected large files like package-lock.json).

**If this fails:** Investigate large files. If they are generated artifacts, remove them from tracking.

### Step 11: Check git history for secrets (informational)

```bash
git log --oneline -20
```

Review recent commits. If you suspect secrets were ever committed:

1. **Option A (Recommended):** Use the fresh repository method in Section D to start clean
2. **Option B:** Use BFG Repo-Cleaner to rewrite history (complex, requires force-push)

---

## D. Publishing Methods

Choose ONE method. Option 1 is recommended for clean separation.

### Option 1: Fresh Repository (Recommended)

This creates a new repository with no history from the internal repo.

#### Step 12a: Create target directory

```bash
mkdir -p ~/lighthouse-seo-dashboard-public
cd ~/lighthouse-seo-dashboard-public
```

#### Step 13a: Copy files with exclusions

Replace `<SOURCE_REPO_PATH>` with the absolute path to your internal repository:

```bash
rsync -av \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='public/reports' \
  --exclude='.unlighthouse' \
  --exclude='.unlighthouse-*' \
  --exclude='__screenshot-thumbnails__' \
  --exclude='.taskmaster' \
  --exclude='CLAUDE.md' \
  --exclude='.claude' \
  --exclude='.cursor' \
  --exclude='.env' \
  --exclude='.env.local' \
  --exclude='*.log' \
  --exclude='regression-report.json' \
  --exclude='urls.txt' \
  <SOURCE_REPO_PATH>/ .
```

#### Step 14a: Verify no forbidden content copied

```bash
echo "=== Checking for forbidden directories ===" && \
ls -la public/reports 2>/dev/null && echo "FAIL: reports dir exists" || echo "PASS: No reports dir" && \
ls -la .unlighthouse* 2>/dev/null && echo "FAIL: unlighthouse dir exists" || echo "PASS: No unlighthouse dir" && \
ls -la .taskmaster 2>/dev/null && echo "FAIL: taskmaster dir exists" || echo "PASS: No taskmaster dir" && \
ls -la CLAUDE.md 2>/dev/null && echo "FAIL: CLAUDE.md exists" || echo "PASS: No CLAUDE.md"
```

**Expected outcome:** All checks show "PASS".

**If any fail:** Delete the forbidden content:
```bash
rm -rf public/reports .unlighthouse* .taskmaster CLAUDE.md .claude .cursor
```

#### Step 15a: Run verification in new directory

```bash
npm ci && node scripts/verify-public-ready.mjs
```

**Expected outcome:** "PUBLIC RELEASE READY"

**If this fails:** Fix issues, do NOT proceed until verification passes.

#### Step 16a: Initialize git and create initial commit

```bash
git init
git add .
git commit -m "Initial commit: Lighthouse SEO Dashboard template"
```

#### Step 17a: Create GitHub repository and push

Replace `<YOUR_GITHUB_USERNAME>` with your GitHub username:

```bash
gh repo create <YOUR_GITHUB_USERNAME>/lighthouse-seo-dashboard --public --source=. --push
```

**Expected outcome:** Repository created and code pushed.

---

### Option 2: Orphan Branch Method

Use this only if you need to preserve the repository structure.

#### Step 12b: Create orphan branch

```bash
git checkout public-updates
git checkout --orphan fresh-main
```

#### Step 13b: Remove any cached artifacts

```bash
git rm -r --cached public/reports 2>/dev/null || true
git rm -r --cached .unlighthouse* 2>/dev/null || true
```

#### Step 14b: Stage and commit

```bash
git add .
git commit -m "Initial commit: Lighthouse SEO Dashboard template"
```

#### Step 15b: Create new repository and push

Replace `<YOUR_GITHUB_USERNAME>`:

```bash
gh repo create <YOUR_GITHUB_USERNAME>/lighthouse-seo-dashboard --public
git remote add public git@github.com:<YOUR_GITHUB_USERNAME>/lighthouse-seo-dashboard.git
git push public fresh-main:main
```

---

## E. GitHub Release Creation

After pushing the repository, create a release.

### One-line command (recommended for zsh)

```bash
gh release create v1.0.0 --title "v1.0.0 - Initial Release" --notes "First public release of the Lighthouse SEO Dashboard template."
```

### Multi-line command (zsh-compatible)

Use single backslashes at end of line with no trailing spaces:

```bash
gh release create v1.0.0 \
  --title "v1.0.0 - Initial Release" \
  --notes "First public release of the Lighthouse SEO Dashboard template."
```

### Verify release was created

```bash
gh release view v1.0.0
```

**Expected outcome:** Release details displayed including title and notes.

**If `gh release create` fails with "stat \" or "command not found: --title":**
- You have trailing spaces after backslashes or incorrect line continuations
- Use the one-line command instead
- Or re-type the multi-line command carefully with no spaces after `\`

---

## F. Post-Release Settings Checklist

Complete these in GitHub repository settings:

1. **Add description:** "Self-hosted Lighthouse performance monitoring with AI-powered SEO insights"

2. **Add topics:** Click "Add topics" and add:
   - `lighthouse`
   - `seo`
   - `nextjs`
   - `vercel`
   - `performance-monitoring`
   - `web-vitals`

3. **Enable features:**
   - Settings → General → Features → Check "Issues"
   - Settings → General → Features → Check "Discussions"

4. **Set up branch protection:**
   - Settings → Branches → Add rule
   - Branch name pattern: `main`
   - Check "Require a pull request before merging"

5. **Make it a template (optional):**
   - Settings → General → Check "Template repository"
   - Users can click "Use this template" to create copies

---

## G. Maintaining Internal and Public Versions

If you maintain both an internal deployment and a public template:

### Sync strategy

1. Make changes in internal repo on a feature branch
2. Before syncing to public, run verification:
   ```bash
   node scripts/verify-public-ready.mjs
   ```
3. Only sync commits that pass verification
4. Use cherry-pick for selective commits:
   ```bash
   # In public repo directory
   git remote add internal <path-to-internal-repo>
   git fetch internal
   git cherry-pick <commit-hash>
   ```
5. After cherry-pick, run verification again in public repo

### Warning

Never use `git merge` or `git pull` from internal to public without reviewing each commit. Internal commits may contain company-specific content.

---

## H. Troubleshooting

### Problem: verify-public-ready fails with company strings

**Symptom:** Script shows matches in specific files

**Solution:**
1. Open each listed file
2. Search for the matched term
3. Either:
   - Replace with generic text (e.g., "AcmeCorp" → "target site")
   - Delete the file if it's internal-only documentation
4. Re-run verification

Example fix:
```bash
# If docs/INTERNAL-NOTES.md contains company content
rm docs/INTERNAL-NOTES.md

# Re-run
node scripts/verify-public-ready.mjs
```

### Problem: gh release create fails with line continuation errors

**Symptom:** Errors like `stat \: no such file or directory` or `command not found: --title`

**Cause:** Trailing spaces after backslashes or copy-paste issues with line continuations

**Solution:** Use the one-line version:
```bash
gh release create v1.0.0 --title "v1.0.0 - Initial Release" --notes "First public release."
```

### Problem: Repository accidentally contains large report artifacts

**Symptom:** `git ls-files` shows files under `public/reports/` or large `.jpeg` files

**Solution:**
```bash
# Remove from git tracking (keeps local files)
git rm -r --cached public/reports/
git rm -r --cached '**/lighthouse.html'
git rm -r --cached '**/lighthouse.json'
git rm --cached '**/*.jpeg' 2>/dev/null || true

# Commit the removal
git commit -m "Remove tracked report artifacts"

# Verify .gitignore prevents future commits
cat .gitignore | grep -E 'reports|screenshot|lighthouse'
```

### Problem: rsync copied forbidden directories

**Symptom:** After rsync, `ls -la` shows `.taskmaster/`, `CLAUDE.md`, or `public/reports/`

**Solution:**
```bash
rm -rf public/reports .unlighthouse* .taskmaster CLAUDE.md .claude .cursor .windsurf .aider* urls.txt regression-report.json
```

Then re-run the verification in Section C.

---

## Done Definition

The public release is complete when ALL of the following are true:

| Condition | Verification Command |
|-----------|---------------------|
| Verification script passes | `node scripts/verify-public-ready.mjs` shows "PUBLIC RELEASE READY" |
| No company terms in tracked files | `git ls-files \| xargs grep -li "COMPANY_NAME"` returns nothing |
| No report artifacts tracked | `git ls-files \| grep -E 'public/reports'` returns nothing |
| Build succeeds | `npm run build` exits with code 0 |
| Tests pass | `npm test` shows all tests passing |
| GitHub repo exists | `gh repo view` shows repository info |
| Release exists | `gh release view v1.0.0` shows release info |

Run these final checks to confirm:

```bash
echo "=== Final Verification ===" && \
node scripts/verify-public-ready.mjs && \
npm run build > /dev/null 2>&1 && echo "Build: PASS" && \
npm test > /dev/null 2>&1 && echo "Tests: PASS" && \
gh repo view > /dev/null 2>&1 && echo "Repo: EXISTS" && \
gh release view v1.0.0 > /dev/null 2>&1 && echo "Release: EXISTS" || echo "Release: NOT FOUND (create with gh release create)"
```
