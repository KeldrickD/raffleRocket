'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NFTActivityType } from '@/types/activity';
import { Webhook, getWebhooks, registerWebhook, deleteWebhook } from '@/services/activityService';

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // New webhook form state
  const [newWebhookUrl, setNewWebhookUrl] = useState('');
  const [newWebhookSecret, setNewWebhookSecret] = useState('');
  const [newWebhookEvents, setNewWebhookEvents] = useState<NFTActivityType[]>(['sale', 'mint']);
  const [showNewWebhookForm, setShowNewWebhookForm] = useState(false);

  // Fetch webhooks
  useEffect(() => {
    const fetchWebhooks = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getWebhooks();
        setWebhooks(data);
      } catch (err) {
        console.error('Failed to fetch webhooks:', err);
        setError('Failed to load your webhooks. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWebhooks();
  }, []);

  // Handle webhook creation
  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWebhookUrl || !newWebhookSecret || newWebhookEvents.length === 0) {
      setError('Please fill in all fields and select at least one event type.');
      return;
    }
    
    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      await registerWebhook(newWebhookUrl, newWebhookSecret, newWebhookEvents);
      
      // Fetch updated webhooks
      const updatedWebhooks = await getWebhooks();
      setWebhooks(updatedWebhooks);
      
      // Reset form
      setNewWebhookUrl('');
      setNewWebhookSecret('');
      setNewWebhookEvents(['sale', 'mint']);
      setShowNewWebhookForm(false);
      
      setSuccessMessage('Webhook created successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to create webhook:', err);
      setError('Failed to create webhook. Please check your inputs and try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle webhook deletion
  const handleDeleteWebhook = async (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) {
      return;
    }
    
    setError(null);
    
    try {
      await deleteWebhook(id);
      
      // Update local state
      setWebhooks(prev => prev.filter(webhook => webhook.id !== id));
      
      setSuccessMessage('Webhook deleted successfully!');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      console.error('Failed to delete webhook:', err);
      setError('Failed to delete webhook. Please try again later.');
    }
  };

  // Toggle event type selection
  const toggleEventType = (type: NFTActivityType) => {
    setNewWebhookEvents(prev => {
      if (prev.includes(type)) {
        return prev.filter(t => t !== type);
      } else {
        return [...prev, type];
      }
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <Link href="/developers" className="text-blue-500 hover:text-blue-700 mr-2">
            <span className="inline-block">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </Link>
          <h1 className="text-3xl font-bold">Webhooks</h1>
        </div>
        
        <p className="text-gray-600">
          Set up webhooks to receive real-time updates about NFT activities
        </p>
      </div>
      
      {/* Success message */}
      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="bg-red-50 p-4 rounded-md mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Webhooks List */}
      {!isLoading && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Your Webhooks</h2>
            <button
              onClick={() => setShowNewWebhookForm(prev => !prev)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {showNewWebhookForm ? 'Cancel' : '+ New Webhook'}
            </button>
          </div>
          
          {/* New Webhook Form */}
          {showNewWebhookForm && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h3 className="text-lg font-medium mb-4">Create a New Webhook</h3>
              
              <form onSubmit={handleCreateWebhook}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="webhook-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook URL
                    </label>
                    <input
                      id="webhook-url"
                      type="url"
                      required
                      placeholder="https://your-service.com/webhook"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="webhook-secret" className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key
                    </label>
                    <input
                      id="webhook-secret"
                      type="text"
                      required
                      placeholder="A secret key to validate webhook requests"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newWebhookSecret}
                      onChange={(e) => setNewWebhookSecret(e.target.value)}
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      We'll use this to sign the webhook payload so you can verify it came from us.
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Types
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <input
                          id="event-sale"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('sale')}
                          onChange={() => toggleEventType('sale')}
                        />
                        <label htmlFor="event-sale" className="ml-2 text-sm text-gray-700">Sales</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-list"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('list')}
                          onChange={() => toggleEventType('list')}
                        />
                        <label htmlFor="event-list" className="ml-2 text-sm text-gray-700">Listings</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-delist"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('delist')}
                          onChange={() => toggleEventType('delist')}
                        />
                        <label htmlFor="event-delist" className="ml-2 text-sm text-gray-700">Delistings</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-mint"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('mint')}
                          onChange={() => toggleEventType('mint')}
                        />
                        <label htmlFor="event-mint" className="ml-2 text-sm text-gray-700">Mints</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-transfer"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('transfer')}
                          onChange={() => toggleEventType('transfer')}
                        />
                        <label htmlFor="event-transfer" className="ml-2 text-sm text-gray-700">Transfers</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-offer"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('offer')}
                          onChange={() => toggleEventType('offer')}
                        />
                        <label htmlFor="event-offer" className="ml-2 text-sm text-gray-700">Offers</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-burn"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={newWebhookEvents.includes('burn')}
                          onChange={() => toggleEventType('burn')}
                        />
                        <label htmlFor="event-burn" className="ml-2 text-sm text-gray-700">Burns</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="event-raffle"
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={
                            newWebhookEvents.includes('raffle_create') ||
                            newWebhookEvents.includes('raffle_join') ||
                            newWebhookEvents.includes('raffle_complete')
                          }
                          onChange={() => {
                            const raffleEvents: NFTActivityType[] = ['raffle_create', 'raffle_join', 'raffle_complete'];
                            const hasAll = raffleEvents.every(type => newWebhookEvents.includes(type));
                            
                            if (hasAll) {
                              setNewWebhookEvents(prev => prev.filter(type => !raffleEvents.includes(type)));
                            } else {
                              setNewWebhookEvents(prev => {
                                const newEvents = [...prev];
                                raffleEvents.forEach(type => {
                                  if (!newEvents.includes(type)) {
                                    newEvents.push(type);
                                  }
                                });
                                return newEvents;
                              });
                            }
                          }}
                        />
                        <label htmlFor="event-raffle" className="ml-2 text-sm text-gray-700">Raffles</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isCreating}
                      className={`w-full px-4 py-2 ${
                        isCreating
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-blue-500 hover:bg-blue-600'
                      } text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                    >
                      {isCreating ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creating...
                        </span>
                      ) : (
                        'Create Webhook'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {/* Webhooks table */}
          {webhooks.length > 0 ? (
            <div className="bg-white shadow overflow-hidden rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Endpoint
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Events
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {webhooks.map((webhook) => (
                    <tr key={webhook.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                          {webhook.url}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.map((event) => (
                            <span
                              key={event}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {event.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(webhook.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDeleteWebhook(webhook.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <p className="text-gray-500">
                You don't have any webhooks yet. Create one to start receiving NFT activity notifications.
              </p>
            </div>
          )}
        </div>
      )}
      
      {/* Documentation */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Webhook Documentation</h2>
        
        <div className="prose max-w-none">
          <h3>Overview</h3>
          <p>
            Webhooks allow your application to receive real-time notifications about NFT activities.
            When an event occurs, we'll send a POST request to your specified URL with details about the activity.
          </p>
          
          <h3>Request Format</h3>
          <p>
            All webhook requests are sent as HTTP POST with a JSON payload. The payload includes:
          </p>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`{
  "id": "evt_123456789",
  "type": "sale",
  "timestamp": "2023-07-15T14:32:21Z",
  "data": {
    "mint": "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    "nftName": "Example NFT #123",
    "collectionId": "example-collection",
    "collectionName": "Example Collection",
    "price": 5.5,
    "fromAddress": "sender123",
    "toAddress": "receiver456",
    "transactionSignature": "5Ks9SYjS7..."
  }
}`}
          </pre>
          
          <h3>Securing Webhooks</h3>
          <p>
            Each webhook request includes a <code>X-Signature</code> header containing a HMAC SHA-256 signature
            created using your webhook secret. You should validate this signature to ensure the webhook came from our service.
          </p>
          
          <h3>Code Example</h3>
          <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`// Node.js example
const crypto = require('crypto');
const express = require('express');
const app = express();

app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'your_webhook_secret';
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process the webhook
  console.log('Received activity:', req.body);
  
  res.status(200).send('Webhook received');
});

app.listen(3000, () => {
  console.log('Webhook server running on port 3000');
});`}
          </pre>
          
          <h3>Best Practices</h3>
          <ul>
            <li>Always verify the signature to ensure the request is legitimate</li>
            <li>Respond to webhook requests quickly (under 3 seconds) to prevent timeouts</li>
            <li>Implement retry logic in your application for handling failed webhook processing</li>
            <li>Store the webhook secret securely and never expose it in client-side code</li>
          </ul>
          
          <h3>Rate Limits</h3>
          <p>
            We may rate limit webhook requests if we detect excessive traffic. If your webhook endpoint
            fails to respond successfully multiple times, we may temporarily disable it.
          </p>
        </div>
      </div>
    </div>
  );
} 