import { useState, useEffect } from 'react';
import { DiscoverRequest } from '../types';

interface DiscoverFormProps {
  onSubmit: (request: DiscoverRequest) => void;
  defaultRequest?: DiscoverRequest;
  category: 'grocery' | 'pizza';
}

export default function DiscoverForm({ onSubmit, defaultRequest, category }: DiscoverFormProps) {
  const [textSearch, setTextSearch] = useState(defaultRequest?.message.text_search || '');

  // Keep the text search in sync with the selected category and default request,
  // so switching between Grocery and Pizza pre-populates the appropriate example.
  useEffect(() => {
    const fallback =
      category === 'grocery' ? 'organic rice basmati' : 'veg pizza margherita';
    setTextSearch(defaultRequest?.message.text_search || fallback);
  }, [category, defaultRequest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const request: DiscoverRequest = {
      context: {
        version: '2.0.0',
        action: 'discover',
        domain: 'beckn.one:deg:retail:*',
        bap_id: category === 'grocery' ? 'grocery-app.example.com' : 'pizza-app.example.com',
        bap_uri: category === 'grocery'
          ? 'https://grocery-app.example.com/bap'
          : 'https://pizza-app.example.com/bap',
        transaction_id: `${category}-txn-001-${new Date().toISOString().split('T')[0]}`,
        message_id: `${category}-msg-001-${new Date().toISOString().split('T')[0]}`,
        timestamp: new Date().toISOString(),
        ttl: 'PT30S',
        schema_context: category === 'grocery'
          ? ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/main/schema/GroceryItem/v1/context.jsonld']
          : ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/main/schema/PizzaItem/v1/context.jsonld']
      },
      message: {
        text_search: textSearch,
        spatial: [
          {
            op: 's_dwithin',
            targets: "$['beckn:availableAt'][*]['geo']",
            geometry: {
              type: 'Point',
              coordinates: [77.5946, 12.9716]
            },
            distanceMeters: 5000
          }
        ],
        filters: {
          type: 'jsonpath',
          expression: category === 'grocery'
            ? "$[?(@.beckn:itemAttributes.dietaryClassification == 'veg' && @.beckn:itemAttributes.category == 'PACKAGED_COMMODITIES')]"
            : "$[?(@.beckn:itemAttributes.dietaryClassification == 'veg' && @.beckn:itemAttributes.category == 'PIZZA')]"
        }
      }
    };

    onSubmit(request);
  };

  return (
    <form onSubmit={handleSubmit} className="discover-form">
      <div className="form-group">
        <label htmlFor="textSearch">Search items</label>
        <input
          id="textSearch"
          type="text"
          value={textSearch}
          onChange={(e) => setTextSearch(e.target.value)}
          placeholder={category === 'grocery' ? 'e.g., organic rice basmati' : 'e.g., veg pizza margherita'}
        />
      </div>
      
      <button type="submit">Discover</button>
    </form>
  );
}

