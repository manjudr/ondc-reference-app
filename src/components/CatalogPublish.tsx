import { useState, useRef, ChangeEvent, DragEvent } from 'react';
import { generateUUID } from '../utils/uuid';
import './CatalogPublish.css';

const CATALOG_PUBLISH_API_URL = 'https://34.93.141.21.sslip.io/beckn/catalog/publish';

// Default values as per the curl command sample
const DEFAULT_BPP_ID = 'driver-provider-demo.app';
const DEFAULT_BPP_URI = 'https://provider.demo.app/callbacks';

interface CatalogPublishProps { }

export default function CatalogPublish({ }: CatalogPublishProps) {
  const [file, setFile] = useState<File | null>(null);
  const [jsonContent, setJsonContent] = useState<any[] | null>(null);
  const [bppId, setBppId] = useState(DEFAULT_BPP_ID);
  const [bppUri, setBppUri] = useState(DEFAULT_BPP_URI);

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.json')) {
      setUploadStatus('error');
      setUploadMessage('Please select a JSON file');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('idle');
    setUploadMessage('');

    // Read and parse JSON
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          throw new Error('JSON file must contain an array of catalog objects');
        }

        setJsonContent(parsed);
      } catch (error: any) {
        setUploadStatus('error');
        setUploadMessage(`Invalid JSON file: ${error.message}`);
        setJsonContent(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setJsonContent(null);
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!file || !jsonContent) {
      setUploadStatus('error');
      setUploadMessage('Please select a valid JSON file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const timestamp = new Date().toISOString();
      const messageId = generateUUID();
      const transactionId = generateUUID();

      const payload = {
        context: {
          version: "2.0.0",
          action: "catalog_publish",
          timestamp: timestamp,
          message_id: messageId,
          transaction_id: transactionId,
          ttl: "PT30S",
          bpp_id: bppId,
          bpp_uri: bppUri
        },
        message: {
          catalogs: jsonContent
        }
      };

      console.log('Publishing catalog payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(CATALOG_PUBLISH_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Publish failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      // Try to parse response if it's JSON, otherwise ignore
      try {
        await response.json();
      } catch (e) {
        // Ignore JSON parse error of response
      }

      setUploadStatus('success');
      setUploadMessage('Catalog published successfully!');

    } catch (error: any) {
      console.error('Catalog publish error:', error);
      setUploadStatus('error');
      setUploadMessage(error?.message || 'Failed to publish catalog. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-header">
        <h2 className="pane-title">Publish Catalog</h2>
        <p className="pane-subtitle">
          Upload a JSON file containing an array of catalog objects
        </p>
      </div>

      <div className="catalog-form-section">
        <div className="catalog-form-group">
          <label htmlFor="bpp_id">BPP ID</label>
          <input
            type="text"
            id="bpp_id"
            value={bppId}
            onChange={(e) => setBppId(e.target.value)}
            placeholder="e.g., driver-provider-demo.app"
          />
        </div>
        <div className="catalog-form-group">
          <label htmlFor="bpp_uri">BPP URI</label>
          <input
            type="text"
            id="bpp_uri"
            value={bppUri}
            onChange={(e) => setBppUri(e.target.value)}
            placeholder="e.g., https://provider.demo.app/callbacks"
          />
        </div>
      </div>

      {/* File Upload Area */}
      <div className="csv-upload-section">
        <div
          className={`csv-drop-zone ${isDragging ? 'csv-drop-zone-active' : ''} ${file ? 'csv-drop-zone-has-file' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInputChange}
            className="csv-file-input"
            id="csv-file-input"
          />

          {!file ? (
            <div className="csv-drop-zone-content">
              <div className="csv-drop-zone-icon">📄</div>
              <p className="csv-drop-zone-text">
                Drag and drop your JSON file here, or{' '}
                <button type="button" onClick={handleBrowseClick} className="csv-browse-link">
                  browse
                </button>
              </p>
              <p className="csv-drop-zone-hint">Supports JSON files only</p>
            </div>
          ) : (
            <div className="csv-file-info">
              <div className="csv-file-icon">✓</div>
              <div className="csv-file-details">
                <p className="csv-file-name">{file.name}</p>
                <p className="csv-file-size">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button type="button" onClick={handleReset} className="csv-remove-button">
                Remove
              </button>
            </div>
          )}
        </div>
      </div>

      {/* JSON Preview - Simple valid check */}
      {file && jsonContent && (
        <div className="csv-preview-section">
          <div className="csv-preview-note" style={{ borderTop: 'none', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
            ✓ Valid JSON detected. Contains <strong>{jsonContent.length}</strong> catalog object(s) with <strong>{jsonContent.reduce((acc, cat) => acc + (cat['beckn:items']?.length || 0), 0)}</strong> total items.
          </div>
        </div>
      )}

      {/* Submit Button and Status */}
      <div className="csv-upload-actions">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          disabled={!file || !jsonContent || isUploading}
          className="csv-submit-button"
        >
          {isUploading ? 'Publishing...' : 'Publish Catalog'}
        </button>

        {uploadStatus === 'error' && (
          <div className={`csv-status-message csv-status-${uploadStatus}`}>
            <span className="csv-status-icon">✗</span>
            <span>{uploadMessage}</span>
          </div>
        )}
      </div>

      {/* Success Overlay */}
      {uploadStatus === 'success' && (
        <div className="csv-success-overlay" onClick={() => {
          handleReset();
          setUploadStatus('idle');
          setUploadMessage('');
        }}>
          <div className="csv-success-modal" onClick={(e) => e.stopPropagation()}>
            <div className="csv-success-icon-wrapper">
              <div className="csv-success-icon">✓</div>
            </div>
            <h3 className="csv-success-title">Success!</h3>
            <p className="csv-success-message">{uploadMessage}</p>
            <button
              type="button"
              className="csv-success-close-button"
              onClick={() => {
                handleReset();
                setUploadStatus('idle');
                setUploadMessage('');
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
