import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import type { Offer, AdMetrics } from '../types';
import { useThemeStore } from '../store/themeStore';
import { useEditDialogStore } from '../store/editDialogStore';
import { useOfferStore } from '../store/offerStore';
import { format, parseISO } from 'date-fns';

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
  const [metrics, setMetrics] = useState<AdMetrics[]>([]);
  const [newMetric, setNewMetric] = useState({ date: new Date().toISOString().slice(0, 10), activeAds: '' });

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
      setMetrics(offer.metrics || []);
    }
  }, [selectedOfferId, offers]);

  const handleAddMetric = () => {
    if (!newMetric.activeAds) return;
    setMetrics([...metrics, { date: newMetric.date, activeAds: parseInt(newMetric.activeAds, 10) }]);
    setNewMetric({ date: new Date().toISOString().slice(0, 10), activeAds: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId) return;
    updateOffer(selectedOfferId, {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      metrics,
      updatedAt: new Date(),
    });
    closeDialog();
  };

  if (!selectedOfferId) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999] ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg z-[1000]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold dark:text-white">Editar Oferta</h2>
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
              Contagem de anúncios ativos
            </label>
            <input
              type="number"
              min="0"
              value={formData.activeAds}
              onChange={(e) => setFormData({ ...formData, activeAds: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              disabled
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
              Métricas diárias
            </label>
            <div className="space-y-1 mb-2">
              {metrics.length === 0 && <div className="text-gray-400 text-sm">Nenhuma métrica cadastrada ainda.</div>}
              {metrics.map((metric, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">{format(parseISO(metric.date), 'dd/MM/yyyy')}</span>
                  <span className="text-gray-700 dark:text-gray-200 font-medium">{metric.activeAds} anúncios</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 items-end">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Data</label>
                <input
                  type="date"
                  value={newMetric.date}
                  onChange={e => setNewMetric(m => ({ ...m, date: e.target.value }))}
                  className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Qtd. anúncios</label>
                <input
                  type="number"
                  min="0"
                  value={newMetric.activeAds}
                  onChange={e => setNewMetric(m => ({ ...m, activeAds: e.target.value }))}
                  className="px-2 py-1 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                />
              </div>
              <button
                type="button"
                onClick={handleAddMetric}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Adicionar
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={closeDialog}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}