import { useState, useEffect } from 'react';
import type { DiscoverRequest, CatalogResponse } from '../types';
import { generateUUID } from '../utils/uuid';

interface DiscoverFormProps {
  onDiscover: (catalogResponse: CatalogResponse | null, error: string | null) => void;
  onLoading?: (isLoading: boolean) => void;
  defaultRequest?: DiscoverRequest;
  category: 'grocery' | 'pizza';
  useLocalCatalog?: boolean;
}

const DISCOVER_API_URL = import.meta.env.VITE_DISCOVER_API_URL || '/api/beckn/discover';

export default function DiscoverForm({ onDiscover, onLoading, defaultRequest, category, useLocalCatalog = false }: DiscoverFormProps) {
  const [textSearch, setTextSearch] = useState(defaultRequest?.message.text_search || '');
  const [isLoading, setIsLoading] = useState(false);

  // Keep the text search in sync with the selected category and default request,
  // so switching between Grocery and Pizza pre-populates the appropriate example.
  useEffect(() => {
    const fallback =
      category === 'grocery' ? 'organic rice basmati' : 'veg pizza margherita';
    setTextSearch(defaultRequest?.message.text_search || fallback);
  }, [category, defaultRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure text search is not empty (only if using API)
    if (!useLocalCatalog && !textSearch.trim()) {
      const fallback = category === 'grocery' ? 'organic rice basmati' : 'veg pizza margherita';
      setTextSearch(fallback);
      onDiscover(null, 'Search text cannot be empty');
      return;
    }

    setIsLoading(true);
    onLoading?.(true); // Notify parent that we're loading

    // If using local catalog, skip API call
    if (useLocalCatalog) {
      setIsLoading(false);
      onLoading?.(false);
      onDiscover(null, null); // Signal to use local catalog
      return;
    }

    // Make API call
    const request: DiscoverRequest = {
      context: {
        version: '2.0.0',
        action: 'discover',
        domain: 'beckn.one:retail',
        bap_id: 'sandbox-retail-np1.com',
        bap_uri: 'https://sandbox-retail-np1.com/bap',
        transaction_id: generateUUID(),
        message_id: generateUUID(),
        timestamp: new Date().toISOString(),
        ttl: 'PT30S',
        schema_context: category === 'grocery'
          ? ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/draft/schema/GroceryItem/v1/context.jsonld#GroceryItem']
          : ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/draft/schema/FoodAndBeverageItem/v1/context.jsonld#FoodAndBeverageItem']
      },
      message: {
        text_search: textSearch.trim()
      }
    };

    try {
      console.log('Making API request to:', DISCOVER_API_URL);
      console.log('Request payload:', JSON.stringify(request, null, 2));
      
      const response = await fetch(DISCOVER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const catalogResponse = (await response.json()) as CatalogResponse;
      console.log('Successfully received catalog response');
      onDiscover(catalogResponse, null);
    } catch (error: any) {
      console.error('Discover API error:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to fetch catalog from API';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = 'Network error: Unable to connect to the API. This might be a CORS issue or the API server is unreachable.';
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      onDiscover(null, errorMessage);
    } finally {
      setIsLoading(false);
      onLoading?.(false);
    }
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
          required={!useLocalCatalog}
          disabled={isLoading || useLocalCatalog}
        />
      </div>
      
      <button type="submit" disabled={isLoading || (!useLocalCatalog && !textSearch.trim())}>
        {isLoading ? 'Discovering...' : 'Discover'}
      </button>
    </form>
  );
}

