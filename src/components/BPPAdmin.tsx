import { useState, useEffect } from 'react';
import './BPPAdmin.css';

const TUNNEL_API_URL = import.meta.env.VITE_TUNNEL_API_URL || '/api/tunnel/config';
const SUBSCRIBER_ID = import.meta.env.VITE_SUBSCRIBER_ID || 'http://34.100.242.30:8081/bpp/receiver';

export default function BPPAdmin() {
  const [tunnelingEnabled, setTunnelingEnabled] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch current tunneling status on mount
  useEffect(() => {
    const fetchTunnelingStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(TUNNEL_API_URL, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          // Assuming the API returns the tunnel status
          setTunnelingEnabled(data.tunnel === true);
        } else {
          // If GET fails, assume tunneling is disabled
          setTunnelingEnabled(false);
        }
      } catch (error) {
        console.error('Error fetching tunneling status:', error);
        // Default to disabled if fetch fails
        setTunnelingEnabled(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTunnelingStatus();
  }, []);

  const handleTunnelingToggle = async () => {
    const newState = !tunnelingEnabled;
    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(TUNNEL_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriber_id: SUBSCRIBER_ID,
          tunnel: newState
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update tunneling: ${response.status} ${response.statusText}. ${errorText}`);
      }

      // Update state only on success
      setTunnelingEnabled(newState);
    } catch (error: any) {
      console.error('Error toggling tunneling:', error);
      setError(error?.message || 'Failed to update tunneling configuration');
      // Don't update state on error - keep previous state
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="app-main bpp-admin-main">
      <div className="bpp-admin-container">
        <div className="bpp-admin-header">
          <h2 className="bpp-admin-title">BPP Configuration</h2>
          <p className="bpp-admin-subtitle">Manage Beckn Provider Platform settings</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="loading-message">Loading tunneling status...</div>
        ) : (
          <div className="tunneling-card">
          <div className="tunneling-card-header">
            <div className="tunneling-card-title-section">
              <div className="tunneling-icon">🔌</div>
              <div>
                <h3 className="tunneling-title">Tunneling Feature</h3>
                <p className="tunneling-description">
                  Enable or disable tunneling on the Beckn Provider Platform. When enabled, 
                  the BPP will use tunneling for network communication.
                </p>
              </div>
            </div>
            <div className="tunneling-toggle-section">
              <label className="tunneling-toggle-label">
                <input
                  type="checkbox"
                  checked={tunnelingEnabled}
                  onChange={handleTunnelingToggle}
                  disabled={isUpdating}
                  className="tunneling-toggle-input"
                />
                <span className={`tunneling-toggle-slider ${tunnelingEnabled ? 'enabled' : ''}`}>
                  <span className="tunneling-toggle-knob"></span>
                </span>
              </label>
              <span className={`tunneling-status ${tunnelingEnabled ? 'status-enabled' : 'status-disabled'}`}>
                {tunnelingEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
          
          {tunnelingEnabled && (
            <div className="tunneling-info">
              <div className="info-item">
                <span className="info-label">Status:</span>
                <span className="info-value status-active">Active</span>
              </div>
              <div className="info-item">
                <span className="info-label">Mode:</span>
                <span className="info-value">Tunneling</span>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </main>
  );
}

