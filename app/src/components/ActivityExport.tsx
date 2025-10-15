import React, { useState } from 'react';
import { NFTActivity } from '@/types/activity';

interface ActivityExportProps {
  activities: NFTActivity[];
  fileName?: string;
}

export const ActivityExport: React.FC<ActivityExportProps> = ({ 
  activities, 
  fileName = 'nft-activities'
}) => {
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');

  // Convert activities to CSV format
  const generateCSV = (): string => {
    if (activities.length === 0) {
      return 'No data to export';
    }
    
    // Define headers
    const headers = [
      'ID', 
      'Type', 
      'Timestamp', 
      'NFT Mint', 
      'NFT Name', 
      'Collection ID', 
      'Collection Name', 
      'From Address', 
      'To Address', 
      'Price', 
      'Transaction Signature'
    ].join(',');
    
    // Map activities to CSV rows
    const rows = activities.map(activity => [
      activity.id || '',
      activity.type || '',
      activity.timestamp ? activity.timestamp.toISOString() : '',
      activity.mint || '',
      (activity.nftName || '').replace(/,/g, ' '), // Remove commas to avoid CSV issues
      activity.collectionId || '',
      (activity.collectionName || '').replace(/,/g, ' '), // Remove commas to avoid CSV issues
      activity.fromAddress || '',
      activity.toAddress || '',
      activity.price !== undefined ? activity.price.toString() : '',
      activity.transactionSignature || ''
    ].join(','));
    
    return [headers, ...rows].join('\n');
  };
  
  // Convert activities to JSON format
  const generateJSON = (): string => {
    return JSON.stringify(
      activities.map(activity => ({
        ...activity,
        timestamp: activity.timestamp?.toISOString()
      })), 
      null, 
      2
    );
  };
  
  // Handle download action
  const handleDownload = () => {
    if (activities.length === 0) {
      return;
    }
    
    let content: string;
    let mimeType: string;
    let fileExtension: string;
    
    if (exportFormat === 'csv') {
      content = generateCSV();
      mimeType = 'text/csv';
      fileExtension = 'csv';
    } else {
      content = generateJSON();
      mimeType = 'application/json';
      fileExtension = 'json';
    }
    
    // Create blob and download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Set up download attributes
    link.href = url;
    link.download = `${fileName}.${fileExtension}`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Format file size estimate
  const getFileSizeEstimate = (): string => {
    if (activities.length === 0) {
      return '0 KB';
    }
    
    let size: number;
    
    if (exportFormat === 'csv') {
      // Estimate CSV size (rough approximation)
      size = generateCSV().length;
    } else {
      // Estimate JSON size (rough approximation)
      size = generateJSON().length;
    }
    
    // Convert to KB
    const kb = size / 1024;
    
    if (kb < 1024) {
      return `${kb.toFixed(1)} KB`;
    } else {
      return `${(kb / 1024).toFixed(1)} MB`;
    }
  };
  
  return (
    <div className="activity-export">
      <div className="mb-3 text-sm text-gray-500">
        Export {activities.length} activities • Estimated size: {getFileSizeEstimate()}
      </div>
      
      <div className="mb-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <input
              id="format-csv"
              type="radio"
              name="export-format"
              value="csv"
              checked={exportFormat === 'csv'}
              onChange={() => setExportFormat('csv')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="format-csv" className="ml-2 text-sm text-gray-700">
              CSV (for Excel, Google Sheets)
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              id="format-json"
              type="radio"
              name="export-format"
              value="json"
              checked={exportFormat === 'json'}
              onChange={() => setExportFormat('json')}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <label htmlFor="format-json" className="ml-2 text-sm text-gray-700">
              JSON (for developers)
            </label>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleDownload}
        disabled={activities.length === 0}
        className={`w-full px-4 py-2 rounded-md ${
          activities.length === 0
            ? 'bg-gray-300 cursor-not-allowed text-gray-500'
            : 'bg-blue-500 hover:bg-blue-600 text-white'
        }`}
      >
        {activities.length === 0 ? (
          'No data to export'
        ) : (
          <>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 inline-block mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Download as {exportFormat.toUpperCase()}
          </>
        )}
      </button>
      
      <div className="mt-3 text-xs text-gray-500">
        <p>
          The data includes activity ID, type, timestamp, NFT details, wallet addresses, prices, and transaction IDs.
        </p>
      </div>
    </div>
  );
}; 