import React, { useState, useEffect } from 'react';
import { NFTActivityType } from '@/types/activity';
import { SubscriptionSettings, getSubscriptionSettings, saveSubscriptionSettings } from '@/services/activityService';

export const ActivitySubscription: React.FC = () => {
  const [settings, setSettings] = useState<SubscriptionSettings>({
    enabled: true,
    emailNotifications: true,
    pushNotifications: false,
    activityTypes: {
      mint: true,
      sale: true,
      list: true,
      delist: false,
      transfer: false,
      offer: true,
      burn: false,
      raffle_create: false,
      raffle_join: false,
      raffle_complete: true
    },
    collections: [],
    specificNFTs: [],
    priceThreshold: null
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [priceThresholdInput, setPriceThresholdInput] = useState('');
  const [newCollection, setNewCollection] = useState('');
  const [newNFT, setNewNFT] = useState('');

  // Fetch user's subscription settings
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const userSettings = await getSubscriptionSettings();
        setSettings(userSettings);
        
        // Set price threshold input if there's a value
        if (userSettings.priceThreshold !== null) {
          setPriceThresholdInput(userSettings.priceThreshold.toString());
        }
      } catch (err) {
        console.error('Failed to fetch subscription settings:', err);
        setError('Failed to load your notification settings. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle save
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await saveSubscriptionSettings(settings);
      setSuccessMessage('Notification settings saved successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to save subscription settings:', err);
      setError('Failed to save your notification settings. Please try again later.');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle toggle for main enabled switch
  const handleToggleEnabled = () => {
    setSettings(prev => ({
      ...prev,
      enabled: !prev.enabled
    }));
  };

  // Handle toggle for notification methods
  const handleToggleNotificationMethod = (method: 'emailNotifications' | 'pushNotifications') => {
    setSettings(prev => ({
      ...prev,
      [method]: !prev[method]
    }));
  };

  // Handle toggle for activity types
  const handleToggleActivityType = (type: NFTActivityType) => {
    setSettings(prev => ({
      ...prev,
      activityTypes: {
        ...prev.activityTypes,
        [type]: !prev.activityTypes[type]
      }
    }));
  };

  // Handle price threshold change
  const handlePriceThresholdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceThresholdInput(e.target.value);
    
    const value = parseFloat(e.target.value);
    setSettings(prev => ({
      ...prev,
      priceThreshold: isNaN(value) ? null : value
    }));
  };

  // Handle adding a collection
  const handleAddCollection = () => {
    if (!newCollection || settings.collections.includes(newCollection)) {
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      collections: [...prev.collections, newCollection]
    }));
    setNewCollection('');
  };

  // Handle removing a collection
  const handleRemoveCollection = (collection: string) => {
    setSettings(prev => ({
      ...prev,
      collections: prev.collections.filter(c => c !== collection)
    }));
  };

  // Handle adding an NFT
  const handleAddNFT = () => {
    if (!newNFT || settings.specificNFTs.includes(newNFT)) {
      return;
    }
    
    setSettings(prev => ({
      ...prev,
      specificNFTs: [...prev.specificNFTs, newNFT]
    }));
    setNewNFT('');
  };

  // Handle removing an NFT
  const handleRemoveNFT = (nft: string) => {
    setSettings(prev => ({
      ...prev,
      specificNFTs: prev.specificNFTs.filter(n => n !== nft)
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Activity Notifications</h2>
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-6">
          {successMessage}
        </div>
      )}
      
      {/* Main toggle */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b">
        <div>
          <h3 className="text-lg font-medium">Enable Notifications</h3>
          <p className="text-gray-500">Receive notifications about NFT activities</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={settings.enabled}
            onChange={handleToggleEnabled}
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
      
      {settings.enabled && (
        <>
          {/* Notification methods */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium mb-4">Notification Methods</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  id="email-notifications"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={settings.emailNotifications}
                  onChange={() => handleToggleNotificationMethod('emailNotifications')}
                />
                <label htmlFor="email-notifications" className="ml-2 text-gray-700">
                  Email Notifications
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="push-notifications"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  checked={settings.pushNotifications}
                  onChange={() => handleToggleNotificationMethod('pushNotifications')}
                />
                <label htmlFor="push-notifications" className="ml-2 text-gray-700">
                  Push Notifications
                </label>
              </div>
            </div>
          </div>
          
          {/* Activity types */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium mb-4">Activity Types</h3>
            <p className="text-gray-500 mb-4">Select which activities you want to be notified about:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(settings.activityTypes).map(([type, enabled]) => (
                <div key={type} className="flex items-center">
                  <input
                    id={`activity-${type}`}
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    checked={!!enabled}
                    onChange={() => handleToggleActivityType(type as NFTActivityType)}
                  />
                  <label htmlFor={`activity-${type}`} className="ml-2 text-gray-700 capitalize">
                    {type.replace(/_/g, ' ')}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Price threshold */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium mb-4">Price Threshold</h3>
            <p className="text-gray-500 mb-4">Get notified for activities above a certain price (in SOL):</p>
            
            <div className="flex items-center">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="No minimum"
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={priceThresholdInput}
                onChange={handlePriceThresholdChange}
              />
              <span className="ml-2 text-gray-700">SOL</span>
            </div>
          </div>
          
          {/* Collections */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium mb-4">Collections</h3>
            <p className="text-gray-500 mb-4">Get notified about specific collections (leave empty for all collections):</p>
            
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="Collection ID"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newCollection}
                onChange={(e) => setNewCollection(e.target.value)}
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleAddCollection}
              >
                Add
              </button>
            </div>
            
            {settings.collections.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.collections.map(collection => (
                  <div key={collection} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-gray-800">{collection}</span>
                    <button
                      className="ml-2 text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveCollection(collection)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No collections added (will notify for all collections)</p>
            )}
          </div>
          
          {/* Specific NFTs */}
          <div className="mb-6 pb-6 border-b">
            <h3 className="text-lg font-medium mb-4">Specific NFTs</h3>
            <p className="text-gray-500 mb-4">Get notified about specific NFTs (leave empty to follow collections):</p>
            
            <div className="flex mb-4">
              <input
                type="text"
                placeholder="NFT Mint Address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newNFT}
                onChange={(e) => setNewNFT(e.target.value)}
              />
              <button
                className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={handleAddNFT}
              >
                Add
              </button>
            </div>
            
            {settings.specificNFTs.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {settings.specificNFTs.map(nft => (
                  <div key={nft} className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <span className="text-gray-800">{nft.substring(0, 6)}...{nft.substring(nft.length - 4)}</span>
                    <button
                      className="ml-2 text-gray-500 hover:text-red-500"
                      onClick={() => handleRemoveNFT(nft)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No specific NFTs added</p>
            )}
          </div>
        </>
      )}
      
      {/* Save button */}
      <div className="flex justify-end">
        <button
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}; 