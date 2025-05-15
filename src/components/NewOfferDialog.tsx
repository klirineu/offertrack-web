import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';
import { useAuth } from '../context/AuthContext';

interface NewOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: {
    title: string;
    offerUrl: string;
    landingPageUrl: string;
    description: string;
    tags: string[];
  }) => Promise<void>;
  onError?: (err: unknown) => void;
}

export function NewOfferDialog({ isOpen, onClose, onSubmit, onError }: NewOfferDialogProps) {
  const { theme } = useThemeStore()
  const { profile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    offerUrl: '',
    landingPageUrl: '',
    description: '',
    tags: '',
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        offerUrl: '',
        landingPageUrl: '',
        description: '',
        tags: '',
      });
      setLoading(false);
    }
    if (isOpen && !profile) {
      setErrorMsg('Sua sessão expirou. Faça login novamente.');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!profile) {
      setErrorMsg('Sua sessão expirou. Faça login novamente.');
      setTimeout(() => {
        onClose();
      }, 2000);
      return;
    }
    setLoading(true);
    setErrorMsg(null);
    try {
      await onSubmit({
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      setFormData({
        title: '',
        offerUrl: '',
        landingPageUrl: '',
        description: '',
        tags: '',
      });
      onClose();
    } catch (err) {
      setErrorMsg('Erro ao adicionar oferta. Veja o console para detalhes.');
      if (onError) onError(err);
      console.error('[DEBUG] NewOfferDialog handleSubmit error:', err);
    }
    setLoading(false);
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

        <div className="space-y-4">
          {errorMsg && <div className="text-red-500 text-sm mb-2">{errorMsg}</div>}
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

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              disabled={loading}
              onClick={handleSubmit}
            >
              {loading ? 'Adicionando...' : 'Adicionar Oferta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}