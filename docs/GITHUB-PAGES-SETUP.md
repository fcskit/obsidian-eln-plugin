# GitHub Pages Setup Instructions

This document contains instructions for setting up and maintaining the GitHub Pages documentation site for the Obsidian ELN Plugin.

## 🚀 Initial Setup (One-Time)

### 1. Enable GitHub Pages

1. Go to your GitHub repository: https://github.com/fcskit/obsidian-eln-plugin
2. Click **Settings** → **Pages** (in the left sidebar)
3. Under **Source**, select:
   - **Source**: GitHub Actions (recommended)
   - This allows the workflow to automatically deploy
4. Click **Save**

### 2. Commit and Push the Configuration

The following files have been created for GitHub Pages:

```
docs/
├── _config.yml          # Jekyll configuration
├── index.md             # Homepage
├── _layouts/
│   └── default.html     # Custom layout template
└── assets/
    └── css/
        └── custom.css   # Custom styling
.github/
└── workflows/
    └── deploy-pages.yml # GitHub Actions workflow
```

To activate GitHub Pages:

```bash
# Stage all new files
git add .github/workflows/deploy-pages.yml
git add docs/_config.yml
git add docs/index.md
git add docs/_layouts/
git add docs/assets/

# Commit
git commit -m "feat: setup GitHub Pages documentation site

- Add Jekyll configuration with Cayman theme
- Create custom homepage with features showcase
- Add navigation and custom styling
- Setup GitHub Actions workflow for auto-deployment
- Configure responsive design and mobile support"

# Push to GitHub
git push origin main
```

### 3. Wait for Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy GitHub Pages" workflow run
3. Once complete (green checkmark), your site will be live at:
   
   **https://fcskit.github.io/obsidian-eln-plugin/**

## 📝 Updating Documentation

### Automatic Deployment

Any changes pushed to the `docs/` folder in the `main` branch will automatically trigger a rebuild and deployment:

```bash
# Edit documentation files
vim docs/user/installation.md

# Commit and push
git add docs/user/installation.md
git commit -m "docs: update installation instructions"
git push origin main

# GitHub Actions will automatically rebuild and deploy
```

### Manual Trigger

You can also manually trigger deployment:

1. Go to **Actions** tab
2. Select "Deploy GitHub Pages" workflow
3. Click **Run workflow** button
4. Select `main` branch
5. Click **Run workflow**

## 🎨 Customization

### Changing the Theme

Edit `docs/_config.yml`:

```yaml
theme: jekyll-theme-cayman  # Change to: minimal, slate, architect, etc.
```

Available themes: https://pages.github.com/themes/

### Updating Navigation

Edit `docs/_layouts/default.html` to modify the navigation bar:

```html
<nav class="main-nav">
  <a href="{{ '/' | relative_url }}">Home</a>
  <a href="{{ '/user/' | relative_url }}">User Guide</a>
  <!-- Add more links here -->
</nav>
```

### Custom Styling

Edit `docs/assets/css/custom.css` to change colors, fonts, layouts, etc.

### Homepage Content

Edit `docs/index.md` to update the homepage content.

## 📁 Documentation Structure

```
docs/
├── index.md              # Homepage (what visitors see first)
├── README.md             # Documentation index (GitHub view)
├── user/                 # User documentation
│   ├── README.md         # User guide index
│   ├── installation.md   # Installation instructions
│   ├── features.md       # Features overview
│   └── ...
├── developer/            # Developer documentation
│   ├── README.md         # Developer guide index
│   └── ...
└── examples/             # Example templates and usage
```

## 🔍 Testing Locally

To test the site locally before pushing:

### Install Jekyll

```bash
# macOS
brew install ruby
gem install bundler jekyll

# Create Gemfile in docs/
cd docs/
cat > Gemfile << EOF
source 'https://rubygems.org'
gem 'github-pages', group: :jekyll_plugins
gem 'jekyll-relative-links'
gem 'jekyll-sitemap'
gem 'jekyll-seo-tag'
EOF

# Install dependencies
bundle install
```

### Run Local Server

```bash
cd docs/
bundle exec jekyll serve

# Visit: http://localhost:4000/obsidian-eln-plugin/
```

### Preview Changes

As you edit files, Jekyll will automatically rebuild. Refresh your browser to see changes.

## 🔧 Troubleshooting

### Site Not Deploying

1. **Check Actions tab** - Look for failed workflows
2. **Verify permissions** - Settings → Actions → Workflow permissions → Read/Write
3. **Check Pages settings** - Settings → Pages → Source should be "GitHub Actions"

### 404 Errors on Links

- Make sure `baseurl` in `_config.yml` is set correctly: `/obsidian-eln-plugin`
- Use `{{ '/path' | relative_url }}` for all internal links
- Check that markdown files have correct paths

### Images Not Showing

- Place images in `docs/assets/images/` or reference from root `../images/`
- Use relative paths: `![alt](../images/screenshot.png)`
- Or absolute: `![alt](/obsidian-eln-plugin/images/screenshot.png)`

### Styling Not Applied

1. Clear browser cache
2. Check `docs/assets/css/custom.css` is committed
3. Verify layout includes the custom CSS:
   ```html
   <link rel="stylesheet" href="{{ '/assets/css/custom.css' | relative_url }}">
   ```

## 📊 Monitoring

### Analytics (Optional)

Add Google Analytics to `docs/_config.yml`:

```yaml
google_analytics: UA-XXXXXXXXX-X
```

### Site Health

- Check deployment history: **Actions** tab
- Monitor 404 errors: GitHub Pages settings shows visit stats
- Test on mobile devices for responsiveness

## 🎯 Best Practices

1. **Keep documentation in sync** - Update docs when code changes
2. **Use relative links** - Ensures portability
3. **Test locally first** - Catch errors before deployment
4. **Write clear navigation** - Help users find what they need
5. **Add screenshots** - Visual aids improve understanding
6. **Mobile-friendly** - Test on different screen sizes
7. **SEO optimization** - Use descriptive titles and meta descriptions

## 🔗 Useful Links

- **Your Site**: https://fcskit.github.io/obsidian-eln-plugin/
- **Jekyll Documentation**: https://jekyllrb.com/docs/
- **GitHub Pages Guide**: https://docs.github.com/en/pages
- **Markdown Guide**: https://www.markdownguide.org/
- **Cayman Theme**: https://github.com/pages-themes/cayman

## 📮 Support

If you encounter issues with GitHub Pages:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review [Jekyll troubleshooting](https://jekyllrb.com/docs/troubleshooting/)
3. Check [Actions workflow logs](https://github.com/fcskit/obsidian-eln-plugin/actions)
