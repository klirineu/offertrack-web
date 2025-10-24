import React from 'react';

interface ContentSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: () => void;
  onSelectUrl: () => void;
  onSelectEmoji: () => void;
  position?: { x: number; y: number };
  title?: string;
}

export const ContentSelectionModal: React.FC<ContentSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  onSelectUrl,
  onSelectEmoji,
  position = { x: 0, y: 0 },
  title = 'Selecionar Tipo de Conteúdo',
}) => {
  if (!isOpen) return null;

  // Se não foi passada posição específica, centraliza na tela
  const shouldCenter = position.x === 0 && position.y === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-600 p-4 w-72 max-w-[288px]"
        style={!shouldCenter ? {
          position: 'absolute',
          left: Math.min(position.x, window.innerWidth - 288),
          top: Math.min(position.y, window.innerHeight - 400),
        } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-4 h-4"
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

        {/* Options */}
        <div className="space-y-2">
          {/* Galeria de Imagens */}
          <button
            onClick={() => {
              onSelectImage();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white">
                🖼️ Galeria de Imagens
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Escolher de imagens disponíveis
              </div>
            </div>
          </button>

          {/* URL da Imagem */}
          <button
            onClick={() => {
              onSelectUrl();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white">
                🔗 URL da Imagem
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Inserir link de imagem externa
              </div>
            </div>
          </button>

          {/* Seletor de Emoji */}
          <button
            onClick={() => {
              onSelectEmoji();
              onClose();
            }}
            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 text-left"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <span className="text-lg">😀</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 dark:text-white">
                😀 Seletor de Emoji
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Escolher emoji como imagem
              </div>
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Escolha o tipo de conteúdo que deseja adicionar
          </p>
        </div>
      </div>
    </div>
  );
};

