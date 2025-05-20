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

  // Mapeamento de cores para tema escuro
  const colorClasses = {
    yellow: { light: 'bg-yellow-50 text-yellow-900', dark: 'bg-yellow-900/20 text-yellow-200' },
    blue: { light: 'bg-blue-50 text-blue-900', dark: 'bg-blue-900/20 text-blue-200' },
    green: { light: 'bg-green-50 text-green-900', dark: 'bg-green-900/20 text-green-200' },
    red: { light: 'bg-red-50 text-red-900', dark: 'bg-red-900/20 text-red-200' },
  };

  return (
    <div className={`rounded-lg p-4 w-full md:w-80 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
      <h2 className={`font-bold text-lg mb-4 ${theme === 'dark' ? colorClasses[column.color].dark : colorClasses[column.color].light}`}>
        {column.title}
        <span className={`ml-2 text-sm font-normal ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          ({offers.length})
        </span>
      </h2>
      <div ref={setNodeRef} className="min-h-[200px]">
        <SortableContext items={offers.map((o) => o.id)} strategy={verticalListSortingStrategy}>
          {offers.map((offer) => (
            <OfferCard key={offer.id} offer={offer} onDelete={onDeleteOffer} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}