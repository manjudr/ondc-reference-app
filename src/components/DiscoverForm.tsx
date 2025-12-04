import { useState, useEffect } from 'react';
import type { DiscoverRequest, CatalogResponse } from '../types';

interface DiscoverFormProps {
  onDiscover: (catalogResponse: CatalogResponse | null, error: string | null) => void;
  defaultRequest?: DiscoverRequest;
  category: 'grocery' | 'pizza';
  useLocalCatalog?: boolean;
}

const DISCOVER_API_URL = import.meta.env.VITE_DISCOVER_API_URL || '/api/beckn/discover';

type SearchMode = 'text' | 'geo-expression';

export default function DiscoverForm({ onDiscover, defaultRequest, category, useLocalCatalog = false }: DiscoverFormProps) {
  const [searchMode, setSearchMode] = useState<SearchMode>('text');
  const [textSearch, setTextSearch] = useState(defaultRequest?.message.text_search || '');
  const [expression, setExpression] = useState('');
  const [coordinates, setCoordinates] = useState('');
  const [radius, setRadius] = useState(5000);
  const [coordinateError, setCoordinateError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Keep the text search in sync with the selected category and default request,
  // so switching between Grocery and Pizza pre-populates the appropriate example.
  useEffect(() => {
    const fallback =
      category === 'grocery' ? 'organic rice basmati' : 'veg pizza margherita';
    setTextSearch(defaultRequest?.message.text_search || fallback);
  }, [category, defaultRequest]);

  // Validate coordinates input (comma-separated lat,long)
  const validateCoordinates = (value: string): boolean => {
    if (!value.trim()) {
      setCoordinateError(null);
      return true; // Empty is valid (optional field)
    }
    
    // Remove spaces and split by comma
    const parts = value.replace(/\s/g, '').split(',');
    
    if (parts.length !== 2) {
      setCoordinateError('Please enter coordinates as: latitude,longitude (e.g., 12.9716,77.5946)');
      return false;
    }
    
    const [lat, lon] = parts;
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    
    if (isNaN(latNum) || isNaN(lonNum)) {
      setCoordinateError('Both values must be valid numbers');
      return false;
    }
    
    // Validate latitude range (-90 to 90)
    if (latNum < -90 || latNum > 90) {
      setCoordinateError('Latitude must be between -90 and 90');
      return false;
    }
    
    // Validate longitude range (-180 to 180)
    if (lonNum < -180 || lonNum > 180) {
      setCoordinateError('Longitude must be between -180 and 180');
      return false;
    }
    
    setCoordinateError(null);
    return true;
  };

  const handleCoordinatesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Only allow numbers, commas, spaces, and minus signs
    const validPattern = /^[\d\s,.-]*$/;
    if (!validPattern.test(value)) {
      return; // Don't update if invalid characters
    }
    
    setCoordinates(value);
    validateCoordinates(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs based on mode
    if (searchMode === 'text') {
      // Ensure text search is not empty (only if using API)
      if (!useLocalCatalog && !textSearch.trim()) {
        const fallback = category === 'grocery' ? 'organic rice basmati' : 'veg pizza margherita';
        setTextSearch(fallback);
        onDiscover(null, 'Search text cannot be empty');
        return;
      }
    } else {
      // GEO Expression mode: validate coordinates if provided
      if (coordinates.trim() && !validateCoordinates(coordinates)) {
        onDiscover(null, coordinateError || 'Invalid coordinates');
        return;
      }
      
      // At least one of expression or coordinates should be provided
      if (!expression.trim() && !coordinates.trim()) {
        onDiscover(null, 'Please provide either an expression or coordinates (or both)');
        return;
      }
    }

    setIsLoading(true);
    onDiscover(null, null); // Clear previous results

    // If using local catalog, skip API call
    if (useLocalCatalog) {
      setIsLoading(false);
      onDiscover(null, null); // Signal to use local catalog
      return;
    }

    // Build message based on search mode
    const message: DiscoverRequest['message'] = {};
    
    if (searchMode === 'text') {
      message.text_search = textSearch.trim();
    } else {
      // GEO Expression mode
      if (expression.trim()) {
        message.filters = {
          type: 'jsonpath',
          expression: expression.trim()
        };
      }
      
      if (coordinates.trim()) {
        const coords = coordinates.replace(/\s/g, '').split(',').map(Number);
        message.spatial = [
          {
            op: 's_dwithin',
            targets: "$['beckn:availableAt'][*]['geo']",
            geometry: {
              type: 'Point',
              coordinates: [coords[1], coords[0]] // Note: API expects [longitude, latitude]
            },
            distanceMeters: radius
          }
        ];
      }
    }

    // Make API call
    const request: DiscoverRequest = {
      context: {
        version: '2.0.0',
        action: 'discover',
        domain: 'beckn.one:retail',
        bap_id: 'sandbox-retail-np1.com',
        bap_uri: 'https://sandbox-retail-np1.com/bap',
        transaction_id: crypto.randomUUID(),
        message_id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        ttl: 'PT30S',
        schema_context: category === 'grocery'
          ? ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/draft/schema/GroceryItem/v1/context.jsonld#GroceryItem']
          : ['https://raw.githubusercontent.com/beckn/protocol-specifications-new/refs/heads/draft/schema/FoodAndBeverageItem/v1/context.jsonld#FoodAndBeverageItem']
      },
      message
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
    }
  };

  const isFormValid = () => {
    if (useLocalCatalog) return true;
    
    if (searchMode === 'text') {
      return textSearch.trim().length > 0;
    } else {
      if (coordinateError) return false;
      return expression.trim().length > 0 || coordinates.trim().length > 0;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="discover-form">
      {/* Toggle Bar */}
      <div className="search-mode-toggle">
        <button
          type="button"
          className={`toggle-option ${searchMode === 'text' ? 'toggle-active' : ''}`}
          onClick={() => setSearchMode('text')}
          disabled={isLoading}
        >
          Text Search
        </button>
        <button
          type="button"
          className={`toggle-option ${searchMode === 'geo-expression' ? 'toggle-active' : ''}`}
          onClick={() => setSearchMode('geo-expression')}
          disabled={isLoading}
        >
          GEO Expression
        </button>
      </div>

      {/* Text Search Mode */}
      {searchMode === 'text' && (
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
      )}

      {/* GEO Expression Mode */}
      {searchMode === 'geo-expression' && (
        <>
          <div className="form-group">
            <label htmlFor="expression">JSONPath Expression (optional)</label>
            <textarea
              id="expression"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder='e.g., $[?(@.beckn:itemAttributes.nutritionalInfo.nutrient==&quot;Sodium&quot; && @.beckn:itemAttributes.dietaryClassification == &quot;veg&quot;)]'
              rows={3}
              disabled={isLoading || useLocalCatalog}
              style={{ fontFamily: 'monospace', fontSize: '0.875rem' }}
            />
            <small style={{ color: '#64748b', fontSize: '0.8rem' }}>
              JSONPath expression for filtering items
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="coordinates">Coordinates (optional)</label>
            <input
              id="coordinates"
              type="text"
              value={coordinates}
              onChange={handleCoordinatesChange}
              placeholder="latitude,longitude (e.g., 12.9716,77.5946)"
              disabled={isLoading || useLocalCatalog}
            />
            {coordinateError && (
              <small style={{ color: '#dc2626', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
                {coordinateError}
              </small>
            )}
            <small style={{ color: '#64748b', fontSize: '0.8rem', display: 'block', marginTop: '0.25rem' }}>
              Enter as: latitude,longitude
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="radius">
              Radius: {radius.toLocaleString()} meters
            </label>
            <input
              id="radius"
              type="range"
              min="100"
              max="50000"
              step="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              disabled={isLoading || useLocalCatalog}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
              <span>100m</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
        </>
      )}
      
      <button 
        type="submit" 
        disabled={isLoading || (!useLocalCatalog && !isFormValid())}
      >
        {isLoading ? 'Discovering...' : 'Discover'}
      </button>
    </form>
  );
}

