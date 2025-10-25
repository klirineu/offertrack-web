import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { OfferCard } from './OfferCard';
import type { Column as ColumnType, Offer } from '../types';
import { useThemeStore } from '../store/themeStore';

interface ColumnProps {
  column: ColumnType;
  offers: Offer[];
  onDeleteOffer: (offerId: string) => void;
}

export function Column({ column, offers, onDeleteOffer }: ColumnProps) {
  const { theme } = useThemeStore(); // Obtenha o tema
  const { setNodeRef } = useDroppable({ id: column.id });

  // Mapeamento de cores para badges
  const colorBadges = {
    yellow: 'badge-warning',
    blue: 'badge-info',
    green: 'badge-success',
    red: 'badge-error',
  };

  const colorIcons = {
    yellow: '⏳',
    blue: '🧪',
    green: '✅',
    red: '❌',
  };

  return (
    <div className="dashboard-card flex-1 min-w-[280px]" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{colorIcons[column.color]}</span>
          <h2 className="text-lg font-bold" style={{ color: 'var(--text)', margin: 0 }}>
            {column.title}
          </h2>
        </div>
        <span className={`badge ${colorBadges[column.color]}`} style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}>
          {offers.length}
        </span>
      </div>
      <div ref={setNodeRef} className="flex-1 space-y-3 overflow-y-auto" style={{ minHeight: '400px' }}>
        <SortableContext items={offers.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onDelete={onDeleteOffer} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}