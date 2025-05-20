import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext'

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [fullName, setFullName] = useState('');
  const [plans, setPlans] = useState<{ id: string; name: string; price: string }[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string>('');

  const { signUp } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    supabase.from('plans').select('id, name, price').order('price', { ascending: true }).then(({ data }) => {
      if (data) setPlans(data);
    });
    // Pré-selecionar plano se vier na URL
    const planParam = searchParams.get('plan');
    if (planParam) setSelectedPlan(planParam);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      setError('Selecione um plano para continuar.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const { error: signUpError } = await signUp(email, password, { full_name: fullName, plan_id: selectedPlan });
      if (signUpError) {
        setError('Falha ao criar conta. O email já está em uso ou é inválido.');
        setLoading(false);
        return;
      }
      // Buscar checkout_url do plano escolhido
      const { data: plan, error: planError } = await supabase.from('plans').select('checkout_url').eq('id', selectedPlan).single();
      if (planError || !plan?.checkout_url) {
        setError('Erro ao buscar URL de pagamento do plano.');
        setLoading(false);
        return;
      }
      window.location.href = plan.checkout_url;
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12 bg-gray-800 rounded-lg shadow-xl">
          <h2 className="text-3xl font-bold text-center text-white mb-8">
            Criar conta
          </h2>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="full-name" className="block text-sm font-medium text-gray-300">
                Nome
              </label>
              <input
                id="full-name"
                type="text"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome completo"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">
                Confirmar Senha
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="plan" className="block text-sm font-medium text-gray-300">Plano</label>
              <select
                id="plan"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
              >
                <option value="">Selecione um plano</option>
                {plans.map(plan => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name.charAt(0).toUpperCase() + plan.name.slice(1)}
                    {plan.name === 'starter' ? ' (de R$67 por R$37/mês - Lançamento)' : ` (R$ ${plan.price},00)`}
                  </option>
                ))}
              </select>
              {/* Aviso do cupom e valor promocional */}
              {selectedPlan === 'd4d9823e-d0a0-4aba-94e0-a20842908351' && (
                <>
                  <div className="mt-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1 text-center">
                    Para garantir o valor de R$37, use o cupom <b>lancamento</b> no checkout.
                  </div>
                </>
              )
              }
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
              Já tem uma conta? Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 
