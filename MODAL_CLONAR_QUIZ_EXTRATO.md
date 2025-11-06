# 📋 Extrato Completo - Modal de Clonar Quiz

## 🎯 Índice

1. [Estados e Variáveis](#estados-e-variáveis)
2. [Funções Auxiliares](#funções-auxiliares)
3. [Função Principal de Clonagem](#função-principal-de-clonagem)
4. [Modal de Clonagem](#modal-de-clonagem)
5. [Modal de Sucesso](#modal-de-sucesso)
6. [Função da API](#função-da-api)

---

## 📦 Estados e Variáveis

```typescript
// Estados do modal
const [modalOpen, setModalOpen] = useState(false);
const [successModalOpen, setSuccessModalOpen] = useState(false);

// Estados do formulário
const [originalUrl, setOriginalUrl] = useState("");
const [subdomain, setSubdomain] = useState("");
const [quizType, setQuizType] = useState<"inlead" | "xquiz" | "cakto">(
  "inlead"
);

// Estados de validação e erros
const [subdomainError, setSubdomainError] = useState<string | null>(null);
const [slugModified, setSlugModified] = useState<string | null>(null);
const [errorMsg, setErrorMsg] = useState<string | null>(null);

// Estados de loading
const [actionLoading, setActionLoading] = useState<"zip" | "save" | null>(null);

// Dados do quiz clonado (para modal de sucesso)
const [clonedQuizData, setClonedQuizData] = useState<{
  id: string;
  slug: string;
  url: string;
  title: string;
  originalUrl?: string;
  steps?: unknown[];
} | null>(null);
```

---

## 🔧 Funções Auxiliares

### 1. Validação de Subdomínio

```typescript
function validateSubdomain(value: string) {
  if (!/^[a-zA-Z0-9-]{1,20}$/.test(value)) {
    return "Use até 20 letras, números ou hífen (-)";
  }
  return null;
}
```

### 2. Verificar Subdomínio Único

```typescript
async function checkSubdomainUnique(sub: string) {
  const { data: site } = await supabase
    .from("cloned_sites")
    .select("subdomain")
    .eq("subdomain", sub)
    .maybeSingle();

  const { data: quiz } = await supabase
    .from("quizzes")
    .select("slug")
    .eq("slug", sub)
    .maybeSingle();

  return !site && !quiz;
}
```

---

## 🚀 Função Principal de Clonagem

```typescript
const handleAddQuiz = async () => {
  if (!user) return;

  setActionLoading("save");
  setErrorMsg(null);

  try {
    // 1. Validação do subdomínio
    const err = validateSubdomain(subdomain);
    if (err) {
      setSubdomainError(err);
      setActionLoading(null);
      return;
    }

    // 2. Verificar se o slug já existe e gerar um único se necessário
    let finalSubdomain = subdomain;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const unique = await checkSubdomainUnique(finalSubdomain);
      if (unique) {
        break; // Slug é único, pode usar
      }

      // Gerar novo slug com ID único
      const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos do timestamp
      finalSubdomain = `${subdomain}-${timestamp}`;
      attempts++;
    }

    if (attempts >= maxAttempts) {
      setSubdomainError(
        "Não foi possível gerar um nome único. Tente outro nome."
      );
      setActionLoading(null);
      return;
    }

    // 3. Se o slug foi modificado, informar ao usuário
    if (finalSubdomain !== subdomain) {
      console.log(`Slug modificado de "${subdomain}" para "${finalSubdomain}"`);
      setSlugModified(
        `Nome "${subdomain}" já estava em uso. Usando "${finalSubdomain}" automaticamente.`
      );
      setSubdomain(finalSubdomain); // Atualizar o campo para mostrar o slug final
    }

    // 4. Chamar API para clonar o quiz com autenticação JWT
    // Usar rota baseada no tipo de quiz selecionado
    const apiRoute =
      quizType === "xquiz"
        ? "/api/clone/xquiz"
        : quizType === "cakto"
        ? "/api/clone/cakto"
        : "/api/clone/quiz";

    const res = await cloneQuizWithAuth(originalUrl, finalSubdomain, apiRoute);
    const responseData = res.data;

    if (!responseData.success) {
      setErrorMsg(
        "Erro ao clonar quiz: " + (responseData.message || "Erro desconhecido")
      );
      setActionLoading(null);
      return;
    }

    // 5. Atualizar lista de quizzes
    const { data: quizzesData, error: quizzesError } =
      await fetchQuizzesService(user.id);
    if (quizzesError) console.error("Erro ao carregar quizzes:", quizzesError);
    if (quizzesData) setQuizzes(quizzesData);

    // 6. Salvar dados do quiz clonado para mostrar no modal de sucesso
    setClonedQuizData(responseData.data);

    // 7. Limpar formulário e fechar modal
    setModalOpen(false);
    setOriginalUrl("");
    setSubdomain("");
    setSubdomainError(null);
    setSlugModified(null);
    setQuizType("inlead");

    // 8. Abrir modal de sucesso
    setSuccessModalOpen(true);
  } catch (error) {
    console.error("Erro ao adicionar quiz:", error);
    setErrorMsg("Erro inesperado ao clonar quiz");
  } finally {
    setActionLoading(null);
  }
};
```

---

## 🎨 Modal de Clonagem

```typescript
{
  modalOpen && (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        {/* Header do Modal */}
        <div className="app-modal-header">
          <h2 className="modal-title">Clonar Quiz</h2>
          <button
            onClick={() => {
              if (actionLoading === "save") return; // Não permite fechar durante clonagem
              setModalOpen(false);
              setOriginalUrl("");
              setSubdomain("");
              setSubdomainError(null);
              setSlugModified(null);
              setErrorMsg(null);
              setQuizType("inlead");
            }}
            className="modal-close"
            disabled={actionLoading === "save"}
            style={{
              opacity: actionLoading === "save" ? 0.5 : 1,
              cursor: actionLoading === "save" ? "not-allowed" : "pointer",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body do Modal */}
        <div className="app-modal-body">
          {/* Aviso durante clonagem */}
          {actionLoading === "save" && (
            <div
              className="mb-6 p-4 rounded-lg border-2 border-blue-500/30"
              style={{
                background:
                  "linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(59, 130, 246, 0.05))",
                border: "1px solid rgba(37, 99, 235, 0.3)",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-300 mb-1">
                    🚀 Clonagem em andamento...
                  </h3>
                  <p className="text-xs text-blue-200/80 leading-relaxed">
                    <strong>Importante:</strong> O processo de clonagem pode
                    demorar alguns minutos.
                    <br />
                    <span className="text-yellow-300">
                      ⚠️ Não feche esta aba nem atualize a página
                    </span>{" "}
                    até que o processo seja concluído.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {/* Campo: Tipo de Quiz */}
            <div className="form-field-wrapper">
              <label className="form-field-label">Tipo de Quiz</label>
              <select
                value={quizType}
                onChange={(e) =>
                  setQuizType(e.target.value as "inlead" | "xquiz" | "cakto")
                }
                className="form-input"
                disabled={actionLoading === "save"}
              >
                <option value="inlead">Inlead</option>
                <option value="xquiz">XQuiz (BETA) 🚀</option>
                <option value="cakto">Cakto Quiz 🎯</option>
              </select>

              {/* Aviso XQuiz */}
              {quizType === "xquiz" && (
                <div
                  className="mt-2 p-3 rounded-lg"
                  style={{
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    ⚠️ <strong>BETA:</strong> Esta funcionalidade está em fase
                    de testes. Pode haver instabilidades.
                  </p>
                </div>
              )}

              {/* Aviso Cakto */}
              {quizType === "cakto" && (
                <div
                  className="mt-2 p-3 rounded-lg"
                  style={{
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--accent)" }}>
                    🎯 <strong>CAKTO:</strong> Clone quizzes da plataforma Cakto
                    com facilidade e rapidez.
                  </p>
                </div>
              )}
            </div>

            {/* Campo: URL do Quiz */}
            <div className="form-field-wrapper">
              <label className="form-field-label">URL do site do quiz</label>
              <input
                type="url"
                placeholder={
                  quizType === "cakto"
                    ? "https://quiz.cakto.com.br/exemplo-quiz"
                    : quizType === "xquiz"
                    ? "https://xquiz.com/exemplo"
                    : "https://exemplo.com/quiz"
                }
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                className="form-input"
                disabled={actionLoading === "save"}
              />
            </div>

            {/* Campo: Nome do Quiz (Subdomínio) */}
            <div className="form-field-wrapper">
              <label className="form-field-label">
                Nome do quiz (subdomínio)
              </label>
              <input
                type="text"
                placeholder="meuquiz"
                value={subdomain}
                maxLength={20}
                onChange={(e) => {
                  setSubdomain(e.target.value);
                  setSubdomainError(validateSubdomain(e.target.value));
                }}
                className="form-input"
                disabled={actionLoading === "save"}
              />
              {subdomainError && (
                <div className="form-field-error-message">{subdomainError}</div>
              )}
              {slugModified && (
                <div
                  className="mt-2 p-2 rounded-lg"
                  style={{
                    background: "var(--bg-card-hover)",
                    border: "1px solid var(--accent)",
                  }}
                >
                  <p className="text-xs" style={{ color: "var(--accent)" }}>
                    {slugModified}
                  </p>
                </div>
              )}
              {errorMsg && (
                <div className="form-field-error-message">{errorMsg}</div>
              )}
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="app-modal-footer">
          <button
            onClick={() => {
              if (actionLoading === "save") return; // Não permite cancelar durante clonagem
              setModalOpen(false);
              setOriginalUrl("");
              setSubdomain("");
              setSubdomainError(null);
              setSlugModified(null);
              setErrorMsg(null);
              setQuizType("inlead");
            }}
            className="secondary-button"
            disabled={actionLoading === "save"}
            style={{
              opacity: actionLoading === "save" ? 0.5 : 1,
              cursor: actionLoading === "save" ? "not-allowed" : "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleAddQuiz}
            disabled={
              actionLoading === "save" ||
              !originalUrl ||
              !subdomain ||
              !!subdomainError
            }
            className="cta-button"
          >
            {actionLoading === "save" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Clonando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Clonar Quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## ✅ Modal de Sucesso

```typescript
{
  successModalOpen && clonedQuizData && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-lg">
        {/* Header com ícone de sucesso */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
            Quiz Clonado com Sucesso! 🎉
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
            Seu quiz está pronto para ser usado
          </p>
        </div>

        {/* Informações do Quiz */}
        <div className="space-y-4 mb-6">
          {/* Título */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Título
            </label>
            <p className="text-sm text-gray-900 dark:text-white mt-1 break-words">
              {clonedQuizData.title}
            </p>
          </div>

          {/* URL do Quiz */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              URL do Quiz
            </label>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={clonedQuizData.url}
                readOnly
                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(clonedQuizData.url);
                  alert("URL copiada!");
                }}
                className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                title="Copiar URL"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* URL Original */}
          {clonedQuizData.originalUrl && (
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                URL Original
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 break-all">
                {clonedQuizData.originalUrl}
              </p>
            </div>
          )}

          {/* Informações Adicionais */}
          {clonedQuizData.steps && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                📊 <strong>{clonedQuizData.steps.length}</strong> etapas
                clonadas com sucesso
              </p>
            </div>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              window.open(
                `https://quiz.clonup.pro/quiz/${clonedQuizData.id}`,
                "_blank"
              );
            }}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Edit className="w-5 h-5" />
            Editar Quiz
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(clonedQuizData.url);
              alert("URL copiada!");
            }}
            className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 font-medium"
          >
            <Copy className="w-5 h-5" />
            Copiar URL
          </button>
          <button
            onClick={() => {
              setSuccessModalOpen(false);
              setClonedQuizData(null);
            }}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition font-medium"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔌 Função da API

### Arquivo: `src/services/api.ts`

```typescript
import axios from "axios";
import { supabase } from "../lib/supabase";

const api = axios.create({
  baseURL: "https://fastspeed.site",
});

// Função específica para clonar quiz com autenticação JWT
export const cloneQuizWithAuth = async (
  url: string,
  subdomain: string,
  endpoint: string = "/api/clone/quiz"
) => {
  // Obter o token JWT do Supabase Auth
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Usuário não autenticado");
  }

  // Fazer a requisição com autenticação JWT
  const response = await api.post(
    endpoint,
    {
      url,
      subdomain,
    },
    {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response;
};

export default api;
```

---

## 📝 Endpoints da API

A função `handleAddQuiz` seleciona automaticamente o endpoint baseado no tipo de quiz:

```typescript
const apiRoute =
  quizType === "xquiz"
    ? "/api/clone/xquiz"
    : quizType === "cakto"
    ? "/api/clone/cakto"
    : "/api/clone/quiz";
```

- **Inlead**: `/api/clone/quiz` (padrão)
- **XQuiz**: `/api/clone/xquiz`
- **Cakto**: `/api/clone/cakto`

---

## 🎯 Botão para Abrir o Modal

```typescript
<button
  onClick={() => setModalOpen(true)}
  className="cta-button"
  style={{ padding: "0.6rem 1rem", fontSize: "0.875rem" }}
>
  <Plus className="w-4 h-4" />
  Clonar Quiz
</button>
```

---

## 📦 Imports Necessários

```typescript
import { useState } from "react";
import { Plus, Loader2, X, CheckCircle, Copy, Edit } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { fetchQuizzesService } from "../../services/quizzesService";
import { cloneQuizWithAuth } from "../../services/api";
import { supabase } from "../../lib/supabase";
```

---

## ✨ Características Principais

1. **Validação de Subdomínio**: Regex para validar formato (até 20 caracteres, apenas letras, números e hífen)
2. **Verificação de Unicidade**: Verifica se o subdomínio já existe em `cloned_sites` e `quizzes`
3. **Geração Automática de Slug Único**: Se o nome já existe, adiciona timestamp automaticamente
4. **Suporte a Múltiplos Tipos**: Inlead, XQuiz (BETA) e Cakto Quiz
5. **Loading States**: Impede fechar o modal durante a clonagem
6. **Modal de Sucesso**: Exibe informações do quiz clonado com botões de ação
7. **Autenticação JWT**: Usa token do Supabase para autenticar requisições
8. **Tratamento de Erros**: Mensagens de erro claras para o usuário
