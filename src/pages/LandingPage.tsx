import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Layout, CheckCircle, TrendingUp, Shield, CropIcon as DragDropIcon, Clock, Zap, ArrowRight, Mail, Globe, Lock, ChevronDown, ExternalLink, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export function LandingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const { theme, toggleTheme } = useThemeStore();

  const plans = [
    {
      name: 'Iniciante',
      price: isAnnual ? 0 : 0,
      features: [
        'Até 50 ofertas',
        'Análise básica',
        'Suporte por email',
        'Segurança padrão'
      ],
      cta: 'Começar Grátis',
      popular: false
    },
    {
      name: 'Pro',
      price: isAnnual ? 39 : 49,
      features: [
        'Ofertas ilimitadas',
        'Análise avançada',
        'Suporte prioritário',
        'Segurança reforçada',
        'Tags personalizadas',
        'Acesso à API'
      ],
      cta: 'Assinar Pro',
      popular: true
    },
    {
      name: 'Enterprise',
      price: null,
      features: [
        'Tudo do Pro',
        'Soluções personalizadas',
        'Suporte dedicado',
        'Garantia de SLA',
        'Integrações customizadas',
        'Colaboração em equipe'
      ],
      cta: 'Fale Conosco',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'Posso usar o OfferTrack gratuitamente?',
      answer: 'Sim! Oferecemos um plano Iniciante totalmente gratuito que inclui até 50 ofertas, análises básicas e suporte por email.'
    },
    {
      question: 'A plataforma funciona em dispositivos móveis?',
      answer: 'Absolutamente! O OfferTrack é totalmente responsivo e funciona perfeitamente em todos os dispositivos - desktop, tablet e celular.'
    },
    {
      question: 'Quando as próximas funcionalidades estarão disponíveis?',
      answer: 'Estamos trabalhando ativamente em recursos empolgantes como clonagem automática de sites, extração de criativos e detecção de cloaker. Esses recursos serão lançados gradualmente nos próximos meses.'
    },
    {
      question: 'Como funciona o sistema de cloaking?',
      answer: 'Nosso sistema de cloaking oferece proteção avançada para suas ofertas, permitindo filtrar tráfego indesejado, proteger contra bots e concorrentes, e garantir que apenas visitantes qualificados acessem suas páginas.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-sm dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layout className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">OfferTrack</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Recursos
            </a>
            <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              Preços
            </a>
            <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
              FAQ
            </a>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>
          <div className="flex items-center gap-4">
            {/* <Link */}
            <a  
            href="#pricing"
              className="hidden md:block px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Entrar
            </a>
            {/* to="/signup" */}
            {/* <Link */}
              <a
              href="#pricing"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Começar
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 -z-10" />
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Gerencie Suas Ofertas <br className="hidden md:block" />
            com Confiança
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
            Acompanhe, analise e otimize suas ofertas em um só lugar.
            Obtenha insights em tempo real e tome decisões baseadas em dados.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* <Link */}
            <a
              href="#pricing"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              Teste Grátis <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="#pricing"
              className="px-8 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              Ver Demo
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Tudo que você precisa para gerenciar ofertas
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Recursos poderosos para ajudar você a controlar suas campanhas de marketing
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <DragDropIcon className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Interface Drag & Drop</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Organize suas ofertas facilmente com nosso sistema intuitivo de arrastar e soltar.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <TrendingUp className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Métricas em Tempo Real</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Monitore o desempenho das ofertas com análises ao vivo e histórico detalhado.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl">
              <Shield className="w-12 h-12 text-blue-600 mb-6" />
              <h3 className="text-xl font-semibold mb-4 dark:text-white">Sistema de Cloaking</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Filtragem de tráfego de alto nível para seu negócio online. Proteja seu site de bots, serviços de espionagem e concorrentes.
              </p>
            </div>
          </div>

          {/* Coming Soon Features */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-center mb-8 dark:text-white">Em Breve</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Em Breve
                </div>
                <Clock className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Clonagem de Sites</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Clone páginas de ofertas automaticamente para análise e arquivamento.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Em Breve
                </div>
                <Zap className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Extração de Criativos</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Extraia imagens, vídeos e textos de ofertas do Facebook automaticamente.
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl relative overflow-hidden">
                <div className="absolute top-4 right-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-full">
                  Em Breve
                </div>
                <Lock className="w-12 h-12 text-blue-600 mb-6" />
                <h3 className="text-xl font-semibold mb-4 dark:text-white">Detecção de Cloaker</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Identifique e contorne sistemas de cloaker para visualizar a oferta real.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Preços simples e transparentes
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Escolha o plano que melhor atende suas necessidades
            </p>
            <div className="flex items-center justify-center gap-4">
              <span className={`text-sm ${isAnnual ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-semibold'}`}>
                Mensal
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`w-14 h-8 rounded-full p-1 transition-colors ${isAnnual ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
              >
                <div className={`w-6 h-6 rounded-full bg-white transform transition-transform ${isAnnual ? 'translate-x-6' : ''}`} />
              </button>
              <span className={`text-sm ${isAnnual ? 'text-gray-900 dark:text-white font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                Anual (Economize 15%)
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-white dark:bg-gray-800 p-8 rounded-xl border ${
                  plan.popular
                    ? 'border-blue-600 shadow-lg'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 right-8 transform -translate-y-1/2 px-4 py-1 bg-blue-600 text-white text-sm rounded-full">
                    Popular
                  </div>
                )}
                <h3 className="text-xl font-semibold mb-4 dark:text-white">{plan.name}</h3>
                <div className="mb-6">
                  {plan.price === null ? (
                    <span className="text-4xl font-bold dark:text-white">Personalizado</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold dark:text-white">R${plan.price}</span>
                      <span className="text-gray-600 dark:text-gray-400">/mês</span>
                    </>
                  )}
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <a href="/dashboard">
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                    plan.popular
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {plan.cta}
                </button>
                  </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Perguntas Frequentes
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <button
                  className="w-full px-6 py-4 text-left flex items-center justify-between"
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                >
                  <span className="font-semibold text-gray-900 dark:text-white">{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${
                      activeFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para assumir o controle das suas ofertas?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhares de profissionais de marketing que já usam o OfferTrack para otimizar suas campanhas.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Comece Agora <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Layout className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">OfferTrack</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Tornando o gerenciamento de ofertas simples e eficiente para profissionais de marketing.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Produto</h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Recursos
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Preços
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Empresa</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Sobre
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Blog
                </a>
              </li>
              <li>
                <a href="/careers" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  Carreiras
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Contato</h3>
            <ul className="space-y-2">
              <li>
                <a href="mailto:contato@offertrack.com" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Contato
                </a>
              </li>
              <li>
                <a href="https://twitter.com/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://linkedin.com/company/offertrack" target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2025 OfferTrack. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}