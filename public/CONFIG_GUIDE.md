# Configuration Guide

This guide explains the structure and common patterns in the `config.json` file for the ONDC Reference Application.

## Overview

The application uses a multi-tenant configuration system where each "endpoint" (e.g., `/retail`, `/evcharging`, `/healthcare`) has its own complete theme and view configuration. This allows you to run multiple domain-specific instances from a single deployment.

## Configuration Structure

```json
[
    {
        "endpoint": "/retail",     // URL path for this configuration
        "app": { ... },            // Browser metadata (title, favicon)
        "theme": { ... },          // Visual theme settings
        "layout": { ... },         // Header and sidebar configuration
        "network": { ... },        // Beckn protocol domain
        "schemas": { ... },        // Schema registry for this domain
        "views": { ... }           // Page configurations (discovery, catalog-publish)
    },
    // ... additional configurations for other endpoints
]
```

## Common Values Across All Themes

The following values are **identical** across all three reference themes (Retail, EV Charging, Healthcare). When creating a new theme, these are good defaults to start with:

### Discovery Panel Styling

```json
"theme": {
    "discovery": {
        "locationBgOpacity": 0.08,
        "radiusBgOpacity": 0.10,
        "jsonpathBgOpacity": 0.12,
        "borderOpacity": 0.20
    }
}
```

**Purpose**: Controls the visual appearance of the Discovery view's input sections (Location, Radius, JSONPath). These opacity values create subtle backgrounds that work well on any color scheme.

### Common Icons

```json
"theme": {
    "icons": {
        "upload": "CloudUpload",
        "success": "CheckCircle"
    }
}
```

**Note**: Other icons (`appLogo`, `heroSearch`, `networkDiscovery`, `publish`) are theme-specific.

### Common API Endpoints

```json
"views": {
    "discovery": {
        "api": "/beckn/discover",
        "context": {
            "action": "discover"
        }
    },
    "catalog-publish": {
        "api": "/beckn/v2/catalog/publish",
        "context": {
            "action": "catalog_publish",
            "ttl": "PT30S"
        }
    }
}
```

### Palette Defaults

```json
"palette": {
    "primary": {
        "contrastText": "#ffffff"  // White text on primary color
    },
    "background": {
        "paper": "#ffffff"         // White for cards/modals
    }
}
```

### Shape Recommendations

While themes can vary, most use similar values:

```json
"shape": {
    "borderRadius": 12,      // Standard: 12-16px
    "searchBarRadius": 40,   // Standard: 40-50px (very round)
    "buttonRadius": 20       // Standard: 20-24px
}
```

## Theme Customization Guide

### Creating a New Theme

1. **Copy an existing configuration** (e.g., Retail)
2. **Update the endpoint**: Choose a unique path like `/mobility`
3. **Customize colors**:
   - `palette.primary.main`: Your brand color
   - Derive `light`/`dark` variants (use a color tool)
   - Adjust `background.default` for subtle tinting
4. **Choose typography**: Select a Google Font or system font stack
5. **Configure icons**: Pick Material Icons that match your domain
6. **Customize labels**: Update all `labels` in views to match your domain language

### Color Selection Tips

- **Primary color**: Should be your brand's main color with enough contrast for white text
- **Light variant**: ~20-30% lighter than main (for hover states, backgrounds)
- **Dark variant**: ~20-30% darker than main (for emphasis, pressed states)
- **Action colors**: Use your primary color with low opacity (0.05-0.12) for hover/selected states

### Typography Hierarchy

```json
"typography": {
    "fontFamily": "'Your Font', fallback1, fallback2, sans-serif",
    "h3": {
        "fontSize": "2.25rem",  // Hero headings
        "fontWeight": 700
    },
    "h4": {
        "fontSize": "1.25rem",  // Section headings
        "fontWeight": 600
    }
}
```

## View Configuration Patterns

### Discovery View

The Discovery view supports two modes:
- **AI Search**: Natural language search with AI assistance
- **Network Discovery**: Manual filtering with location, radius, and JSONPath

**Common fields**:
```json
"discovery": {
    "type": "search",
    "api": "/beckn/discover",
    "search": {
        "radius": 1000  // Default search radius in meters (varies by domain)
    },
    "filters": [
        // Category or connector type filters
    ]
}
```

**Domain-specific**:
- Retail: `radius: 1000` (1km for grocery delivery)
- EV Charging: `radius: 5000` (5km for finding stations)
- Healthcare: `radius: 10000` (10km for finding doctors/labs)

### Catalog Publish View

Identical across all themes:
```json
"catalog-publish": {
    "type": "form",
    "api": "/beckn/v2/catalog/publish",
    "context": {
        "action": "catalog_publish",
        "ttl": "PT30S"
    }
}
```

Only the **labels** change per domain to provide context-appropriate terminology.

## Schema Validation

The `config.schema.json` file provides:
- **Type safety**: Ensures all fields are the correct type
- **Defaults**: Common values are defined as defaults
- **Descriptions**: Inline documentation for each field
- **Validation**: Requires essential fields, validates color formats and URLs

### Using the Schema

In VS Code or compatible editors:
1. The `"$schema": "./config.schema.json"` reference enables autocomplete
2. Hover over any field to see its description
3. Get warnings for missing required fields or invalid values

## Best Practices

### DO:
✅ Use descriptive, domain-specific labels throughout  
✅ Test your theme on both desktop and mobile viewports  
✅ Ensure sufficient color contrast (use a contrast checker tool)  
✅ Keep common values (discovery opacities, common icons) consistent  
✅ Use semantic color names in your palette  

### DON'T:
❌ Hardcode colors in multiple places (use the palette)  
❌ Use extremely small font sizes (minimum 0.75rem)  
❌ Create too many border radius variations (3 is enough)  
❌ Forget to update all labels when changing domains  
❌ Use custom icons without ensuring they exist in Material Icons  

## Troubleshooting

### Icons not showing?
- Verify the icon name exists in [Material Icons](https://fonts.google.com/icons)
- Icon names are case-sensitive (e.g., `CloudUpload`, not `cloudupload`)

### Colors look wrong?
- Check contrast ratios (minimum 4.5:1 for text)
- Ensure `contrastText` is readable on your primary color
- Test in both light and dark mode if supported

### Schema validation errors?
- Check for missing commas or quotes in JSON
- Verify all required fields are present
- Ensure color values match the pattern: `#RRGGBB` or `rgba(...)`

## Example: Creating a "Mobility" Theme

```json
{
    "endpoint": "/mobility",
    "app": {
        "title": "Mobility Network",
        "logo": "/assets/mobility-logo.png",
        "favicon": "/favicon.ico"
    },
    "theme": {
        "mode": "light",
        "palette": {
            "primary": {
                "main": "#0066cc",
                "light": "#3385d6",
                "dark": "#004a99",
                "contrastText": "#ffffff"
            }
        },
        "icons": {
            "appLogo": "DirectionsCar",
            "heroSearch": "Search",
            "networkDiscovery": "Map",
            "upload": "CloudUpload",
            "publish": "Publish",
            "success": "CheckCircle"
        },
        "discovery": {
            "locationBgOpacity": 0.08,
            "radiusBgOpacity": 0.10,
            "jsonpathBgOpacity": 0.12,
            "borderOpacity": 0.20
        }
    },
    // ... rest of configuration
}
```

---

For more information, refer to the inline comments in `config.schema.json` or explore the existing theme configurations in `config.json`.
