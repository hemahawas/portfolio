# Ibrahim's Portfolio

A tiny React + Vite shell that loads the portfolio HTML from Supabase Storage. Updating the Storage file updates the live portfolio without rebuilding or redeploying React.

## Local development

1. Copy `.env.example` to `.env.local`.
2. Fill in your Supabase URL and public anon key.
3. Create a **public** Storage bucket named `portfolio`.
4. Upload your portfolio HTML file as `index.html`.
5. Run:

```bash
npm install
npm run dev
```

The page fetches the HTML on load and checks for updates every 30 seconds.

## Supabase setup

Required environment values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` (publishable/anon key only — never use the service-role key in the browser)
- `VITE_PORTFOLIO_BUCKET` (defaults to `portfolio`)
- `VITE_PORTFOLIO_FILE` (defaults to `index.html`)

The bucket/file must be publicly readable. Replace the HTML object in Storage to publish content changes. The iframe isolates the HTML content from the React app.

## Tag-based deployment

A GitHub Actions workflow builds and deploys to GitHub Pages when a version tag matching `v*` is pushed.

1. In GitHub, open **Settings → Pages** and set Source to **GitHub Actions**.
2. Add repository Actions secrets:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Create and push a version tag:

```bash
git tag v1.0.0
git push origin v1.0.0
```

That tag triggers the build and deployment. For the next release, use a new tag (for example `v1.0.1`).

GitHub Pages URL will be `https://<username>.github.io/<repository>/`. A custom domain can be configured later in Pages settings.
