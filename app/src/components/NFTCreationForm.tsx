import React, { useState } from 'react';
import { NFTMetadata, NFTMetadataAttribute } from '../types/nft';

interface NFTCreationFormProps {
  onSubmit: (metadata: NFTMetadata) => Promise<void>;
  isSubmitting?: boolean;
}

export const NFTCreationForm: React.FC<NFTCreationFormProps> = ({
  onSubmit,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<Partial<NFTMetadata>>({
    name: '',
    symbol: '',
    description: '',
    image: '',
    attributes: [],
  });
  
  const [attributeInput, setAttributeInput] = useState({
    trait_type: '',
    value: '',
  });
  
  // For image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you'd upload this to IPFS or similar
      // For demo purposes, we'll use a local object URL
      const objectUrl = URL.createObjectURL(file);
      setImagePreview(objectUrl);
      setFormData(prev => ({
        ...prev,
        image: objectUrl, // In real app, this would be the IPFS URL
      }));
    }
  };
  
  const handleAddAttribute = () => {
    if (!attributeInput.trait_type || !attributeInput.value) return;
    
    setFormData(prev => ({
      ...prev,
      attributes: [
        ...(prev.attributes || []),
        {
          trait_type: attributeInput.trait_type,
          value: attributeInput.value,
        },
      ],
    }));
    
    // Reset the input
    setAttributeInput({
      trait_type: '',
      value: '',
    });
  };
  
  const handleRemoveAttribute = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attributes: prev.attributes?.filter((_, i) => i !== index),
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.symbol || !formData.image) {
      alert('Please fill in all required fields (name, symbol, image)');
      return;
    }
    
    try {
      await onSubmit(formData as NFTMetadata);
      // Reset form after successful submission
      setFormData({
        name: '',
        symbol: '',
        description: '',
        image: '',
        attributes: [],
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Error creating NFT:', error);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Create New NFT</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="name">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="symbol">
            Symbol <span className="text-red-500">*</span>
          </label>
          <input
            id="symbol"
            name="symbol"
            type="text"
            value={formData.symbol}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
            rows={3}
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="image">
            Image <span className="text-red-500">*</span>
          </label>
          <input
            id="image"
            name="image-file"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500"
          />
          
          {imagePreview && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <img 
                src={imagePreview} 
                alt="NFT Preview" 
                className="w-32 h-32 object-cover border rounded"
              />
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Attributes
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={attributeInput.trait_type}
              onChange={(e) => setAttributeInput(prev => ({ ...prev, trait_type: e.target.value }))}
              placeholder="Trait type (e.g. Color)"
              className="border rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500 flex-1"
            />
            <input
              type="text"
              value={attributeInput.value}
              onChange={(e) => setAttributeInput(prev => ({ ...prev, value: e.target.value }))}
              placeholder="Value (e.g. Blue)"
              className="border rounded py-2 px-3 text-gray-700 focus:outline-none focus:border-blue-500 flex-1"
            />
            <button
              type="button"
              onClick={handleAddAttribute}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
          
          {/* Display attributes */}
          {formData.attributes && formData.attributes.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-gray-600 mb-2">Attributes:</p>
              <div className="grid grid-cols-2 gap-2">
                {formData.attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-100 p-2 rounded">
                    <div>
                      <span className="text-xs text-gray-500">{attr.trait_type}:</span>
                      <span className="ml-1 font-medium">{attr.value.toString()}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttribute(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-6 py-2 rounded ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isSubmitting ? 'Creating...' : 'Create NFT'}
          </button>
        </div>
      </form>
    </div>
  );
}; 