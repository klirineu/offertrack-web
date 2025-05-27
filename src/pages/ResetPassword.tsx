import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // Troca o token de recovery por uma sessão válida
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const token = params.get("token");
    const type = params.get("type");

    async function handleRecovery() {
      if (access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      } else if (token && type === "recovery") {
        await supabase.auth.exchangeCodeForSession(token);
      }
    }
    handleRecovery();
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Trocar senha</h2>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success ? (
          <div className="text-green-600 text-center font-semibold">
            Senha alterada com sucesso! Redirecionando...
          </div>
        ) : (
          <>
            <input
              type="password"
              placeholder="Nova senha"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="border rounded px-4 py-2"
              required
              minLength={8}
            />
            <input
              type="password"
              placeholder="Confirme a nova senha"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="border rounded px-4 py-2"
              required
              minLength={8}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white rounded px-4 py-2 font-semibold hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Trocar senha"}
            </button>
          </>
        )}
      </form>
    </div>
  );
} 