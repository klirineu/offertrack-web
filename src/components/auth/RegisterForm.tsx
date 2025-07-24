import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { formatPhone, validatePhone, cleanPhone } from '../../utils/phoneValidation';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);

    // Validar apenas se o campo não estiver vazio
    if (formatted.length > 0) {
      const error = validatePhone(formatted);
      setPhoneError(error);
    } else {
      setPhoneError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!acceptTerms) {
      setError('Você precisa aceitar os termos de uso e política de privacidade para continuar.');
      return;
    }

    // Validar telefone antes de enviar
    const phoneValidationError = validatePhone(phone);
    if (phoneValidationError) {
      setPhoneError(phoneValidationError);
      setError('Por favor, corrija os erros no formulário.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const { error: signUpError } = await signUp(email, password, {
        full_name: fullName,
        phone: cleanPhone(phone) // Salva apenas os números
      });
      if (signUpError) {
        setError('Falha ao criar conta. O email já está em uso ou é inválido.');
        setLoading(false);
        return;
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Erro no cadastro:', error);
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
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  required
                  className={`mt-1 block w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent pr-10 ${phoneError
                    ? 'border-red-500 focus:ring-red-500'
                    : phone.length >= 14 && !phoneError
                      ? 'border-green-500 focus:ring-green-500'
                      : 'border-gray-600 focus:ring-blue-500'
                    }`}
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={handlePhoneChange}
                />
                {phoneError ? (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                ) : phone.length >= 14 && !phoneError ? (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : null}
              </div>
              {phoneError ? (
                <p className="mt-1 text-sm text-red-500">
                  {phoneError}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-400">
                  Digite seu telefone com DDD. Ex: (11) 99999-9999
                </p>
              )}
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
