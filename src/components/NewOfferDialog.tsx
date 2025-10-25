import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FIXED_TAGS } from '../services/escalatedOffersService';

interface NewOfferDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offer: {
    title: string;
    offerUrl: string;
    landingPageUrl: string;
    description: string;
    tags: string[];
    checkoutUrl?: string;
    language: string;
  }) => Promise<void>;
  onError?: (err: unknown) => void;
}

export function NewOfferDialog({ isOpen, onClose, onSubmit, onError }: NewOfferDialogProps) {
  const { profile } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    offerUrl: '',
    landingPageUrl: '',
    description: '',
    tags: '',
    checkoutUrl: '',
    language: 'pt-BR',
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
        checkoutUrl: '',
        language: 'pt-BR',
      });
      setLoading(false);
    }
    if (isOpen && !profile) {
      setErrorMsg('Sua sessão expirou. Faça login novamente.');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [isOpen, onClose, profile]);

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
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        checkoutUrl: formData.checkoutUrl || undefined
      });
      setFormData({
        title: '',
        offerUrl: '',
        landingPageUrl: '',
        description: '',
        tags: '',
        checkoutUrl: '',
        language: 'pt-BR',
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
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto', width: '750px' }}>
        <div className="app-modal-header">
          <h2 className="modal-title">Adicionar Nova Oferta</h2>
          <button
            onClick={onClose}
            className="modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="app-modal-body">
          {errorMsg && <div className="form-field-error-message mb-4">{errorMsg}</div>}

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
        </div>

        <div className="app-modal-footer">
          <button
            onClick={onClose}
            type="button"
            className="secondary-button"
          >
            Cancelar
          </button>
          <button
            type="button"
            className="cta-button"
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Adicionando...' : 'Adicionar Oferta'}
          </button>
        </div>
      </div>
    </div>
  );
}