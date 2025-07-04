import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const formatPhone = (value: string) => {
    // Remove tudo que não for número
    const numbers = value.replace(/\D/g, '');

    // Aplica a máscara (99) 99999-9999
    if (numbers.length <= 11) {
      if (numbers.length <= 2) {
        return numbers.length === 0 ? '' : `(${numbers}`;
      }
      if (numbers.length <= 7) {
        return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      }
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    }

    // Se tiver mais que 11 dígitos, corta
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso e política de privacidade para continuar.');
      return;
    }
    try {
      setError('');
      setLoading(true);
      const { error: signUpError } = await signUp(email, password, {
        full_name: fullName,
        phone: phone.replace(/\D/g, '') // Salva apenas os números
      });
      if (signUpError) {
        setError('Falha ao criar conta. O email já está em uso ou é inválido.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
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
              <label htmlFor="phone" className="block text-sm font-medium text-gray-300">
                Telefone/WhatsApp
              </label>
              <input
                id="phone"
                type="tel"
                required
                className="mt-1 block w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="(99) 99999-9999"
                value={phone}
                onChange={handlePhoneChange}
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
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="w-4 h-4 border border-gray-600 rounded bg-gray-700 focus:ring-3 focus:ring-blue-600"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-300">
                  Aceito os{' '}
                  <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                    termos de uso
                  </Link>{' '}
                  e a{' '}
                  <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                    política de privacidade
                  </Link>
                </label>
              </div>
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
