import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalStore } from '../store/modalStore';
import { updateOfferService } from '../services/offerService';
import { FIXED_TAGS } from '../services/escalatedOffersService';
import type { Offer } from '../types';

export function EditOfferDialog({ offers, onOfferUpdated }: { offers: Offer[], onOfferUpdated: (offer: Offer) => void }) {
  const { selectedOfferId, setIsEditOfferDialogOpen } = useModalStore();
  const [formData, setFormData] = useState({
    title: '',
    offerUrl: '',
    landingPageUrl: '',
    description: '',
    tags: '',
    checkoutUrl: '',
    language: 'pt-BR',
  });

  useEffect(() => {
    if (selectedOfferId) {
      const offer = offers.find(o => o.id === selectedOfferId);
      if (offer) {
        setFormData({
          title: offer.title,
          offerUrl: offer.offerUrl,
          landingPageUrl: offer.landingPageUrl,
          description: offer.description || '',
          tags: offer.tags.join(', '),
          checkoutUrl: (offer as any).checkoutUrl || '',
          language: (offer as any).language || 'pt-BR',
        });
      }
    }
  }, [selectedOfferId, offers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferId) return;
    const { data, error } = await updateOfferService(selectedOfferId, {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      updatedAt: new Date(),
    } as any);
    if (!error && data) {
      onOfferUpdated(data);
    }
    setIsEditOfferDialogOpen(false);
  };

  if (!selectedOfferId) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', width: '750px' }}>
        <div className="app-modal-header">
          <h2 className="modal-title">Editar Oferta</h2>
          <button
            onClick={() => setIsEditOfferDialogOpen(false)}
            className="modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="app-modal-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Coluna Esquerda */}
              <div className="space-y-4">
                <div className="form-field-wrapper">
                  <label className="form-field-label">Título</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field-label">URL Biblioteca de Anúncios</label>
                  <input
                    type="url"
                    required
                    value={formData.offerUrl}
                    onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field-label">Landing Page URL</label>
                  <input
                    type="url"
                    required
                    value={formData.landingPageUrl}
                    onChange={(e) => setFormData({ ...formData, landingPageUrl: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field-label">URL de Checkout (Opcional)</label>
                  <input
                    type="url"
                    value={formData.checkoutUrl}
                    onChange={(e) => setFormData({ ...formData, checkoutUrl: e.target.value })}
                    placeholder="https://checkout.exemplo.com"
                    className="form-input"
                  />
                  <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                    URL para onde o usuário será direcionado ao finalizar a compra
                  </p>
                </div>
              </div>

              {/* Coluna Direita */}
              <div className="space-y-4">
                <div className="form-field-wrapper">
                  <label className="form-field-label">Descrição</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="form-input"
                    rows={3}
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field-label">Tags</label>
                  <div className="grid grid-cols-3 gap-2 mb-3 max-h-60 overflow-y-auto">
                    {FIXED_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
                          if (currentTags.includes(tag)) {
                            setFormData({ ...formData, tags: currentTags.filter(t => t !== tag).join(', ') });
                          } else {
                            setFormData({ ...formData, tags: [...currentTags, tag].join(', ') });
                          }
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${formData.tags.includes(tag)
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25 border border-blue-400'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-blue-400'
                          }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="Digite tags personalizadas (separadas por vírgula)"
                    className="form-input"
                  />
                </div>

                <div className="form-field-wrapper">
                  <label className="form-field-label">Idioma da Oferta</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="form-input"
                  >
                    <option value="pt-BR">Português (Brasil)</option>
                    <option value="en-US">English (US)</option>
                    <option value="es-ES">Español</option>
                    <option value="fr-FR">Français</option>
                    <option value="de-DE">Deutsch</option>
                    <option value="it-IT">Italiano</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="app-modal-footer">
          <button
            type="button"
            onClick={() => setIsEditOfferDialogOpen(false)}
            className="secondary-button"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="cta-button"
            onClick={handleSubmit}
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}