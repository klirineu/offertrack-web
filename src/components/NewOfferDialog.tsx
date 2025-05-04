import React, { useState } from 'react';
import { X } from 'lucide-react';
import { AdMetrics } from '../types';
import { useThemeStore } from '../store/themeStore';

interface NewOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: {
    title: string;
    offerUrl: string;
    landingPageUrl: string;
    description: string;
    tags: string[];
    metrics: AdMetrics[];
  }) => void;
}

export function NewOfferDialog({ isOpen, onClose, onSubmit }: NewOfferDialogProps) {
  const { theme } = useThemeStore()

  const [formData, setFormData] = useState({
    title: '',
    offerUrl: '',
    landingPageUrl: '',
    description: '',
    tags: '',
    metrics: [{
      date: new Date().toISOString().split('T')[0], // Data atual como padrão
      activeAds: 0,
      spend: 0,
      impressions: 0
    }] as AdMetrics[]
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      metrics: formData.metrics.map(metric => ({
        ...metric,
        // Garantir números válidos
        spend: metric.spend || 0,
        impressions: metric.impressions || 0
      }))
    });
    setFormData({
      title: '',
      offerUrl: '',
      landingPageUrl: '',
      description: '',
      tags: '',
      metrics: []
    });
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Adicionar Nova Oferta</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título
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
              URL Bibliotela de Anúncios
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
              Descrição
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
              Tags (separados por vírgula)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="e.g., ecommerce, fashion, electronics"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Métricas
            </label>
            <div className="space-y-2">
              {formData.metrics.map((metric, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    required
                    value={metric.date}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index].date = e.target.value;
                      setFormData({ ...formData, metrics: newMetrics });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Active Ads"
                    required
                    value={metric.activeAds}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index].activeAds = Number(e.target.value);
                      setFormData({ ...formData, metrics: newMetrics });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  {/* <input
                    type="number"
                    placeholder="Spend"
                    value={metric.spend || ''}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index].spend = Number(e.target.value);
                      setFormData({ ...formData, metrics: newMetrics });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <input
                    type="number"
                    placeholder="Impressions"
                    value={metric.impressions || ''}
                    onChange={(e) => {
                      const newMetrics = [...formData.metrics];
                      newMetrics[index].impressions = Number(e.target.value);
                      setFormData({ ...formData, metrics: newMetrics });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  /> */}
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    ...formData,
                    metrics: [
                      ...formData.metrics,
                      {
                        date: new Date().toISOString().split('T')[0],
                        activeAds: 0,
                        spend: 0,
                        impressions: 0
                      }
                    ]
                  });
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                + Adicionar Métrica
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
            >
              Adicionar Oferta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}