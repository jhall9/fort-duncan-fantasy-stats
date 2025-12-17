# Deploying to GitHub Pages

This site is configured for automatic deployment to GitHub Pages using GitHub Actions.

## Setup Instructions

1. **Create a new repository on GitHub**
   - Go to https://github.com/new
   - Choose a repository name
   - Set visibility (public or private)
   - Do not initialize with README, .gitignore, or license

2. **Push your code to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin master
   ```

3. **Enable GitHub Pages**
   - Go to your repository on GitHub
   - Navigate to **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to "GitHub Actions"

4. **Wait for deployment**
   - The workflow will automatically run on your first push
   - Check the **Actions** tab to monitor progress
   - Once complete, your site will be live at `https://YOUR_USERNAME.github.io/` (or `https://YOUR_USERNAME.github.io/YOUR_REPO/` for project pages)

## Manual Deployment

You can also trigger a deployment manually:
1. Go to the **Actions** tab in your repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"

## Updating the Site

Simply push changes to the `master` branch and the site will automatically rebuild and deploy.

## Troubleshooting

- **Build fails**: Check the Actions tab for error logs
- **Site not updating**: Clear your browser cache or wait a few minutes for CDN propagation
- **404 errors on page refresh**: This is normal for client-side routing with static exports; navigation within the app works fine
