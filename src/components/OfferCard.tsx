import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Tag, Clock, Edit2, TrendingUp, Copy, Trash2, Download } from 'lucide-react';
import type { Offer } from '../types';
import { useEditDialogStore } from '../store/editDialogStore';
import { useOfferStore } from '../store/offerStore';
import api from '../services/api';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface OfferCardProps {
  offer: Offer;
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export function OfferCard({ offer }: OfferCardProps) {
  const { openDialog } = useEditDialogStore();
  const { deleteOffer } = useOfferStore();
  const [metrics, setMetrics] = useState<{ count: number; checked_at: string }[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [downloading, setDownloading] = useState(false);

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

  useEffect(() => {
    async function fetchMetrics() {
      setLoadingMetrics(true);
      const { data, error } = await supabase
        .from('offer_metrics')
        .select('count,checked_at')
        .eq('offer_id', offer.id)
        .order('checked_at', { ascending: true });
      if (!error && data) setMetrics(data);
      setLoadingMetrics(false);
    }
    fetchMetrics();
  }, [offer.id]);

  const latestMetric = metrics.at(-1);
  const firstMetric = metrics.at(0);
  const adsTrend = latestMetric && firstMetric ? latestMetric.count - firstMetric.count : 0;

  async function handleDeleteOffer() {
    if (window.confirm('Tem certeza que deseja excluir esta oferta?')) {
      await deleteOffer(offer.id);
    }
  }

  async function handleDownloadMedia(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDownloading(true);
    try {
      const response = await api.post('/api/facebook/download-media', { url: offer.offerUrl, title: offer.title }, { responseType: 'blob' });
      const blob = response.data;
      let filename = `${offer.title.replace(/\s+/g, "_").toLowerCase()}-media.zip`;
      const disposition = response.headers && response.headers['content-disposition'];
      if (disposition) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = decodeURIComponent(match[1]);
      }
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: unknown) {
      let msg = String(err);
      if (typeof err === 'object' && err && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
        msg = (err as { message: string }).message;
      }
      alert('Erro ao baixar mídia: ' + msg);
    } finally {
      setDownloading(false);
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

        {loadingMetrics ? (
          <div className="text-gray-500 dark:text-gray-400 text-sm mb-2">Carregando métricas...</div>
        ) : latestMetric ? (
          <div className="flex items-center gap-2 mb-2 text-sm">
            <TrendingUp className="w-4 h-4" />
            <span className="dark:text-white">Active Ads: {latestMetric.count}</span>
            {adsTrend !== 0 && (
              <span className={adsTrend > 0 ? 'text-green-600' : 'text-red-600'}>
                ({adsTrend > 0 ? '+' : ''}{adsTrend})
              </span>
            )}
          </div>
        ) : null}

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
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 break-words">{offer.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mt-2">
          <a
            href={offer.offerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Oferta
          </a>
          <a
            href={`/offers/${offer.id}/metrics`}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-50 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-800 transition font-medium shadow-sm"
            title="Ver Métricas Detalhadas"
          >
            <TrendingUp className="w-4 h-4" />
            Métricas
          </a>
          <button
            onClick={handleDownloadMedia}
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 hover:bg-indigo-100 dark:hover:bg-indigo-800 transition font-medium shadow-sm"
            title="Baixar Mídia da Oferta"
          >
            <Download className="w-4 h-4" />
            Baixar Mídia
          </button>

        </div>
        <div className="flex flex-wrap gap-2 mt-2">
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
            className="flex items-center gap-1 px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition font-medium shadow-sm"
            title="Clonar Landing Page"
          >
            <Copy className="w-4 h-4" />
            Clonar
          </button>
        </div>
      </div>
      {downloading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-gray-700 dark:text-gray-200 font-semibold">Baixando mídia...</span>
          </div>
        </div>
      )}
    </div>
  );
}
