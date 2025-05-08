import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  closestCorners,
  DragOverlay
} from '@dnd-kit/core';
import { Column } from './Column';
import { NewOfferDialog } from './NewOfferDialog';
import type { Offer, OfferStatus } from '../types';
import { useThemeStore } from '../store/themeStore';
import { EditOfferDialog } from './EditOfferDialog';
import { useOfferStore } from '../store/offerStore';
import { OfferCard } from './OfferCard';

const columns = [
  { id: 'waiting' as const, title: 'Waiting', color: 'yellow' },
  { id: 'testing' as const, title: 'Testing', color: 'blue' },
  { id: 'approved' as const, title: 'Approved', color: 'green' },
  { id: 'invalid' as const, title: 'Invalid', color: 'red' },
];

export function Board() {
  const { theme } = useThemeStore();
  const { offers, fetchOffers } = useOfferStore();

  const [isNewOfferDialogOpen, setIsNewOfferDialogOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const activeOffer = offers.find((o) => o.id === activeId) || null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeOffer = useOfferStore.getState().offers.find(o => o.id === active.id);
    if (!activeOffer || activeOffer.status === over.id) return;

    useOfferStore.getState().updateOffer(active.id.toString(), {
      status: over.id as OfferStatus,
      updatedAt: new Date()
    });
  };

  const handleNewOffer = async (offerData: Omit<Offer, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
    try {
      await useOfferStore.getState().addOffer({
        ...offerData,
        status: 'waiting'
      });
      setIsNewOfferDialogOpen(false);
    } catch (err) {
      console.error('[DEBUG] handleNewOffer error', err);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Minhas Ofertas</h2>
        <button
          onClick={() => setIsNewOfferDialogOpen(true)}
          className={`px-4 py-2 rounded-lg shadow-lg transition-colors ${theme === 'dark'
            ? 'bg-blue-700 hover:bg-blue-600 text-white'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
        >
          Adicionar Nova Oferta
        </button>
      </div>

      <DndContext
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-6 p-6 overflow-x-auto pb-8">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              offers={offers.filter((offer) => offer.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeOffer && <OfferCard offer={activeOffer} />}
        </DragOverlay>
      </DndContext>

      <NewOfferDialog
        isOpen={isNewOfferDialogOpen}
        onClose={() => setIsNewOfferDialogOpen(false)}
        onSubmit={handleNewOffer}
      />

      <EditOfferDialog />
    </>
  );
}
