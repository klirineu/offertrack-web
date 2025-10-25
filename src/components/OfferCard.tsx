import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Tag, Clock, Edit2, TrendingUp, Copy, Trash2, Download, Loader2 } from 'lucide-react';
import type { Offer } from '../types';
import { useModalStore } from '../store/modalStore';
import api from '../services/api';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface OfferCardProps {
  offer: Offer;
  onDelete: (offerId: string) => void;
}

export function OfferCard({ offer, onDelete }: OfferCardProps) {
  const { setSelectedOfferId, setIsEditOfferDialogOpen } = useModalStore();
  const [metrics, setMetrics] = useState<{ count: number; checked_at: string }[]>([]);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

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
      setLoadingDelete(true);
      try {
        await onDelete(offer.id);
      } finally {
        setLoadingDelete(false);
      }
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
      className="feature-card relative group mb-3"
      style={{ ...style, padding: '1rem' }}
    >
      {/* Área de arrasto invisível (cobre o card inteiro, menos o botão) */}
      <div
        {...listeners}
        className="absolute inset-0 z-0 cursor-move"
      />
      {/* CONTEÚDO */}
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-base" style={{ color: 'var(--text)', margin: 0, lineHeight: 1.3 }}>{offer.title}</h3>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setSelectedOfferId(offer.id);
                setIsEditOfferDialogOpen(true);
              }}
              className="p-1.5 rounded-lg transition-colors z-50"
              style={{
                color: 'var(--text-secondary)',
                background: 'transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-card-hover)';
                e.currentTarget.style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
              title="Editar"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteOffer}
              className="p-1.5 rounded-lg transition-colors z-50 flex items-center gap-1 disabled:opacity-60"
              style={{
                color: 'var(--error)',
                background: 'transparent'
              }}
              title="Excluir Oferta"
              disabled={loadingDelete}
              onMouseEnter={(e) => {
                if (!loadingDelete) {
                  e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              {loadingDelete ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {loadingMetrics ? (
          <div className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Carregando...</div>
        ) : latestMetric ? (
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text)' }}>
              {latestMetric.count} anúncios
            </span>
            {adsTrend !== 0 && (
              <span className={`badge ${adsTrend > 0 ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.4rem' }}>
                {adsTrend > 0 ? '+' : ''}{adsTrend}
              </span>
            )}
          </div>
        ) : null}

        {offer.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {offer.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="badge badge-info"
                style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}
              >
                {tag}
              </span>
            ))}
            {offer.tags.length > 3 && (
              <span className="badge badge-info" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>
                +{offer.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {offer.description && (
          <p className="text-xs mb-2 break-words line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
            {offer.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mt-2">
          <a
            href={offer.offerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none' }}
            title="Ver Oferta"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href={`/offers/${offer.id}/metrics`}
            className="starter-button"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none' }}
            title="Ver Métricas"
          >
            <TrendingUp className="w-3 h-3" />
          </a>
          <button
            onClick={handleDownloadMedia}
            className="secondary-button"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Baixar Mídia"
            disabled={downloading}
          >
            {downloading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
          </button>
          <a
            href={offer.landingPageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="secondary-button"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', textDecoration: 'none' }}
            title="Landing Page"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={e => {
              e.preventDefault();
              e.stopPropagation();
              window.location.href = `/tools/clonesites?url=${encodeURIComponent(offer.landingPageUrl)}`;
            }}
            className="cta-button"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
            title="Clonar LP"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
      {downloading && (
        <div className="modal-overlay">
          <div className="dashboard-card flex flex-col items-center gap-4 p-8">
            <div className="loader">
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
              <div className="loader-circle"></div>
            </div>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>Baixando mídia...</span>
          </div>
        </div>
      )}
    </div>
  );
}
