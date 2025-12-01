# ONDC Reference App

A simple e-commerce frontend application built with React, Vite, and TypeScript that demonstrates the use of Beckn Protocol specifications for retail products (Grocery and Pizza).

## Features

- **Discover Products**: Search for grocery items or pizza using the Beckn Protocol discover API format
- **Dynamic Rendering**: Uses renderer.json templates to dynamically render product cards
- **Category Support**: Supports both Grocery and Pizza item types with their respective renderers
- **Responsive UI**: Modern, clean interface with CSS styling

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Handlebars** - Template rendering engine

## Project Structure

```
ondc-reference-app/
├── src/
│   ├── components/          # React components
│   │   ├── DiscoverForm.tsx # Search/discover form
│   │   ├── ItemCard.tsx     # Individual item card renderer
│   │   └── CatalogView.tsx  # Catalog display component
│   ├── data/                # JSON data files
│   │   ├── grocery-discover.json
│   │   ├── grocery-catalog.json
│   │   ├── pizza-discover.json
│   │   ├── pizza-catalog.json
│   │   ├── grocery-renderer.json
│   │   └── pizza-renderer.json
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── templateRenderer.ts
│   ├── App.tsx              # Main app component
│   ├── App.css              # App styles
│   ├── index.css            # Global styles
│   └── main.tsx             # Entry point
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## How It Works

1. **Discover Request**: User selects a category (Grocery or Pizza) and enters a search query
2. **Catalog Response**: The app simulates an API call and returns the corresponding catalog JSON
3. **Template Rendering**: The catalog items are rendered using the appropriate renderer.json template
4. **Dynamic Display**: Each item card is dynamically generated based on the template HTML and data paths

## Data Sources

The app uses example JSON files from the `protocol-specifications-new` repository:

- **Discover Requests**: `examples/RetailGrocery/01_discover/grocery-discover.json` and `examples/RetailPizza/01_discover/pizza-discover.json`
- **Catalog Responses**: `examples/RetailGrocery/02_on_discover/grocery-catalog.json` and `examples/RetailPizza/02_on_discover/pizza-catalog.json`
- **Renderer Configs**: `schema/GroceryItem/v1/renderer.json` and `schema/PizzaItem/v1/renderer.json`

## Template Rendering

The app uses Handlebars templates defined in the renderer.json files. The template renderer:

- Transforms colon-separated property paths (e.g., `beckn:id`) to bracket notation for Handlebars
- Supports nested properties (e.g., `beckn:descriptor.schema:name`)
- Handles array access (e.g., `beckn:offers[0].beckn:price.value`)
- Applies custom helpers for conditionals, loops, and formatting

## License

This project is part of the ONDC/Beckn Protocol reference implementation.
