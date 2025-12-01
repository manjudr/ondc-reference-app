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
    // Determine category from request
    const isGrocery = request.context.bap_id.includes('grocery');
    setCategory(isGrocery ? 'grocery' : 'pizza');

    // Simulate API call - in real app, this would be an actual API call
    // For now, we'll use the static catalog responses
    setTimeout(() => {
      if (isGrocery) {
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
        <h1>ONDC Reference App</h1>
        <p>E-commerce Frontend using Beckn Protocol</p>
      </header>

      <main className="app-main">
        <section className="discover-section">
          <h2>Discover Products</h2>
          <DiscoverForm 
            onSubmit={handleDiscover}
            defaultRequest={category === 'grocery' ? groceryDiscover as DiscoverRequest : pizzaDiscover as DiscoverRequest}
          />
        </section>

        {currentCatalog && currentRenderer && (
          <section className="results-section">
            <h2>Search Results</h2>
            {currentCatalog.message.catalogs.map((catalog) => (
              <CatalogView
                key={catalog['beckn:id']}
                catalog={catalog}
                rendererConfig={currentRenderer}
                viewType="discoveryCard"
              />
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
