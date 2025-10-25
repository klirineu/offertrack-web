import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X } from 'lucide-react';
import LogoIcon from '../../assets/favicon.png';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Erro ao enviar email de recuperação:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email. Tente novamente.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-md">
        {/* Header */}
        <div className="app-modal-header">
          <div className="flex items-center gap-3">
            <div className="logo-icon" style={{ background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px' }}>
              <img src={LogoIcon} alt="ClonUp" style={{ width: '32px', height: '32px' }} />
            </div>
            <h3 className="modal-title">
              🔑 Recuperar Senha
            </h3>
          </div>
          <button
            onClick={onClose}
            className="modal-close"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="alert alert-success mb-4">
            <span className="alert-icon">✅</span>
            <div className="alert-content">
              <div className="alert-title">Email enviado com sucesso!</div>
              <div className="alert-message">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4">
            <span className="alert-icon">❌</span>
            <div className="alert-content">
              <div className="alert-title">Erro ao enviar email</div>
              <div className="alert-message">{error}</div>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <div className="app-modal-body">
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Digite seu email cadastrado e enviaremos um link para você redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-field-wrapper">
                <label className="form-field-label">
                  Email
                </label>
                <input
                  type="email"
                  required
                  className="form-input"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="app-modal-footer">
                <button
                  type="button"
                  onClick={onClose}
                  className="secondary-button"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !email}
                  className="cta-button"
                >
                  {loading ? 'Enviando...' : 'Enviar Email'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};