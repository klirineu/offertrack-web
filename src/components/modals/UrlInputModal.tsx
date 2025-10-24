import React, { useState } from 'react';

interface UrlInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  title?: string;
  placeholder?: string;
}

export const UrlInputModal: React.FC<UrlInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title = '🔗 Inserir URL da Imagem',
  placeholder = 'https://exemplo.com/imagem.jpg',
}) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(true);

  if (!isOpen) return null;

  const validateUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return urlString.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) !== null;
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (value.trim()) {
      setIsValidUrl(validateUrl(value));
    } else {
      setIsValidUrl(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) return;

    if (validateUrl(trimmedUrl)) {
      onSubmit(trimmedUrl);
      setUrl('');
      onClose();
    } else {
      setIsValidUrl(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-6 w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL da Imagem
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-gray-900 dark:text-white dark:bg-gray-700 ${isValidUrl
                  ? 'border-gray-300 dark:border-gray-600'
                  : 'border-red-300 dark:border-red-600'
                }`}
              autoFocus
            />
            {!isValidUrl && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                Por favor, insira uma URL válida de imagem (jpg, png, gif, svg, webp)
              </p>
            )}
          </div>

          {/* Preview */}
          {url && isValidUrl && validateUrl(url) && (
            <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-3">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Preview:
              </p>
              <img
                src={url}
                alt="Preview"
                className="max-w-full h-32 object-contain mx-auto rounded"
                onError={() => setIsValidUrl(false)}
              />
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!url.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Adicionar Imagem
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            💡 <strong>Dica:</strong> Use URLs de imagens de sites confiáveis como Unsplash, Pexels ou seu próprio servidor.
          </p>
        </div>
      </div>
    </div>
  );
};

