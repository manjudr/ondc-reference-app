import { useState } from 'react';
import './ONDCAdmin.css';
import { generateUUID } from '../utils/uuid';
import type { DiscoverRequest, CatalogResponse } from '../types';
import LoadingSpinner from './LoadingSpinner';
import ItemCard from './ItemCard';
import groceryRendererLocal from '../data/grocery-renderer.json';
import pizzaRendererLocal from '../data/pizza-renderer.json';
import type { RendererConfig } from '../types';

const DISCOVER_API_URL = import.meta.env.VITE_DISCOVER_API_URL || '/api/beckn/discover';
const CREDENTIALS_API_URL = import.meta.env.VITE_CREDENTIALS_API_URL || '/api/credentials';

type CredentialType = 'provider' | 'item';

interface CredentialResponse {
  success: boolean;
  credentialId: string;
  credentialType: 'seller' | 'product';
  credential: {
    id: string;
    type: string[];
    proof: {
      type: string;
      created: string;
      proofValue: string;
      proofPurpose: string;
      verificationMethod: string;
    };
    issuer: string;
    '@context': string[];
    issuanceDate: string;
    expirationDate: string;
    credentialSubject: {
      id: string;
      type: string;
      [key: string]: any;
    };
  };
  pdf: {
    viewUrl: string;
    downloadUrl: string;
  };
  message: string;
}

interface IssuedCredential {
  credentialType: 'ONDCFiveStarSeller' | 'ONDCFastMovingProduct';
  created: string;
  viewUrl: string;
  message: string;
  credentialId: string;
}

interface Provider {
  'beckn:id': string;
  'beckn:descriptor': {
    '@type': string;
    'schema:name': string;
  };
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
}

const PROVIDERS: Provider[] = [
  {
    'beckn:id': 'fresh-grocery-store',
    'beckn:descriptor': {
      '@type': 'beckn:Descriptor',
      'schema:name': 'Fresh Grocery Store'
    },
    address: {
      streetAddress: 'Fresh Grocery Store, MG Road',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560001',
      addressCountry: 'IN'
    }
  },
  {
    'beckn:id': 'food-and-beverage-hut-store',
    'beckn:descriptor': {
      '@type': 'beckn:Descriptor',
      'schema:name': 'Food and Beverage Store'
    },
    address: {
      streetAddress: 'Food and Beverage Store, Indiranagar',
      addressLocality: 'Bengaluru',
      addressRegion: 'Karnataka',
      postalCode: '560038',
      addressCountry: 'IN'
    }
  }
];

export default function ONDCAdmin() {
  const [credentialType, setCredentialType] = useState<CredentialType>('provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [catalogResponse, setCatalogResponse] = useState<CatalogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isIssuingCredentials, setIsIssuingCredentials] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [issuedCredentials, setIssuedCredentials] = useState<IssuedCredential[]>([]);

  const fetchItemsByProvider = async (providerId: string) => {
    setIsLoading(true);
    setError(null);

    // Determine category based on provider
    const category = providerId === 'fresh-grocery-store' ? 'grocery' : 'pizza';

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
        filters: {
          type: 'jsonpath',
          expression: `$[?(@.beckn:provider.beckn:id=='${providerId}')]`
        }
      }
    };

    try {
      const response = await fetch(DISCOVER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const catalogResponse = (await response.json()) as CatalogResponse;
      setCatalogResponse(catalogResponse);
    } catch (error: any) {
      console.error('Error fetching items:', error);
      setError(error?.message || 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setCatalogResponse(null);
    setSelectedItems(new Set());
    fetchItemsByProvider(providerId);
  };

  const handleItemToggle = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (!catalogResponse) return;
    const allItemIds = new Set<string>();
    catalogResponse.message.catalogs.forEach(catalog => {
      catalog['beckn:items']?.forEach(item => {
        allItemIds.add(item['beckn:id']);
      });
    });
    
    if (selectedItems.size === allItemIds.size) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(allItemIds);
    }
  };

  const parseCredentialResponse = (response: CredentialResponse): IssuedCredential => {
    // Extract credential type from credential.type array
    const credentialTypeArray = response.credential.type;
    let credentialType: 'ONDCFiveStarSeller' | 'ONDCFastMovingProduct';
    
    if (credentialTypeArray.includes('ONDCFiveStarSeller')) {
      credentialType = 'ONDCFiveStarSeller';
    } else if (credentialTypeArray.includes('ONDCFastMovingProduct')) {
      credentialType = 'ONDCFastMovingProduct';
    } else {
      // Fallback: determine from credentialType field
      credentialType = response.credentialType === 'seller' ? 'ONDCFiveStarSeller' : 'ONDCFastMovingProduct';
    }

    return {
      credentialType,
      created: response.credential.proof.created,
      viewUrl: response.pdf.viewUrl,
      message: response.message,
      credentialId: response.credentialId
    };
  };

  const issueProviderCredentials = async (providerId: string, providerName: string) => {
    setIsIssuingCredentials(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(CREDENTIALS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'seller',
          sellerName: providerName,
          sellerId: providerId
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to issue credentials: ${response.status} ${response.statusText}. ${errorText}`);
      }

      const result = (await response.json()) as CredentialResponse;
      const parsedCredential = parseCredentialResponse(result);
      
      // Store the issued credential
      setIssuedCredentials(prev => [...prev, parsedCredential]);
      setSuccessMessage(`Successfully issued credentials for ${providerName}`);
      console.log('Provider credentials issued:', result);
    } catch (error: any) {
      console.error('Error issuing provider credentials:', error);
      setError(error?.message || 'Failed to issue provider credentials');
    } finally {
      setIsIssuingCredentials(false);
    }
  };

  const issueProductCredentials = async () => {
    if (selectedItems.size === 0 || !catalogResponse) return;

    setIsIssuingCredentials(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get all selected items from catalogs
      const itemsToIssue: any[] = [];
      catalogResponse.message.catalogs.forEach(catalog => {
        catalog['beckn:items']?.forEach(item => {
          if (selectedItems.has(item['beckn:id'])) {
            // Determine category based on provider
            const provider = PROVIDERS.find(p => p['beckn:id'] === selectedProvider);
            const category = provider?.['beckn:id'] === 'fresh-grocery-store' ? 'Grocery' : 'Food & Beverage';
            
            itemsToIssue.push({
              type: 'product',
              productName: item['beckn:descriptor']['schema:name'],
              productCategory: category,
              rating: item['beckn:rating']?.['beckn:ratingValue'] || 0,
              ratingCount: item['beckn:rating']?.['beckn:ratingCount'] || 0
            });
          }
        });
      });

      // Issue credentials for all selected items
      const promises = itemsToIssue.map(item => 
        fetch(CREDENTIALS_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(item),
        })
      );

      const responses = await Promise.all(promises);
      const errors: string[] = [];
      const issuedCreds: IssuedCredential[] = [];

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorText = await responses[i].text();
          errors.push(`Failed for ${itemsToIssue[i].productName}: ${errorText}`);
        } else {
          const result = (await responses[i].json()) as CredentialResponse;
          const parsedCredential = parseCredentialResponse(result);
          issuedCreds.push(parsedCredential);
        }
      }

      if (errors.length > 0 && issuedCreds.length === 0) {
        throw new Error(`Some credentials failed to issue:\n${errors.join('\n')}`);
      }

      // Store all successfully issued credentials
      if (issuedCreds.length > 0) {
        setIssuedCredentials(prev => [...prev, ...issuedCreds]);
      }

      if (errors.length > 0) {
        setError(`Some credentials failed to issue:\n${errors.join('\n')}`);
      } else {
        setSuccessMessage(`Successfully issued credentials for ${itemsToIssue.length} product(s)`);
      }
      
      setSelectedItems(new Set());
    } catch (error: any) {
      console.error('Error issuing product credentials:', error);
      setError(error?.message || 'Failed to issue product credentials');
    } finally {
      setIsIssuingCredentials(false);
    }
  };

  const getRendererConfig = (): RendererConfig => {
    const provider = PROVIDERS.find(p => p['beckn:id'] === selectedProvider);
    const isGrocery = provider?.['beckn:id'] === 'fresh-grocery-store';
    return (isGrocery ? groceryRendererLocal : pizzaRendererLocal) as unknown as RendererConfig;
  };

  const getAllItemsCount = (): number => {
    if (!catalogResponse) return 0;
    return catalogResponse.message.catalogs.reduce((count, catalog) => {
      return count + (catalog['beckn:items']?.length || 0);
    }, 0);
  };

  return (
    <main className="app-main admin-main">
      <div className="admin-container">
        <div className="admin-header">
          <h2 className="admin-title">Verifiable Credentials Issuance</h2>
          <p className="admin-subtitle">Issue Verifiable Credentials to a Seller or Product</p>
        </div>

        {/* Credential Type Toggle */}
        <div className="credential-type-toggle">
          <button
            type="button"
            className={`credential-toggle-btn ${credentialType === 'provider' ? 'active' : ''}`}
            onClick={() => {
              setCredentialType('provider');
              setSelectedProvider(null);
              setCatalogResponse(null);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            <span className="toggle-icon">🏪</span>
            <span className="toggle-label">Provider/Seller</span>
          </button>
          <button
            type="button"
            className={`credential-toggle-btn ${credentialType === 'item' ? 'active' : ''}`}
            onClick={() => {
              setCredentialType('item');
              setSelectedProvider(null);
              setCatalogResponse(null);
              setError(null);
              setSuccessMessage(null);
            }}
          >
            <span className="toggle-icon">📦</span>
            <span className="toggle-label">Product/Services</span>
          </button>
        </div>

        {/* Provider Credentials Section */}
        {credentialType === 'provider' && (
          <div className="credentials-section">
            <h3 className="section-title">Select Provider to Issue Credentials</h3>
            <div className="providers-grid">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider['beckn:id']}
                  className="provider-card"
                  onClick={() => {
                    // In provider mode, just show selection
                    setSelectedProvider(provider['beckn:id']);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                >
                  <div className="provider-card-header">
                    <div className="provider-icon">🏪</div>
                    <h4 className="provider-name">{provider['beckn:descriptor']['schema:name']}</h4>
                  </div>
                  <div className="provider-details">
                    <div className="provider-detail-item">
                      <span className="detail-label">ID:</span>
                      <span className="detail-value">{provider['beckn:id']}</span>
                    </div>
                    <div className="provider-detail-item">
                      <span className="detail-label">Address:</span>
                      <span className="detail-value">
                        {provider.address.streetAddress}, {provider.address.addressLocality}
                      </span>
                    </div>
                    <div className="provider-detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">
                        {provider.address.addressRegion} {provider.address.postalCode}
                      </span>
                    </div>
                  </div>
                  <button 
                    className="issue-credential-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      issueProviderCredentials(provider['beckn:id'], provider['beckn:descriptor']['schema:name']);
                    }}
                    disabled={isIssuingCredentials}
                  >
                    {isIssuingCredentials ? 'Issuing...' : 'Issue Credential'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Item Credentials Section */}
        {credentialType === 'item' && (
          <div className="credentials-section">
            {!selectedProvider ? (
              <>
                <h3 className="section-title">Select Provider to View Items</h3>
                <div className="providers-grid">
                  {PROVIDERS.map((provider) => (
                    <div
                      key={provider['beckn:id']}
                      className="provider-card"
                      onClick={() => handleProviderSelect(provider['beckn:id'])}
                    >
                      <div className="provider-card-header">
                        <div className="provider-icon">🏪</div>
                        <h4 className="provider-name">{provider['beckn:descriptor']['schema:name']}</h4>
                      </div>
                      <div className="provider-details">
                        <div className="provider-detail-item">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">{provider['beckn:id']}</span>
                        </div>
                        <div className="provider-detail-item">
                          <span className="detail-label">Address:</span>
                          <span className="detail-value">
                            {provider.address.streetAddress}, {provider.address.addressLocality}
                          </span>
                        </div>
                        <div className="provider-detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">
                            {provider.address.addressRegion} {provider.address.postalCode}
                          </span>
                        </div>
                      </div>
                      <button className="select-provider-btn">
                        Select Provider
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="selected-provider-banner">
                  <button
                    className="back-button"
                    onClick={() => {
                      setSelectedProvider(null);
                      setCatalogResponse(null);
                    }}
                  >
                    ← Back
                  </button>
                  <div className="selected-provider-info">
                    <span className="selected-label">Selected Provider:</span>
                    <span className="selected-name">
                      {PROVIDERS.find(p => p['beckn:id'] === selectedProvider)?.['beckn:descriptor']['schema:name']}
                    </span>
                  </div>
                </div>

                {isLoading && <LoadingSpinner message="Loading items..." />}
                
                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                {successMessage && (
                  <div className="success-message">
                    {successMessage}
                  </div>
                )}

                {issuedCredentials.length > 0 && (
                  <div className="issued-credentials-section">
                    <h3 className="section-title">Issued Credentials</h3>
                    <div className="credentials-list">
                      {issuedCredentials.map((cred, index) => (
                        <div key={index} className="credential-card">
                          <div className="credential-main-content">
                            <div className="credential-info">
                              <div className="credential-type-badge">
                                {cred.credentialType === 'ONDCFiveStarSeller' ? '⭐ Five Star Seller' : '🚀 Fast Moving Product'}
                              </div>
                              <div className="credential-details">
                                <div className="credential-message">
                                  {cred.message}
                                </div>
                                <div className="credential-meta">
                                  <div className="credential-meta-item">
                                    <span className="meta-label">Issued:</span>
                                    <span className="meta-value">{new Date(cred.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                  </div>
                                  <div className="credential-meta-item">
                                    <span className="meta-label">ID:</span>
                                    <span className="meta-value credential-id">{cred.credentialId}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <a
                              href={cred.viewUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-pdf-icon"
                              title="View PDF"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M14 2V8H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 13H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M10 9H9H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isLoading && !error && catalogResponse && catalogResponse.message.catalogs.length > 0 && (
                  <div className="items-section">
                    <div className="items-section-header">
                      <h3 className="section-title">Select Products/Services to Issue Credentials</h3>
                      <div className="items-actions">
                        <button
                          type="button"
                          className="select-all-btn"
                          onClick={handleSelectAll}
                        >
                          {selectedItems.size > 0 && selectedItems.size === getAllItemsCount() ? 'Deselect All' : 'Select All'}
                        </button>
                        {selectedItems.size > 0 && (
                          <div className="selected-count-badge">
                            {selectedItems.size} selected
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="results-content">
                      {catalogResponse.message.catalogs.map((catalog) => (
                        <div key={catalog['beckn:id']} className="catalog-view">
                          <div className="catalog-header">
                            <h2>{catalog['beckn:descriptor']['schema:name']}</h2>
                            {catalog['beckn:descriptor']['beckn:shortDesc'] && (
                              <p>{catalog['beckn:descriptor']['beckn:shortDesc']}</p>
                            )}
                          </div>
                          <div className="items-grid">
                            {catalog['beckn:items']?.map((item) => (
                              <div key={item['beckn:id']} className="selectable-item-wrapper">
                                <label className="item-checkbox-label">
                                  <input
                                    type="checkbox"
                                    checked={selectedItems.has(item['beckn:id'])}
                                    onChange={() => handleItemToggle(item['beckn:id'])}
                                    className="item-checkbox"
                                  />
                                  <div className={`item-card-wrapper ${selectedItems.has(item['beckn:id']) ? 'selected' : ''}`}>
                                    <ItemCard
                                      item={item}
                                      catalog={catalog}
                                      rendererConfig={getRendererConfig()}
                                      viewType="discoveryCard"
                                    />
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {selectedItems.size > 0 && (
                      <div className="issue-credentials-footer">
                        <div className="selected-summary">
                          {selectedItems.size} product{selectedItems.size !== 1 ? 's' : ''}/service{selectedItems.size !== 1 ? 's' : ''} selected
                        </div>
                        <button
                          type="button"
                          className="issue-credentials-btn-large"
                          onClick={issueProductCredentials}
                          disabled={isIssuingCredentials}
                        >
                          {isIssuingCredentials ? 'Issuing Credentials...' : 'Issue Credentials for Selected Products/Services'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!isLoading && !error && catalogResponse && catalogResponse.message.catalogs.length === 0 && (
                  <div className="no-items-message">
                    No items found for this provider.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

