# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Modus** - a Shopify theme built on Online Store 2.0 architecture, based on the Horizon theme (v3.2.1). It is a premium e-commerce theme featuring modern interactions, 3D product visualization, and extensive customization options.

## Development Commands

```bash
# Preview theme locally (requires Shopify CLI)
shopify theme dev

# Push theme to store
shopify theme push

# Pull latest theme from store
shopify theme pull

# Run theme check linting
shopify theme check

# Package theme for distribution
shopify theme package
```

## Architecture

### Directory Structure
- **layout/** - Base templates (`theme.liquid`, `password.liquid`) that wrap all pages
- **sections/** - Reusable page sections with schema definitions (JSON + Liquid)
- **blocks/** - Block components used within sections (prefixed with `_` for private blocks)
- **snippets/** - Reusable Liquid partials (prefixed with `_` for private snippets)
- **templates/** - JSON templates defining section composition for each page type
- **config/** - Theme settings schema and data (`settings_schema.json`, `settings_data.json`)
- **assets/** - JavaScript, CSS, images, and other static files
- **locales/** - Translation files (50+ languages supported)

### Section Groups
The theme uses section groups for consistent headers/footers:
- `header-group.json` - Header section configuration
- `footer-group.json` - Footer section configuration

### Key JavaScript Components
Located in `assets/`:
- `component.js` - Base web component class with lifecycle management
- `utilities.js` - Shared utility functions (header calculations, scroll handling)
- `events.js` - Custom event system for component communication
- `facets.js` - Collection filtering and sorting
- `product-form.js` - Product variant selection and cart additions

### CSS Architecture
- `base.css` - Core styles, CSS custom properties, and design tokens
- Component-specific CSS loaded via Liquid `{% stylesheet %}` tags
- CSS custom properties for theming (colors, typography, spacing)

### Naming Conventions
- Private blocks/snippets: prefixed with `_` (e.g., `_card.liquid`, `_accordion-row.liquid`)
- Public sections: no prefix (e.g., `header.liquid`, `hero.liquid`)
- JavaScript web components: kebab-case class names (e.g., `product-form`, `cart-drawer`)

### Translation Keys
Translations use namespaced keys in locales JSON files:
- `t:settings.*` - Theme setting labels
- `t:names.*` - Section/block names
- `t:content.*` - Static content strings
- `t:info.*` - Help text and info strings

## Key Patterns

### Section Schema
Sections use JSON schema at the bottom of `.liquid` files defining:
- Settings (inputs, toggles, selects)
- Blocks (repeatable content units)
- Presets (default configurations)

### Web Components
JavaScript follows custom element patterns extending `HTMLElement` with:
- `connectedCallback()` / `disconnectedCallback()` lifecycle
- Event delegation for dynamic content
- Integration with Shopify's Section Rendering API

### Transparent Header
The theme supports transparent headers with special CSS custom property calculations in `theme.liquid` and `utilities.js` that must be kept in sync.

## Agent Integration

A `shopify-theme-expert` agent is available (`.claude/agents/shopify-theme-expert.md`) for:
- Validating Liquid code against Shopify documentation
- Reviewing accessibility compliance (WCAG 2.1 AA)
- Ensuring Online Store 2.0 best practices
- Performance optimization recommendations

Invoke this agent after writing or modifying theme files.
