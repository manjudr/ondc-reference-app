import { useState, useEffect } from 'react';
import './App.css';
import DiscoverForm from './components/DiscoverForm';
import CatalogView from './components/CatalogView';
import { DiscoverRequest, CatalogResponse, RendererConfig } from './types';

// Import sample discover requests (local), but fetch catalogs/renderers from remote spec URLs
import groceryDiscover from './data/grocery-discover.json';
import pizzaDiscover from './data/pizza-discover.json';

const GROCERY_CATALOG_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/examples/RetailGrocery/02_on_discover/grocery-catalog.json';
const PIZZA_CATALOG_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/examples/RetailPizza/02_on_discover/pizza-catalog.json';

const GROCERY_RENDERER_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/schema/GroceryItem/v1/renderer.json';
const PIZZA_RENDERER_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/schema/PizzaItem/v1/renderer.json';

function App() {
  const [currentCatalog, setCurrentCatalog] = useState<CatalogResponse | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<RendererConfig | null>(null);
  const [category, setCategory] = useState<'grocery' | 'pizza'>('grocery');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper to load catalog + renderer from remote URLs for a given category
  const loadCatalogAndRenderer = async (activeCategory: 'grocery' | 'pizza') => {
    setIsLoading(true);
    setError(null);
    try {
      const isGrocery = activeCategory === 'grocery';
      const [catalogRes, rendererRes] = await Promise.all([
        fetch(isGrocery ? GROCERY_CATALOG_URL : PIZZA_CATALOG_URL),
        fetch(isGrocery ? GROCERY_RENDERER_URL : PIZZA_RENDERER_URL),
      ]);

      if (!catalogRes.ok || !rendererRes.ok) {
        throw new Error('Failed to load catalog or renderer from remote specification URLs');
      }

      const catalogJson = (await catalogRes.json()) as CatalogResponse;
      const rendererJson = (await rendererRes.json()) as RendererConfig;

      setCurrentCatalog(catalogJson);
      setCurrentRenderer(rendererJson);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unexpected error while loading catalog');
      setCurrentCatalog(null);
      setCurrentRenderer(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscover = (request: DiscoverRequest) => {
    // In a real app, `request` would be POSTed to a BPP. Here we just
    // use it to trigger loading the appropriate sample catalog/renderer
    // from the ondc-schema branch of the spec repo.
    void loadCatalogAndRenderer(category);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <h1>ONDC Reference App</h1>
            <p>E-commerce frontend using Beckn Protocol</p>
          </div>
          <div className="app-header-badge">
            <span>Retail</span>
          </div>
        </div>
      </header>

      <main className="app-main two-column-layout">
        <section className="discover-pane">
          <div className="discover-card">
            <h2 className="pane-title">Discover Products</h2>
            <p className="pane-subtitle">
              Run sample Beckn <code>discover</code> requests for Grocery or Pizza and inspect the rendered catalog.
            </p>
            <DiscoverForm
              onSubmit={handleDiscover}
              category={category}
              defaultRequest={category === 'grocery' ? (groceryDiscover as DiscoverRequest) : (pizzaDiscover as DiscoverRequest)}
            />
            <div className="category-hint">
              <button
                type="button"
                className={`category-pill ${category === 'grocery' ? 'pill-active' : ''}`}
                onClick={() => setCategory('grocery')}
              >
                Grocery
              </button>
              <button
                type="button"
                className={`category-pill ${category === 'pizza' ? 'pill-active' : ''}`}
                onClick={() => setCategory('pizza')}
              >
                Pizza
              </button>
            </div>
          </div>
        </section>

        <section className="results-pane">
          <div className="results-card">
            <div className="results-header">
              <h2 className="pane-title">Search Results</h2>
              {!currentCatalog && !isLoading && !error && (
                <p className="results-empty">Run a discover to see matching offers.</p>
              )}
              {isLoading && <p className="results-empty">Loading catalog from spec repository…</p>}
              {error && <p className="results-empty" style={{ color: '#b91c1c' }}>{error}</p>}
            </div>

            {currentCatalog && currentRenderer && (
              <div className="results-content">
                {currentCatalog.message.catalogs.map((catalog) => (
                  <CatalogView
                    key={catalog['beckn:id']}
                    catalog={catalog}
                    rendererConfig={currentRenderer}
                    viewType="discoveryCard"
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
