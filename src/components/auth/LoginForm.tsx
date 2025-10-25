import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import LogoIcon from '../../assets/favicon.png';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, isLoading, user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  // Redireciona para o dashboard quando o user for preenchido
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      setError('');
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError('Falha ao fazer login. Verifique suas credenciais.');
        setSubmitting(false);
        return;
      }
      await refreshProfile();
    } catch (err) {
      setError('Ocorreu um erro inesperado. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))' }}>
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md px-8 py-12 rounded-lg shadow-xl" style={{
          background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          boxShadow: '0 0 30px rgba(37, 99, 235, 0.2)'
        }}>
          <div className="flex items-center justify-center mb-8">
            <div className="logo" style={{ fontSize: '1.5rem', padding: '0.5rem' }}>
              <div className="logo-icon" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px' }}>
                <img src={LogoIcon} alt="ClonUp" style={{ width: '40px', height: '40px' }} />
              </div>
              ClonUp
            </div>
          </div>
          <h2 className="text-2xl font-bold text-center text-white mb-2" style={{ textShadow: '0 0 10px rgba(37, 99, 235, 0.5)' }}>
            Bem-vindo(a) ao ClonUp
          </h2>
          <p className="text-1xl text-gray-300 mb-8 text-center" style={{ textShadow: '0 0 10px rgba(37, 99, 235, 0.4)' }}>
            Entre na sua conta para continuar
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-field-wrapper">
              <label htmlFor="email" className="form-field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-field-wrapper">
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="form-field-label">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="cta-button w-full"
            >
              {submitting ? 'Loading...' : 'Entrar'}
            </button>
          </form>
          <div className="mt-6 text-center space-y-4">
            <Link to="/register" className="text-sm text-blue-400 hover:text-blue-300 block">
              Não tem uma conta? Criar conta
            </Link>
            <div className="text-sm text-gray-400">
              Ao entrar, você concorda com nossos{' '}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                termos de uso
              </Link>{' '}
              e{' '}
              <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
                política de privacidade
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Esqueci a Senha */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
      />
    </div>
  );
} 