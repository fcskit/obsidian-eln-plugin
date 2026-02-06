# Internal Developer Documentation

**Note:** This folder contains internal development documentation and is **not published** on the GitHub Pages documentation site (https://fcskit.github.io/obsidian-eln-plugin/).

These files are:
- ✅ **Version controlled in git** - Full history and collaboration support
- ✅ **Visible to contributors** - Anyone who clones the repo can see them
- ❌ **Hidden from GitHub Pages** - Not shown on the public documentation website

## Purpose

This internal documentation is for:
- Active development planning and tracking
- Detailed technical architecture notes
- Implementation guides and design decisions
- Historical context and migration reports

## Public Developer Documentation

For documentation that should be visible to the public (users, potential contributors, etc.), use:

**`docs/developer/public/`**

This folder is published on GitHub Pages and contains:
- Project roadmap
- Known issues
- Contributing guide
- Public-facing developer resources

## Structure

The internal documentation is organized as:

```
docs/developer/
├── public/              # ✅ Published on GitHub Pages
│   ├── index.md
│   ├── README.md
│   ├── ROADMAP.md
│   └── KNOWN-ISSUES.md
│
├── todos/               # ❌ Internal only
│   ├── active/
│   ├── completed/
│   └── planned/
│
├── core/                # ❌ Internal only
├── components/          # ❌ Internal only
├── guides/              # ❌ Internal only
├── infrastructure/      # ❌ Internal only
└── archive/             # ❌ Internal only
```

## Configuration

The exclusion is configured in `docs/_config.yml`:

```yaml
exclude:
  - developer/todos/
  - developer/archive/
  - developer/core/
  - developer/components/
  # ... etc
```

## Moving Docs Between Internal and Public

To make internal documentation public:

1. Move the file to `docs/developer/public/`
2. Remove the folder from the `exclude` list in `_config.yml` (if needed)
3. Update navigation links in `_layouts/default.html`
4. Commit and push - GitHub Pages will auto-deploy

---

**For Contributors:** Feel free to browse and use these internal docs when contributing to the project. They provide valuable context about implementation decisions and ongoing work.
