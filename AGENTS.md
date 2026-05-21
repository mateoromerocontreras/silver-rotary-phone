# AGENTS.md

## Cursor Cloud specific instructions

This is a Jekyll static blog using the **Chirpy** theme (v7.x), served via GitHub Pages.

### Running the dev server

```bash
cd /workspace
bundle exec jekyll serve --host 0.0.0.0 --port 4000
```

The site is then available at `http://localhost:4000/silver-rotary-phone/`.

### Building the site

```bash
bundle exec jekyll build
```

Output goes to `_site/`.

### Creating new posts

```bash
bundle exec jekyll post "Post Title"
```

Posts are created in `_posts/` with the correct date prefix and front matter.

### Known caveats

- **html-proofer failures for JS dist files**: Running `bundle exec htmlproofer _site` will report ~324 failures about missing `/assets/js/dist/*.min.js` files. This is expected — these assets are bundled in the theme gem and served dynamically during `jekyll serve`, but are not present as physical files in the built `_site` directory. The CI workflow handles this differently (the theme's build step produces these files).
- **Gem install path**: Gems are installed to `vendor/bundle` (via `bundle config --local path`) to avoid system permission issues. This directory is gitignored by Jekyll's default exclude patterns.
- **Ruby version**: The CI uses Ruby 3.3 but the site builds/serves fine with Ruby 3.2 (Ubuntu 24.04 system package).
- **Auto-regeneration**: The dev server watches for file changes and auto-regenerates. No restart needed when editing posts or config (though `_config.yml` changes require a server restart).
