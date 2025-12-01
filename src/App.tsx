import { useState, useEffect } from 'react';
import './App.css';
import DiscoverForm from './components/DiscoverForm';
import CatalogView from './components/CatalogView';
import { DiscoverRequest, CatalogResponse, RendererConfig } from './types';

// Import data files
import groceryDiscover from './data/grocery-discover.json';
import groceryCatalog from './data/grocery-catalog.json';
import pizzaDiscover from './data/pizza-discover.json';
import pizzaCatalog from './data/pizza-catalog.json';
import groceryRenderer from './data/grocery-renderer.json';
import pizzaRenderer from './data/pizza-renderer.json';

function App() {
  const [currentCatalog, setCurrentCatalog] = useState<CatalogResponse | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<RendererConfig | null>(null);
  const [category, setCategory] = useState<'grocery' | 'pizza'>('grocery');

  // Load renderer configs
  useEffect(() => {
    if (category === 'grocery') {
      setCurrentRenderer(groceryRenderer as RendererConfig);
    } else {
      setCurrentRenderer(pizzaRenderer as RendererConfig);
    }
  }, [category]);

  const handleDiscover = (request: DiscoverRequest) => {
    // Simulate API call - in real app, this would be an actual API call
    // For now, we'll use the static catalog responses
    setTimeout(() => {
      if (category === 'grocery') {
        setCurrentCatalog(groceryCatalog as CatalogResponse);
        setCurrentRenderer(groceryRenderer as RendererConfig);
      } else {
        setCurrentCatalog(pizzaCatalog as CatalogResponse);
        setCurrentRenderer(pizzaRenderer as RendererConfig);
      }
    }, 500);
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
              {!currentCatalog && <p className="results-empty">Run a discover to see matching offers.</p>}
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
