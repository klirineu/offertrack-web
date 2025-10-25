import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { formatPhone, validatePhone, cleanPhone } from '../../utils/phoneValidation';
import LogoIcon from '../../assets/favicon.png';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
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

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFullName(value);
    setNameValid(value.length >= 2);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setEmailValid(emailRegex.test(value));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordValid(value.length >= 6);
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
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))' }}>
      {/* Logo à esquerda */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="text-center">
          <div className="logo mb-8" style={{ fontSize: '3rem', padding: '1rem' }}>
            <div className="logo-icon mx-auto mb-4" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', height: '80px' }}>
              <img src={LogoIcon} alt="ClonUp" style={{ width: '80px', height: '80px' }} />
            </div>
            <div className="text-white font-bold" style={{ textShadow: '0 0 20px rgba(37, 99, 235, 0.8)' }}>ClonUp</div>
          </div>
        </div>
        {/* Efeitos neon de fundo */}
        <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </div>

      {/* Form à direita */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md px-8 py-12 rounded-lg shadow-xl" style={{
          background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(37, 99, 235, 0.3)',
          boxShadow: '0 0 30px rgba(37, 99, 235, 0.2)'
        }}>
          <h2 className="text-3xl font-bold text-center text-white m-2" style={{ textShadow: '0 0 10px rgba(37, 99, 235, 0.5)' }}>
            Criar conta
          </h2>
          <p className="text-1xl text-gray-300 mb-8 text-center" style={{ textShadow: '0 0 10px rgba(37, 99, 235, 0.4)' }}>
            Junte-se à plataforma de marketing digital
          </p>
          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-field-wrapper">
              <label htmlFor="full-name" className="form-field-label">
                Nome
              </label>
              <input
                id="full-name"
                type="text"
                required
                className={`form-input ${fullName.length > 0 ? (nameValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : ''}`}
                placeholder="Seu nome completo"
                value={fullName}
                onChange={handleNameChange}
              />
            </div>
            <div className="form-field-wrapper">
              <label htmlFor="phone" className="form-field-label">
                Telefone/WhatsApp
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  required
                  className={`form-input pr-10 ${phoneError
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
                <div className="form-field-error-message">
                  {phoneError}
                </div>
              ) : (
                <p className="mt-1 text-xs text-gray-400">
                  Digite seu telefone com DDD. Ex: (11) 99999-9999
                </p>
              )}
            </div>
            <div className="form-field-wrapper">
              <label htmlFor="email" className="form-field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                className={`form-input ${email.length > 0 ? (emailValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={handleEmailChange}
              />
            </div>
            <div className="form-field-wrapper">
              <label htmlFor="password" className="form-field-label">
                Senha
              </label>
              <input
                id="password"
                type="password"
                required
                className={`form-input ${password.length > 0 ? (passwordValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={handlePasswordChange}
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
              className="cta-button w-full"
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
