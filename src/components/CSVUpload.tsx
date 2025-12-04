import { useState, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import './CSVUpload.css';

interface CSVUploadProps {
  category?: 'grocery' | 'pizza';
}

// Default to grocery if no category provided
const DEFAULT_CATEGORY = 'grocery';

interface CSVRow {
  [key: string]: string;
}

const CSV_UPLOAD_API_URL = import.meta.env.VITE_CSV_UPLOAD_API_URL || 'https://34.93.141.21.sslip.io/beckn/v2/catalog/transform';

export default function CSVUpload({ category = DEFAULT_CATEGORY }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    return result;
  };

  const parseCSV = (text: string): { headers: string[]; rows: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length === 0) return { headers: [], rows: [] };

    // Parse headers
    const parsedHeaders = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ''));
    
    // Parse rows
    const rows: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ''));
      const row: CSVRow = {};
      parsedHeaders.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      rows.push(row);
    }

    return { headers: parsedHeaders, rows };
  };

  const handleFileSelect = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      setUploadStatus('error');
      setUploadMessage('Please select a CSV file');
      return;
    }

    setFile(selectedFile);
    setUploadStatus('idle');
    setUploadMessage('');

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const { headers, rows } = parseCSV(text);
      setHeaders(headers);
      setCsvData(rows);
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

  const handleSubmit = async () => {
    if (!file) {
      setUploadStatus('error');
      setUploadMessage('Please select a CSV file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('csv', file);

      const apiUrl = `${CSV_UPLOAD_API_URL}?type=${category}`;
      
      console.log('Making CSV upload request to:', apiUrl);
      console.log('File:', file.name, 'Size:', file.size, 'bytes');
      console.log('FormData entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
      }
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });
      
      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} ${response.statusText}. ${errorText}`);
      }

      await response.json(); // Read response but don't need to store it
      setUploadStatus('success');
      setUploadMessage('CSV file uploaded and transformed successfully!');
      
      // Clear the form data after successful upload
      setTimeout(() => {
        handleReset();
        setUploadStatus('idle');
        setUploadMessage('');
      }, 2000); // Clear after 2 seconds to show success message
    } catch (error: any) {
      console.error('CSV upload error:', error);
      setUploadStatus('error');
      setUploadMessage(error?.message || 'Failed to upload CSV file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setCsvData([]);
    setHeaders([]);
    setUploadStatus('idle');
    setUploadMessage('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="csv-upload-container">
      <div className="csv-upload-header">
        <h2 className="pane-title">Upload Catalog CSV</h2>
        <p className="pane-subtitle">
          Upload a CSV file to transform your catalog data into Beckn format
        </p>
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
            accept=".csv"
            onChange={handleFileInputChange}
            className="csv-file-input"
            id="csv-file-input"
          />
          
          {!file ? (
            <div className="csv-drop-zone-content">
              <div className="csv-drop-zone-icon">📄</div>
              <p className="csv-drop-zone-text">
                Drag and drop your CSV file here, or{' '}
                <button type="button" onClick={handleBrowseClick} className="csv-browse-link">
                  browse
                </button>
              </p>
              <p className="csv-drop-zone-hint">Supports CSV files only</p>
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

      {/* CSV Data Preview */}
      {csvData.length > 0 && (
        <div className="csv-preview-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="csv-preview-title">CSV Preview ({csvData.length} rows, {headers.length} columns)</h3>
            {headers.length > 5 && (
              <span className="csv-scroll-hint" style={{ fontSize: '0.875rem', color: '#64748b' }}>
                ← Scroll horizontally to see all columns →
              </span>
            )}
          </div>
          <div className="csv-table-container">
            <table className="csv-table">
              <thead>
                <tr>
                  {headers.map((header, index) => (
                    <th key={index}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {headers.map((header, colIndex) => (
                      <td key={colIndex}>{row[header] || ''}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {csvData.length > 10 && (
              <p className="csv-preview-note">
                Showing first 10 rows of {csvData.length} total rows
              </p>
            )}
          </div>
        </div>
      )}

      {/* Submit Button and Status */}
      <div className="csv-upload-actions">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            console.log('Submit button clicked, file:', file?.name);
            handleSubmit();
          }}
          disabled={!file || isUploading}
          className="csv-submit-button"
        >
          {isUploading ? 'Uploading...' : 'Submit'}
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

