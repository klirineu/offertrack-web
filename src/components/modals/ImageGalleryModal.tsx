import React, { useState, useRef } from 'react';
import { useImageUpload } from '../hooks/use-image-upload';

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (imageUrl: string) => void;
  title?: string;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  title = '🖼️ Galeria de Imagens',
}) => {
  const { imageFiles, loading, uploadFile, deleteFile, deleteMultipleFiles } = useImageUpload();
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    try {
      for (const file of Array.from(files)) {
        // Validar tipo de arquivo
        if (!file.type.startsWith('image/')) {
          alert(`${file.name} não é uma imagem válida`);
          continue;
        }

        // Validar tamanho (5MB)
        if (file.size > 5 * 1024 * 1024) {
          alert(`${file.name} é muito grande. Máximo 5MB`);
          continue;
        }

        await uploadFile(file, 'image');
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert('Erro ao fazer upload das imagens');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleSelection = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedImages(new Set());
  };

  const selectAll = () => {
    if (!imageFiles || imageFiles.length === 0) return;
    const allImageIds = imageFiles.map((img: any) => img.id);
    setSelectedImages(new Set(allImageIds));
  };

  const clearSelection = () => {
    setSelectedImages(new Set());
  };

  const deleteSelected = async () => {
    if (selectedImages.size === 0) return;

    if (confirm(`Tem certeza que deseja deletar ${selectedImages.size} imagem(ns)?`)) {
      const success = await deleteMultipleFiles(Array.from(selectedImages));
      if (success) {
        setSelectedImages(new Set());
        setIsSelectionMode(false);
      }
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (confirm('Tem certeza que deseja deletar esta imagem?')) {
      await deleteFile(id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl h-[80vh] mx-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg
              className="w-6 h-6"
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

        {/* Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {!isSelectionMode ? (
                <>
                  <button
                    onClick={toggleSelection}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Selecionar
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? 'Enviando...' : 'Upload'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={selectAll}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Selecionar Todas
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Limpar Seleção
                  </button>
                  <button
                    onClick={deleteSelected}
                    disabled={selectedImages.size === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    Apagar Selecionadas ({selectedImages.size})
                  </button>
                </>
              )}
            </div>

            <button
              onClick={toggleSelection}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {isSelectionMode ? 'Cancelar' : 'Gerenciar'}
            </button>
          </div>
        </div>

        {/* Images Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : !imageFiles || imageFiles.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
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
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Nenhuma imagem encontrada
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Fazer Upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {imageFiles.map((image: any) => (
                <div
                  key={image.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden ${selectedImages.has(image.id) ? 'ring-2 ring-blue-500' : ''
                    }`}
                  onClick={() => {
                    if (isSelectionMode) {
                      const newSelection = new Set(selectedImages);
                      if (newSelection.has(image.id)) {
                        newSelection.delete(image.id);
                      } else {
                        newSelection.add(image.id);
                      }
                      setSelectedImages(newSelection);
                    } else {
                      onSelectImage(image.file_url);
                      onClose();
                    }
                  }}
                >
                  <img
                    src={image.file_url}
                    alt={image.file_name}
                    className="w-full h-24 object-cover"
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                    {isSelectionMode ? (
                      <div
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center ${selectedImages.has(image.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'bg-white border-gray-300'
                          }`}
                      >
                        {selectedImages.has(image.id) && (
                          <svg
                            className="w-4 h-4 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Delete button */}
                  {isSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(image.id);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}

                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2 text-xs">
                    <div className="truncate">{image.file_name}</div>
                    <div className="text-gray-300">
                      {(image.file_size / 1024 / 1024).toFixed(1)}MB
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};

