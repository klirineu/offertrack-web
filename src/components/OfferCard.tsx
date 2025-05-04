import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Tag, Clock, Edit2, TrendingUp, Copy, Trash2 } from 'lucide-react';
import type { Offer } from '../types';
import { useEditDialogStore } from '../store/editDialogStore';
import { useOfferStore } from '../store/offerStore';

interface OfferCardProps {
  offer: Offer;
}

export function OfferCard({ offer }: OfferCardProps) {
  const { openDialog } = useEditDialogStore();
  const { deleteOffer } = useOfferStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: offer.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : 'auto',
    boxShadow: isDragging ? '0 0 0 3px rgba(59,130,246,0.3)' : undefined,
  };

  const latestMetric = offer.metrics?.at(-1);
  const previousMetric = offer.metrics?.at(-2);
  const adsTrend = latestMetric && previousMetric
    ? latestMetric.activeAds - previousMetric.activeAds
    : 0;

  async function handleDeleteOffer() {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      await deleteOffer(offer.id);
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="relative group bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-3 hover:shadow-lg transition-shadow"
    >
      {/* Área de arrasto invisível (cobre o card inteiro, menos o botão) */}
      <div
        {...listeners}
        className="absolute inset-0 z-0 cursor-move"
      />
      {/* CONTEÚDO */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg dark:text-white">{offer.title}</h3>
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                openDialog(offer.id);
              }}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 z-50"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteOffer}
              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 z-50"
              title="Excluir Oferta"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-2 text-sm text-gray-600 dark:text-gray-400">
          <Clock className="w-4 h-4" />
          <span>{new Date(offer.createdAt).toLocaleDateString()}</span>
        </div>

        {latestMetric && (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="dark:text-white">Active Ads: {latestMetric.activeAds}</span>
            {adsTrend !== 0 && (
              <span className={adsTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                ({adsTrend > 0 ? '+' : ''}{adsTrend})
              </span>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          {offer.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs flex items-center gap-1"
            >
              <Tag className="w-3 h-3" />
              {tag}
            </span>
          ))}
        </div>

        {offer.description && (
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{offer.description}</p>
        )}

        <div className="flex flex-col gap-2">
          <a
            href={offer.offerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Offer URL
          </a>
          <div className="flex items-center gap-2">
            <a
              href={offer.landingPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" />
              Landing Page
            </a>
            <button
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = `/tools/clonesites?url=${encodeURIComponent(offer.landingPageUrl)}`;
              }}
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs flex items-center gap-1"
              title="Clonar Landing Page"
            >
              <Copy className="w-4 h-4" />
              Clonar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
