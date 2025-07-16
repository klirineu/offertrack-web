import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/themeStore';
import { useSearchParams, useNavigate } from 'react-router-dom';

type Plan = {
  id: string;
  name: string;
  price: number;
  max_libraries: number;
  max_clones: number;
  max_anticlone: number;
  max_cloaker_requests: number | null;
  features: string[];
  checkout_url: string;
  max_quizzes?: number | null;
  quiz_extra_price?: number | null;
};

export default function EscolherPlano() {
  const { theme } = useThemeStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const message = searchParams.get('message');

  useEffect(() => {
    supabase.from('plans').select('*').order('price', { ascending: true }).then(({ data }) => {
      if (data) setPlans(data);
      setLoading(false);
    });
  }, []);

  const getMessageContent = () => {
    switch (message) {
      case 'choose':
        return {
          title: 'Escolha um plano para começar',
          description: 'Experimente gratuitamente por 7 dias! Não será cobrado nada no seu cartão durante o período de teste.',
          type: 'info'
        };
      case 'trial_expired':
        return {
          title: 'Seu período de teste expirou',
          description: 'Escolha um plano para continuar usando todos os recursos.',
          type: 'warning'
        };
      case 'plan_expired':
        return {
          title: 'Sua assinatura expirou',
          description: 'Renove sua assinatura para continuar usando todos os recursos.',
          type: 'warning'
        };
      case 'blocked':
        return {
          title: 'Pagamento recusado',
          description: 'Houve um problema com seu pagamento. Escolha um plano e atualize suas informações de pagamento.',
          type: 'error'
        };
      case 'past_due':
        return {
          title: 'Pagamento em atraso',
          description: 'Seu pagamento está atrasado. Enviamos um e-mail da Cakto com as opções de renovação via PIX ou cartão de crédito.',
          type: 'warning'
        };
      case 'no_plan':
        return {
          title: 'Nenhum plano ativo',
          description: 'Escolha um plano para acessar todos os recursos.',
          type: 'warning'
        };
      default:
        return null;
    }
  };

  const messageContent = getMessageContent();

  // Se for past_due ou plan_expired, mostrar tela especial de pagamento atrasado
  if (message === 'past_due' || message === 'plan_expired') {
    const isExpired = message === 'plan_expired';

    return (
      <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className={theme === 'dark' ? 'text-3xl md:text-4xl font-bold mb-4' : 'text-3xl md:text-4xl font-bold mb-4 text-gray-900'}>
              {isExpired ? 'Assinatura Expirada' : 'Pagamento em Atraso'}
            </h2>

            <p className={theme === 'dark' ? 'text-xl text-[#cbd5e1] mb-8' : 'text-xl text-gray-600 mb-8'}>
              {isExpired
                ? 'Sua assinatura expirou. Não se preocupe, enviamos um e-mail da '
                : 'Seu pagamento está atrasado. Não se preocupe, enviamos um e-mail da '
              }
              <strong>Cakto</strong> com todas as opções de renovação.
            </p>
          </div>

          <div className={theme === 'dark' ? 'bg-[#131a29] rounded-xl shadow-lg p-8 mb-8' : 'bg-gray-50 rounded-xl shadow-lg p-8 mb-8'}>
            <div className="mb-6">
              <svg className="mx-auto w-12 h-12 text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold mb-2">Verifique seu e-mail</h3>
              <p className={theme === 'dark' ? 'text-[#cbd5e1]' : 'text-gray-600'}>
                Enviamos um e-mail da <strong>Cakto</strong> com as opções de pagamento:
              </p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={theme === 'dark' ? 'text-[#cbd5e1]' : 'text-gray-700'}>Pagamento via PIX</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className={theme === 'dark' ? 'text-[#cbd5e1]' : 'text-gray-700'}>Cartão de Crédito</span>
                </div>
              </div>
            </div>

            <div className={theme === 'dark' ? 'bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4 mb-6' : 'bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'}>
              <p className={theme === 'dark' ? 'text-yellow-200 text-sm' : 'text-yellow-800 text-sm'}>
                <strong>Importante:</strong> Verifique também sua caixa de spam caso não encontre o e-mail na caixa de entrada.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-green-600 text-white rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors"
            >
              ✅ Já realizei o pagamento
            </button>

            <p className={theme === 'dark' ? 'text-sm text-[#9ca3af]' : 'text-sm text-gray-500'}>
              Após realizar o pagamento, clique no botão acima para acessar sua conta novamente.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className={theme === 'dark' ? 'text-3xl md:text-4xl font-bold mb-4' : 'text-3xl md:text-4xl font-bold mb-4 text-gray-900'}>
          Escolha seu plano para continuar
        </h2>

        {messageContent && (
          <div className={`mb-8 p-4 rounded-lg ${messageContent.type === 'error' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200' :
            messageContent.type === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' :
              'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200'
            }`}>
            <h3 className="text-lg font-medium">{messageContent.title}</h3>
            <p className="mt-2">{messageContent.description}</p>
          </div>
        )}

        <p className={theme === 'dark' ? 'text-xl text-[#cbd5e1] mb-8' : 'text-xl text-gray-600 mb-8'}>
          Selecione o plano ideal para o seu momento e acesse todos os recursos da plataforma.
        </p>

        {loading ? (
          <div className="mt-12 text-center">Carregando planos...</div>
        ) : (
          <div className="w-full mx-auto flex gap-8 justify-center items-center mt-24">
            {plans.map((plan, idx) => (
              <div key={plan.id} className={theme === 'dark'
                ? `bg-[#131a29] min-w-[320px] max-w-[400px] rounded-xl shadow-lg p-8 flex flex-col items-center border-2 ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-[#2563eb]'}`
                : `bg-white min-w-[320px] max-w-[400px] rounded-xl shadow-lg p-8 flex flex-col items-center ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-blue-600'}`
              }>
                <h3 className="text-xl font-bold mb-2">
                  {plan.name === 'starter' ? '🟢 Starter' : plan.name === 'intermediario' ? '🟡 Intermediário' : '🔴 Avançado'}
                  {idx === 1 && <span className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded text-xs font-bold">Recomendado</span>}
                </h3>
                <div className="text-3xl font-extrabold mb-2">R$ {plan.price},00 <span className="text-base font-normal">/ mês</span></div>

                <ul className="text-left mb-6 space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-green-400">✔</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href={plan.checkout_url} className={theme === 'dark'
                  ? `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-[#2563eb] text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
                  : `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
                }>
                  Assinar {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 