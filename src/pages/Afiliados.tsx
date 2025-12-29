import { StandardNavigation } from '../components/StandardNavigation';
import { TrendingUp, DollarSign, Shield, Gift, AlertCircle, CheckCircle, ExternalLink, Users } from 'lucide-react';

export function Afiliados() {
  const affiliateLink = 'https://app.cakto.com.br/affiliate/invite/8c056f17-e91b-4d51-a465-8f897523ca8f';
  const whatsappGroup = 'https://chat.whatsapp.com/Czdb2MgbIms62zsAP403Hs';

  return (
    <StandardNavigation>
      {(sidebarOpen) => (
        <>
          <header className={`page-header ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`} style={{ zIndex: 10 }}>
            <div className="page-header-icon">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div className="page-header-content flex-1">
              <h1 className="page-header-title">Seja Afiliado ClonUp</h1>
              <p className="page-header-subtitle">Escala e Recorrência</p>
            </div>
          </header>

          <main className="page-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', marginTop: '6rem' }}>
            {/* Hero Section */}
            <div className="mb-8 p-6 rounded-lg border" style={{
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(147, 51, 234, 0.1))',
              borderColor: 'var(--border)'
            }}>
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                  🚀 Seja Afiliado ClonUp – Escala e Recorrência
                </h2>
              </div>
              <p className="text-lg" style={{ color: 'var(--text-secondary)' }}>
                O ClonUp é a plataforma completa para o afiliado: Clonagem de LPs e Quizzes (1 clique), Editor Visual, Tecnologia AntiClone, Cloaker e Biblioteca de Ofertas Escaladas.
              </p>
            </div>

            {/* Por que se afiliar */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>
                Por que se afiliar?
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-6 h-6 text-green-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      💰 Comissão
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    40% de comissão recorrente (ganhe todo mês!).
                  </p>
                </div>

                <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-6 h-6 text-blue-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      📈 Escala
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Afiliados de alta performance podem chegar a 60% de recorrência.
                  </p>
                </div>

                <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-purple-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      🛡️ Retenção
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Produto indispensável para quem anuncia. O cliente não cancela!
                  </p>
                </div>

                <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Gift className="w-6 h-6 text-yellow-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      🎁 7 Dias Grátis
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Facilidade extrema para converter novos usuários.
                  </p>
                </div>

                <div className="p-5 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      🏗️ Suporte para Estrutura Própria
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Oferecemos suporte completo para você montar sua própria estrutura de afiliados e escalar ainda mais seus ganhos.
                  </p>
                </div>
              </div>
            </div>


            {/* Gráfico de Recorrência */}
            <div className="mb-8 p-4 rounded-lg border" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)', opacity: 0.8 }}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <TrendingUp className="w-5 h-5 text-green-500" />
                💰 Projeção de Ganhos
              </h3>
              <p className="mb-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                Comissões: 40% (até 19 clientes) | 50% (20-49 clientes) | 60% (50+ clientes) | Ticket Médio: R$ 138,45/mês
              </p>

              <div className="space-y-2">
                {(() => {
                  const ticketMedio = 138.45;
                  const items = [
                    { clients: 5, commission: 40 },
                    { clients: 10, commission: 40 },
                    { clients: 20, commission: 50, tier: 'silver', reward: '🏆 Nível Prata: 50% comissão' },
                    { clients: 50, commission: 60, tier: 'gold', reward: '👑 Nível Ouro: 60% comissão + Premiação' },
                    { clients: 100, commission: 60, tier: 'gold', reward: '👑 Nível Ouro: 60% comissão + Premiação' },
                    { clients: 200, commission: 60, tier: 'gold', reward: '👑 Nível Ouro: 60% comissão + Premiação' },
                  ];

                  const calculatedItems = items.map(item => {
                    const monthly = item.clients * ticketMedio * (item.commission / 100);
                    const annual = monthly * 12;
                    return {
                      ...item,
                      monthly: Math.round(monthly * 100) / 100,
                      annual: Math.round(annual * 100) / 100,
                      tier: item.tier || 'bronze'
                    };
                  });

                  const maxValue = calculatedItems[calculatedItems.length - 1].monthly;

                  return calculatedItems.map((item, idx) => {
                    const percentage = (item.monthly / maxValue) * 100;
                    const isTier = item.tier === 'silver' || item.tier === 'gold';

                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span style={{ color: 'var(--text-secondary)' }}>
                            {item.clients} clientes ({item.commission}%)
                          </span>
                          <span style={{ color: '#22c55e', fontSize: '0.75rem' }}>
                            R$ {item.monthly.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-card-hover)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${percentage}%`,
                              background: item.tier === 'gold'
                                ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                : item.tier === 'silver'
                                  ? 'linear-gradient(90deg, #94a3b8, #64748b)'
                                  : 'linear-gradient(90deg, #22c55e, #16a34a)',
                              minWidth: '4px'
                            }}
                          />
                        </div>
                        {isTier && item.reward && (
                          <p className="text-xs font-semibold" style={{
                            color: item.tier === 'gold' ? '#fbbf24' : '#94a3b8',
                            marginTop: '2px'
                          }}>
                            {item.reward}
                          </p>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* Regras e Condições */}
            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <AlertCircle className="w-6 h-6 text-orange-500" />
                ⚠️ Regras e Condições:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-lg border border-red-500/30" style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <AlertCircle className="w-6 h-6 text-red-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      🚫 PROIBIDO Google Ads
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Proibido anunciar no Google.
                  </p>
                </div>

                <div className="p-5 rounded-lg border border-green-500/30" style={{ background: 'rgba(34, 197, 94, 0.05)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <h4 className="font-semibold text-lg" style={{ color: 'var(--text)' }}>
                      ✅ Liberado
                    </h4>
                  </div>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Facebook, Instagram, TikTok, YouTube e listas próprias.
                  </p>
                </div>
              </div>
            </div>

            {/* Grupo WhatsApp e Link de Afiliação - Lado a Lado */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Grupo WhatsApp */}
              <div className="p-6 rounded-lg border" style={{
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(147, 51, 234, 0.1))',
                borderColor: 'var(--border)'
              }}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <Users className="w-5 h-5" />
                  Grupo de Afiliados
                </h3>
                <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                  Entre no nosso grupo exclusivo e receba suporte, dicas e materiais:
                </p>
                <div className="mb-4">
                  <input
                    type="text"
                    readOnly
                    value={whatsappGroup}
                    className="w-full px-3 py-2 rounded-lg border font-mono text-xs"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text)'
                    }}
                  />
                </div>
                <a
                  href={whatsappGroup}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all hover:scale-105 w-full justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #25D366, #128C7E)',
                    boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)'
                  }}
                >
                  <Users className="w-5 h-5" />
                  Entrar no Grupo WhatsApp
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              {/* Link de Afiliação */}
              <div className="p-6 rounded-lg border-2" style={{
                borderColor: 'var(--accent)',
                background: 'var(--bg-card)'
              }}>
                <h3 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text)' }}>
                  <DollarSign className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  Link de Afiliação
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
                  Use este link para indicar novos clientes:
                </p>
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    readOnly
                    value={affiliateLink}
                    className="w-full px-4 py-2 rounded-lg border font-mono text-xs"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg-card-hover)',
                      color: 'var(--text)'
                    }}
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(affiliateLink);
                      alert('Link copiado para a área de transferência!');
                    }}
                    className="w-full px-4 py-2 rounded-lg font-semibold text-white transition-all hover:scale-105"
                    style={{
                      background: 'var(--accent)',
                      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)'
                    }}
                  >
                    Copiar Link
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Message */}
            <div className="mt-8 p-6 rounded-lg text-center" style={{ background: 'var(--bg-card-hover)' }}>
              <p className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                ClonUp: A ferramenta que seu público já precisa. Vamos lucrar juntos! 💸
              </p>
            </div>
          </main>
        </>
      )}
    </StandardNavigation>
  );
}

