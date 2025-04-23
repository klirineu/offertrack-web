import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Offer, AdMetrics } from '../types';
import { useThemeStore } from '../store/themeStore';
import { useEditDialogStore } from '../store/editDialogStore';
import { useOfferStore } from '../store/offerStore';

interface EditOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerId: string, updates: Partial<Offer>) => void;
}

export function EditOfferDialog() {
  const { theme } = useThemeStore();
  const { selectedOfferId, closeDialog } = useEditDialogStore();
  const { offers, updateOffer } = useOfferStore();
  const [formData, setFormData] = useState({
    title: '',
    offerUrl: '',
    landingPageUrl: '',
    description: '',
    tags: '',
    activeAds: '0',
  });

  useEffect(() => {
    const offer = offers.find(o => o.id === selectedOfferId);
    if (offer) {
      setFormData({
        title: offer.title,
        offerUrl: offer.offerUrl,
        landingPageUrl: offer.landingPageUrl,
        description: offer.description || '',
        tags: offer.tags.join(', '),
        activeAds: offer.metrics?.[offer.metrics.length - 1]?.activeAds.toString() || '0',
      });
    }
  }, [selectedOfferId, offers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOfferId) return;

    updateOffer(selectedOfferId, {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      metrics: updateMetrics(offers.find(o => o.id === selectedOfferId)?.metrics || []),
      updatedAt: new Date(),
    });

    closeDialog();
  };

  const updateMetrics = (metrics: AdMetrics[]): AdMetrics[] => {
    if (metrics.length === 0) return [];
    const lastMetric = metrics[metrics.length - 1];
    return [
      ...metrics.slice(0, -1),
      {
        ...lastMetric,
        activeAds: parseInt(formData.activeAds, 10) || 0,
      }
    ];
  };

  if (!selectedOfferId) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg z-[1000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Edit Offer</h2>
          <button
            onClick={closeDialog}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Offer URL
            </label>
            <input
              type="url"
              required
              value={formData.offerUrl}
              onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Landing Page URL
            </label>
            <input
              type="url"
              required
              value={formData.landingPageUrl}
              onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Active Ads Count
            </label>
            <input
              type="number"
              min="0"
              value={formData.activeAds}
              onChange={(e) => setFormData({ ...formData, activeAds: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., ecommerce, fashion, electronics"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}