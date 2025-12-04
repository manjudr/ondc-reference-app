import { useState } from 'react';
import './App.css';
import DiscoverForm from './components/DiscoverForm';
import CatalogView from './components/CatalogView';
import LoadingSpinner from './components/LoadingSpinner';
import type { DiscoverRequest, CatalogResponse, RendererConfig } from './types';

// Import sample discover requests (local)
import groceryDiscover from './data/grocery-discover.json';
import pizzaDiscover from './data/pizza-discover.json';

// Import local catalog files for local testing
import groceryCatalogLocal from './data/grocery-catalog-large.json';
import pizzaCatalogLocal from './data/food-and-beverage-catalog-large.json';

// Import local renderer files for local testing
import groceryRendererLocal from './data/grocery-renderer.json';
import pizzaRendererLocal from './data/pizza-renderer.json';

// GitHub URLs for remote renderer fetching
const GROCERY_RENDERER_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/schema/GroceryItem/v1/renderer.json';
const PIZZA_RENDERER_URL =
  'https://raw.githubusercontent.com/beckn/protocol-specifications-new/ondc-schema/schema/FoodAndBeverageItem/v1/renderer.json';

// Toggle between local and GitHub sources
// Set VITE_USE_LOCAL_DATA=true in .env file or use the UI toggle
const USE_LOCAL_DATA = import.meta.env.VITE_USE_LOCAL_DATA === 'true';

function App() {
  const [currentCatalog, setCurrentCatalog] = useState<CatalogResponse | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<RendererConfig | null>(null);
  const [category, setCategory] = useState<'grocery' | 'pizza'>('grocery');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useLocalCatalog, setUseLocalCatalog] = useState(USE_LOCAL_DATA);
  const [useLocalRenderer, setUseLocalRenderer] = useState(USE_LOCAL_DATA);


  const handleDiscover = async (catalogResponse: CatalogResponse | null, error: string | null) => {
    setError(null);

    try {
      if (useLocalCatalog) {
        // Use local catalog data
        const isGrocery = category === 'grocery';
        const localCatalog = (isGrocery ? groceryCatalogLocal : pizzaCatalogLocal) as unknown as CatalogResponse;
        setCurrentCatalog(localCatalog);
        // Load the renderer based on category
        await loadRenderer(category);
      } else {
        // Use API response
        if (error) {
          setError(error);
          setCurrentCatalog(null);
          setCurrentRenderer(null);
          return;
        }

        if (catalogResponse) {
          setCurrentCatalog(catalogResponse);
          // Load the renderer based on category
          await loadRenderer(category);
        }
        // If catalogResponse is null and no error, we're still loading (handled by loading state)
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unexpected error');
      setCurrentCatalog(null);
      setCurrentRenderer(null);
    }
  };

  // Helper to load only the renderer
  const loadRenderer = async (activeCategory: 'grocery' | 'pizza') => {
    try {
      const isGrocery = activeCategory === 'grocery';
      
      if (useLocalRenderer) {
        // Use local renderer file
        const rendererJson = (isGrocery ? groceryRendererLocal : pizzaRendererLocal) as unknown as RendererConfig;
        setCurrentRenderer(rendererJson);
      } else {
        // Fetch renderer from GitHub URL
        const rendererRes = await fetch(isGrocery ? GROCERY_RENDERER_URL : PIZZA_RENDERER_URL);
        
        if (!rendererRes.ok) {
          throw new Error('Failed to load renderer from remote specification URL');
        }

        const rendererJson = (await rendererRes.json()) as RendererConfig;
        setCurrentRenderer(rendererJson);
      }
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'Unexpected error while loading renderer');
      setCurrentRenderer(null);
      throw e;
    }
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
              onDiscover={handleDiscover}
              onLoading={setIsLoading}
              category={category}
              defaultRequest={category === 'grocery' ? (groceryDiscover as DiscoverRequest) : (pizzaDiscover as DiscoverRequest)}
              useLocalCatalog={useLocalCatalog}
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
                Food & Beverage
              </button>
            </div>
            <div className="data-source-toggle" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <input
                    type="checkbox"
                    checked={useLocalCatalog}
                    onChange={(e) => {
                      setUseLocalCatalog(e.target.checked);
                      setCurrentCatalog(null);
                      setCurrentRenderer(null);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Use local catalog data</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>
                  <input
                    type="checkbox"
                    checked={useLocalRenderer}
                    onChange={(e) => {
                      setUseLocalRenderer(e.target.checked);
                      setCurrentRenderer(null);
                    }}
                    style={{ cursor: 'pointer' }}
                  />
                  <span>Use local renderer</span>
                </label>
              </div>
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
              {error && <p className="results-empty" style={{ color: '#b91c1c' }}>{error}</p>}
            </div>

            {isLoading && (
              <LoadingSpinner message={useLocalCatalog ? 'Loading local catalog...' : 'Discovering products...'} />
            )}

            {!isLoading && currentCatalog && currentRenderer && (
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
