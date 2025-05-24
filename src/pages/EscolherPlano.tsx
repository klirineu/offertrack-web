import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useThemeStore } from '../store/themeStore';

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
  useEffect(() => {
    supabase.from('plans').select('*').order('price', { ascending: true }).then(({ data }) => {
      if (data) setPlans(data);
    });
  }, []);

  return (
    <div className={theme === 'dark' ? 'min-h-screen bg-[#111827] text-white' : 'min-h-screen bg-white text-gray-900'}>
      <div className="max-w-3xl mx-auto py-16 text-center">
        <h2 className={theme === 'dark' ? 'text-3xl md:text-4xl font-bold mb-4' : 'text-3xl md:text-4xl font-bold mb-4 text-gray-900'}>Escolha seu plano para continuar</h2>
        <p className={theme === 'dark' ? 'text-xl text-[#cbd5e1] mb-8' : 'text-xl text-gray-600 mb-8'}>Selecione o plano ideal para o seu momento e acesse todos os recursos da plataforma.</p>
        <div className="w-full mx-auto flex gap-8 justify-center items-center mt-24">
          {plans.map((plan, idx) => (
            <div key={plan.id} className={theme === 'dark'
              ? `bg-[#131a29] min-w-[320px] max-w-[400px] rounded-xl shadow-lg p-8 flex flex-col items-center border-2 ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-[#2563eb]'}`
              : `bg-white min-w-[320px] max-w-[400px] rounded-xl shadow-lg p-8 flex flex-col items-center ${idx === 1 ? 'border-4 border-yellow-400 scale-105' : idx === 2 ? 'border-2 border-red-500' : 'border-2 border-blue-600'}`
            }>
              <h3 className="text-xl font-bold mb-2">{plan.name === 'starter' ? '🟢 Starter' : plan.name === 'intermediario' ? '🟡 Intermediário' : '🔴 Avançado'}{idx === 1 && <span className="ml-2 px-2 py-1 bg-yellow-400 text-black rounded text-xs font-bold">Recomendado</span>}</h3>
              <div className="text-3xl font-extrabold mb-2">R$ {plan.price},00 <span className="text-base font-normal">/ mês</span></div>
              <ul className={theme === 'dark' ? 'text-[#cbd5e1] mb-6 space-y-1 text-center' : 'text-gray-600 mb-6 space-y-1 text-center'}>
                <li>📊 Monitoramento de até <b>{plan.max_libraries}</b> bibliotecas</li>
                <li>🧬 Até <b>{plan.max_clones}</b> páginas clonadas + {plan.max_anticlone} com anticlone</li>
                {plan.max_quizzes !== undefined && plan.max_quizzes !== null && (
                  <li>📝 Até <b>{plan.max_quizzes === -1 ? 'ilimitados' : plan.max_quizzes}</b> quizzes clonados</li>
                )}
                {plan.quiz_extra_price !== undefined && plan.quiz_extra_price !== null && plan.max_quizzes !== null && plan.max_quizzes !== -1 && (
                  <li>➕ Quiz adicional: <b>R$ {plan.quiz_extra_price},00</b></li>
                )}
                {plan.max_cloaker_requests && <li>🛡️ Cloaker incluso com até <b>{plan.max_cloaker_requests.toLocaleString('pt-BR')}</b> requisições/mês</li>}
                {plan.name === 'intermediario' && <li>⚠️ Excedente: R$ 3,00 a cada 1.000 requisições extras</li>}
                {plan.name === 'avancado' && <li>⚠️ Excedente: R$ 2,00 a cada 1.000 requisições extras</li>}
                {Array.isArray(plan.features) && plan.features.map((f: string, i: number) => <li key={i}>{f}</li>)}
              </ul>
              <a href={plan.checkout_url} className={theme === 'dark'
                ? `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-[#2563eb] text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
                : `w-full py-3 ${idx === 1 ? 'bg-yellow-400 text-black' : idx === 2 ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'} rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors text-center`
              }>Assinar {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}</a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 