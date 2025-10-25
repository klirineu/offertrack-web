import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  DragOverlay
} from '@dnd-kit/core';
import { Column } from './Column';
import type { Offer } from '../types';
import { useThemeStore } from '../store/themeStore';
import { fetchOffersService, addOfferService, updateOfferService, deleteOfferService } from '../services/offerService';
import { OfferCard } from './OfferCard';
import { useAuth } from '../context/AuthContext';
import { Search, Tag, X } from 'lucide-react';
import { useModalStore } from '../store/modalStore';

const columns = [
  { id: 'waiting' as const, title: 'Aguardando', color: 'yellow' },
  { id: 'testing' as const, title: 'Testando', color: 'blue' },
  { id: 'approved' as const, title: 'Aprovado', color: 'green' },
  { id: 'invalid' as const, title: 'Inválido', color: 'red' },
];

export function Board() {
  const { theme } = useThemeStore();
  const { user } = useAuth();
  const { setOffers, setOnOfferUpdated, setOnNewOffer } = useModalStore();
  const [offers, setOffersLocal] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filtros
  const [searchText, setSearchText] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Lista de todas as tags únicas
  const allTags = Array.from(
    new Set(
      offers.flatMap(offer => offer.tags || [])
    )
  ).sort();

  useEffect(() => {
    const loadOffers = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      const { data, error } = await fetchOffersService(user.id);
      if (error) setError(error.message);
      if (data) {
        setOffersLocal(data);
        setOffers(data);
        setFilteredOffers(data);
      }
      setLoading(false);
    };
    loadOffers();
  }, [user]);

  // Configurar callbacks no store
  useEffect(() => {
    setOnOfferUpdated(handleOfferUpdated);
    setOnNewOffer(handleNewOffer);
  }, [setOnOfferUpdated, setOnNewOffer]);

  // Efeito para aplicar filtros
  useEffect(() => {
    let result = [...offers];

    // Filtro de texto
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(
        offer =>
          offer.title.toLowerCase().includes(searchLower) ||
          (offer.description?.toLowerCase() || '').includes(searchLower)
      );
    }

    // Filtro de tags
    if (selectedTags.length > 0) {
      result = result.filter(
        offer => selectedTags.every(tag => offer.tags?.includes(tag))
      );
    }

    setFilteredOffers(result);
  }, [offers, searchText, selectedTags]);

  const activeOffer = offers.find((o) => o.id === activeId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeOffer = offers.find(o => o.id === active.id);
    if (!activeOffer) return;

    // Se o drop foi em uma coluna, over.id é o status
    // Se foi em um card, precisamos descobrir a coluna desse card
    let newStatus: Offer['status'] | undefined = undefined;
    const allowedStatus = ['waiting', 'testing', 'approved', 'invalid'] as const;

    if (typeof over.id === 'string' && allowedStatus.includes(over.id as Offer['status'])) {
      newStatus = over.id as Offer['status'];
    } else {
      // over.id é o id de outro card, então pegamos o status desse card
      const overOffer = offers.find(o => o.id === over.id);
      if (overOffer && allowedStatus.includes(overOffer.status)) {
        newStatus = overOffer.status;
      }
    }

    if (!newStatus || activeOffer.status === newStatus) return;

    const updatedOffers = offers.map((offer) =>
      offer.id === active.id ? { ...offer, status: newStatus, updatedAt: new Date() } : offer
    );
    setOffers(updatedOffers);

    // Persistir no backend
    try {
      await updateOfferService(active.id as string, { status: newStatus, updatedAt: new Date() });
    } catch (err) {
      console.error('Erro ao atualizar status da oferta:', err);
    }
  };

  const handleNewOffer = async (offerData: { title: string; offerUrl: string; landingPageUrl: string; description: string; tags: string[] }) => {
    try {
      setLoading(true);
      setError(null);
      if (!user) throw new Error('Usuário não autenticado');
      const { error } = await addOfferService({ ...offerData, status: 'waiting', metrics: [] }, user.id);
      if (error) throw error;
      const { data, error: fetchError } = await fetchOffersService(user.id);
      if (fetchError) setError(fetchError.message);
      if (data) {
        setOffersLocal(data);
        setOffers(data);
      }
      setRefreshKey((k) => k + 1);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Erro ao adicionar oferta');
      console.error('[DEBUG] handleNewOffer error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await deleteOfferService(offerId);
      if (error) throw error;
      setOffers((prev) => prev.filter((offer) => offer.id !== offerId));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error.message || 'Erro ao excluir oferta');
      console.error('[DEBUG] handleDeleteOffer error', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOfferUpdated = (updatedOffer: Offer) => {
    setOffers((prev) =>
      prev.map((offer) =>
        offer.id === updatedOffer.id ? { ...offer, ...updatedOffer } : offer
      )
    );
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Minhas Ofertas</h2>
        <button
          onClick={() => useModalStore.getState().setIsNewOfferDialogOpen(true)}
          className="cta-button"
        >
          Adicionar Nova Oferta
        </button>
      </div>

      {/* Filtros */}
      <div className="mb-6 space-y-4">
        {/* Barra de pesquisa */}
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Pesquisar ofertas..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="form-input w-full pl-10"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 items-center">
          <Tag className="text-gray-400 h-5 w-5" />
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTags(prev =>
                  prev.includes(tag)
                    ? prev.filter(t => t !== tag)
                    : [...prev, tag]
                );
              }}
              className={`badge ${selectedTags.includes(tag) ? 'badge-primary' : 'badge-info'}`}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X className="h-3 w-3" />
              )}
            </button>
          ))}
        </div>

        {/* Indicadores de filtros ativos */}
        {(searchText || selectedTags.length > 0) && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Filtros ativos:</span>
            {searchText && (
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                Texto: {searchText}
              </span>
            )}
            {selectedTags.length > 0 && (
              <span className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                Tags: {selectedTags.join(', ')}
              </span>
            )}
            <button
              onClick={() => {
                setSearchText('');
                setSelectedTags([]);
              }}
              className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
            >
              Limpar filtros
            </button>
          </div>
        )}
      </div>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-lg font-medium" style={{ color: 'var(--text)' }}>Carregando ofertas...</p>
          </div>
        </div>
      ) : (
        <DndContext
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div key={refreshKey} className="flex gap-4 overflow-x-auto pb-8" style={{ minHeight: 'calc(100vh - 400px)' }}>
            {columns.map((column) => (
              <Column
                key={column.id}
                column={column}
                offers={filteredOffers.filter((offer) => offer.status === column.id)}
                onDeleteOffer={handleDeleteOffer}
              />
            ))}
          </div>

          <DragOverlay>
            {activeOffer && <OfferCard offer={activeOffer} onDelete={() => { }} />}
          </DragOverlay>
        </DndContext>
      )}

    </>
  );
}
