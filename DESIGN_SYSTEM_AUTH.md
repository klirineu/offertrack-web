# 🎨 Design System - Autenticação (Login/Cadastro)

## 📋 Visão Geral

Este documento contém o design system completo para as telas de autenticação do ClonUp, incluindo Login, Cadastro e Recuperação de Senha.

---

## 🎯 Componentes Principais

### 1. **LoginForm** (`src/components/auth/LoginForm.tsx`)

#### **Estrutura Visual**

```tsx
<div className="min-h-screen flex flex-col" style={{
  background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))'
}}>
  <div className="flex-1 flex items-center justify-center">
    <div className="w-full max-w-md px-8 py-12 rounded-lg shadow-xl" style={{
      background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(37, 99, 235, 0.3)',
      boxShadow: '0 0 30px rgba(37, 99, 235, 0.2)'
    }}>
```

#### **Logo ClonUp**

```tsx
<div className="logo" style={{ fontSize: "1.5rem", padding: "0.5rem" }}>
  <div
    className="logo-icon"
    style={{
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
    }}
  >
    <img
      src={LogoIcon}
      alt="ClonUp"
      style={{ width: "40px", height: "40px" }}
    />
  </div>
  ClonUp
</div>
```

#### **Títulos e Textos**

```tsx
<h2 className="text-2xl font-bold text-center text-white mb-2" style={{
  textShadow: '0 0 10px rgba(37, 99, 235, 0.5)'
}}>
  Bem-vindo(a) ao ClonUp
</h2>
<p className="text-1xl text-gray-300 mb-8 text-center" style={{
  textShadow: '0 0 10px rgba(37, 99, 235, 0.4)'
}}>
  Entre na sua conta para continuar
</p>
```

#### **Campos de Formulário**

```tsx
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
```

#### **Botão Principal**

```tsx
<button type="submit" disabled={submitting} className="cta-button w-full">
  {submitting ? "Loading..." : "Entrar"}
</button>
```

#### **Links e Textos Secundários**

```tsx
<Link
  to="/register"
  className="text-sm text-blue-400 hover:text-blue-300 block"
>
  Não tem uma conta? Criar conta
</Link>
```

---

### 2. **RegisterForm** (`src/components/auth/RegisterForm.tsx`)

#### **Layout Split (Logo + Form)**

```tsx
<div className="min-h-screen flex" style={{
  background: 'linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))'
}}>
  {/* Logo à esquerda */}
  <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
    <div className="text-center">
      <div className="logo mb-8" style={{ fontSize: '3rem', padding: '1rem' }}>
        <div className="logo-icon mx-auto mb-4" style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '80px',
          height: '80px'
        }}>
          <img src={LogoIcon} alt="ClonUp" style={{ width: '80px', height: '80px' }} />
        </div>
        <div className="text-white font-bold" style={{
          textShadow: '0 0 20px rgba(37, 99, 235, 0.8)'
        }}>ClonUp</div>
      </div>
    </div>
    {/* Efeitos neon de fundo */}
    <div className="absolute top-20 left-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"></div>
    <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl"></div>
  </div>

  {/* Form à direita */}
  <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
```

#### **Validação Visual em Tempo Real**

```tsx
// Estados de validação
const [emailValid, setEmailValid] = useState(false);
const [passwordValid, setPasswordValid] = useState(false);
const [nameValid, setNameValid] = useState(false);

// Handlers de validação
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setEmail(value);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  setEmailValid(emailRegex.test(value));
};

// Input com validação visual
<input
  className={`form-input ${
    email.length > 0
      ? emailValid
        ? "border-green-500 focus:ring-green-500"
        : "border-red-500 focus:ring-red-500"
      : ""
  }`}
  // ... outros props
/>;
```

#### **Validação de Telefone**

```tsx
<div className="relative">
  <input
    className={`form-input pr-10 ${
      phoneError
        ? "border-red-500 focus:ring-red-500"
        : phone.length >= 14 && !phoneError
        ? "border-green-500 focus:ring-green-500"
        : "border-gray-600 focus:ring-blue-500"
    }`}
    // ... outros props
  />
  {phoneError ? (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <AlertCircle className="h-5 w-5 text-red-500" />
    </div>
  ) : phone.length >= 14 && !phoneError ? (
    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
      <svg
        className="h-5 w-5 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  ) : null}
</div>
```

#### **Checkbox de Termos**

```tsx
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
      Aceito os{" "}
      <Link to="/terms" className="text-blue-400 hover:text-blue-300">
        termos de uso
      </Link>{" "}
      e a{" "}
      <Link to="/privacy" className="text-blue-400 hover:text-blue-300">
        política de privacidade
      </Link>
    </label>
  </div>
</div>
```

---

### 3. **ForgotPasswordModal** (`src/components/auth/ForgotPasswordModal.tsx`)

#### **Estrutura do Modal**

```tsx
<div className="modal-overlay">
  <div className="modal-content max-w-md">
    {/* Header */}
    <div className="app-modal-header">
      <div className="flex items-center gap-3">
        <div className="logo-icon" style={{
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '32px',
          height: '32px'
        }}>
          <img src={LogoIcon} alt="ClonUp" style={{ width: '32px', height: '32px' }} />
        </div>
        <h3 className="modal-title">
          🔑 Recuperar Senha
        </h3>
      </div>
      <button onClick={onClose} className="modal-close" disabled={loading}>
        <X className="w-5 h-5" />
      </button>
    </div>
```

#### **Alertas de Sucesso/Erro**

```tsx
{
  /* Success Message */
}
{
  success && (
    <div className="alert alert-success mb-4">
      <span className="alert-icon">✅</span>
      <div className="alert-content">
        <div className="alert-title">Email enviado com sucesso!</div>
        <div className="alert-message">
          Verifique sua caixa de entrada e siga as instruções para redefinir sua
          senha.
        </div>
      </div>
    </div>
  );
}

{
  /* Error Message */
}
{
  error && (
    <div className="alert alert-error mb-4">
      <span className="alert-icon">❌</span>
      <div className="alert-content">
        <div className="alert-title">Erro ao enviar email</div>
        <div className="alert-message">{error}</div>
      </div>
    </div>
  );
}
```

#### **Footer com Botões**

```tsx
<div className="app-modal-footer">
  <button
    type="button"
    onClick={onClose}
    className="secondary-button"
    disabled={loading}
  >
    Cancelar
  </button>
  <button type="submit" disabled={loading || !email} className="cta-button">
    {loading ? "Enviando..." : "Enviar Email"}
  </button>
</div>
```

---

## 🎨 Estilos CSS

### **Background Gradients**

```css
/* Background principal */
background: linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))

/* Card de formulário */
background: linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))
backdrop-filter: blur(10px)
border: 1px solid rgba(37, 99, 235, 0.3)
box-shadow: 0 0 30px rgba(37, 99, 235, 0.2)
```

### **Text Shadows Neon**

```css
/* Títulos principais */
text-shadow: 0 0 10px rgba(37, 99, 235, 0.5)

/* Subtítulos */
text-shadow: 0 0 10px rgba(37, 99, 235, 0.4)

/* Logo grande */
text-shadow: 0 0 20px rgba(37, 99, 235, 0.8)
```

### **Efeitos Neon de Fundo**

```css
/* Círculos decorativos */
.absolute.top-20.left-20.w-96.h-96.rounded-full.bg-blue-500\/10.blur-3xl
  .absolute.bottom-20.right-20.w-80.h-80.rounded-full.bg-cyan-500\/10.blur-3xl;
```

### **Validação Visual**

```css
/* Input válido */
border-green-500 focus:ring-green-500

/* Input inválido */
border-red-500 focus:ring-red-500

/* Input neutro */
border-gray-600 focus:ring-blue-500
```

---

## 🔧 Classes CSS Principais

### **Form Fields**

```css
.form-field-wrapper {
  margin-bottom: 1.5rem;
}

.form-field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
  text-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 0.5rem;
  color: var(--text);
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

### **Botões**

```css
.cta-button {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.secondary-button {
  background: rgba(30, 41, 59, 0.8);
  color: var(--text-secondary);
  border: 1px solid rgba(37, 99, 235, 0.3);
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-shadow: 0 0 5px rgba(37, 99, 235, 0.3);
}
```

### **Modal**

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(11, 15, 25, 0.95),
    rgba(30, 41, 59, 0.9)
  );
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(
    135deg,
    rgba(11, 15, 25, 0.95),
    rgba(30, 41, 59, 0.9)
  );
  border-radius: 1rem;
  box-shadow: 0 0 50px rgba(37, 99, 235, 0.3);
  border: 1px solid rgba(37, 99, 235, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
}

.app-modal-header {
  background: linear-gradient(
    135deg,
    rgba(11, 15, 25, 0.95),
    rgba(30, 41, 59, 0.9)
  );
  padding: 1.5rem;
  border-bottom: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 1rem 1rem 0 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 600;
  text-shadow: 0 0 10px rgba(37, 99, 235, 0.5);
}

.modal-close {
  background: rgba(30, 41, 59, 0.8);
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-modal-body {
  padding: 1.5rem;
}

.app-modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(37, 99, 235, 0.3);
  background: linear-gradient(
    135deg,
    rgba(11, 15, 25, 0.95),
    rgba(30, 41, 59, 0.9)
  );
  border-radius: 0 0 1rem 1rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}
```

---

## 📱 Responsividade

### **Breakpoints**

- **Mobile**: `< 768px` - Layout vertical único
- **Tablet**: `768px - 1024px` - Layout adaptativo
- **Desktop**: `> 1024px` - Layout split (logo + form)

### **Adaptações Mobile**

```tsx
{/* Logo só aparece em desktop */}
<div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
  {/* Logo grande */}
</div>

{/* Form ocupa tela toda em mobile */}
<div className="flex-1 lg:w-1/2 flex items-center justify-center p-8">
```

---

## 🎯 Estados e Interações

### **Estados de Loading**

```tsx
// Botão de submit
{submitting ? 'Loading...' : 'Entrar'}
{loading ? 'Criando conta...' : 'Criar conta'}
{loading ? 'Enviando...' : 'Enviar Email'}

// Botão desabilitado
disabled={submitting}
disabled={loading}
disabled={loading || !email}
```

### **Estados de Validação**

```tsx
// Estados booleanos
const [emailValid, setEmailValid] = useState(false);
const [passwordValid, setPasswordValid] = useState(false);
const [nameValid, setNameValid] = useState(false);

// Classes condicionais
className={`form-input ${email.length > 0 ? (emailValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500') : ''}`}
```

### **Estados de Erro**

```tsx
{
  error && (
    <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded text-red-500">
      {error}
    </div>
  );
}
```

---

## 🔗 Links e Navegação

### **Links Internos**

```tsx
<Link to="/register" className="text-sm text-blue-400 hover:text-blue-300 block">
  Não tem uma conta? Criar conta
</Link>

<Link to="/login" className="text-sm text-blue-400 hover:text-blue-300">
  Já tem uma conta? Entrar
</Link>
```

### **Links Externos**

```tsx
<Link to="/terms" className="text-blue-400 hover:text-blue-300">
  termos de uso
</Link>

<Link to="/privacy" className="text-blue-400 hover:text-blue-300">
  política de privacidade
</Link>
```

---

## 🎨 Paleta de Cores

### **Cores Principais**

- **Background**: `rgba(11, 15, 25, 0.95)` - Azul escuro profundo
- **Background Secundário**: `rgba(30, 41, 59, 0.9)` - Azul escuro médio
- **Primary**: `rgba(37, 99, 235, 0.3)` - Azul neon
- **Text**: `#ffffff` - Branco
- **Text Secondary**: `var(--text-secondary)` - Cinza claro

### **Cores de Validação**

- **Sucesso**: `border-green-500` / `text-green-500`
- **Erro**: `border-red-500` / `text-red-500`
- **Neutro**: `border-gray-600` / `text-gray-400`

### **Cores de Links**

- **Link Normal**: `text-blue-400`
- **Link Hover**: `text-blue-300`

---

## 📋 Checklist de Implementação

### **LoginForm**

- [ ] Background com gradiente escuro
- [ ] Card com blur e borda neon
- [ ] Logo ClonUp centralizada
- [ ] Título com text-shadow neon
- [ ] Campos de email e senha
- [ ] Link "Esqueci a senha"
- [ ] Botão CTA com gradiente
- [ ] Links para cadastro e termos
- [ ] Modal de recuperação de senha

### **RegisterForm**

- [ ] Layout split (logo + form)
- [ ] Logo grande à esquerda
- [ ] Efeitos neon de fundo
- [ ] Validação visual em tempo real
- [ ] Campos: nome, telefone, email, senha
- [ ] Validação de telefone com ícones
- [ ] Checkbox de termos
- [ ] Botão CTA com loading
- [ ] Link para login

### **ForgotPasswordModal**

- [ ] Modal overlay com blur
- [ ] Header com logo e título
- [ ] Botão de fechar
- [ ] Alertas de sucesso/erro
- [ ] Campo de email
- [ ] Botões cancelar/enviar
- [ ] Estados de loading

---

## 🚀 Exemplo de Uso Completo

```tsx
// LoginForm completo
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);

  const { signIn, isLoading, user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))",
      }}
    >
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-full max-w-md px-8 py-12 rounded-lg shadow-xl"
          style={{
            background:
              "linear-gradient(135deg, rgba(11, 15, 25, 0.95), rgba(30, 41, 59, 0.9))",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(37, 99, 235, 0.3)",
            boxShadow: "0 0 30px rgba(37, 99, 235, 0.2)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div
              className="logo"
              style={{ fontSize: "1.5rem", padding: "0.5rem" }}
            >
              <div
                className="logo-icon"
                style={{
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                }}
              >
                <img
                  src={LogoIcon}
                  alt="ClonUp"
                  style={{ width: "40px", height: "40px" }}
                />
              </div>
              ClonUp
            </div>
          </div>

          {/* Títulos */}
          <h2
            className="text-2xl font-bold text-center text-white mb-2"
            style={{
              textShadow: "0 0 10px rgba(37, 99, 235, 0.5)",
            }}
          >
            Bem-vindo(a) ao ClonUp
          </h2>
          <p
            className="text-1xl text-gray-300 mb-8 text-center"
            style={{
              textShadow: "0 0 10px rgba(37, 99, 235, 0.4)",
            }}
          >
            Entre na sua conta para continuar
          </p>

          {/* Formulário */}
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
              {submitting ? "Loading..." : "Entrar"}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-4">
            <Link
              to="/register"
              className="text-sm text-blue-400 hover:text-blue-300 block"
            >
              Não tem uma conta? Criar conta
            </Link>
            <div className="text-sm text-gray-400">
              Ao entrar, você concorda com nossos{" "}
              <Link to="/terms" className="text-blue-400 hover:text-blue-300">
                termos de uso
              </Link>{" "}
              e{" "}
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
```

---

## 📚 Recursos Adicionais

### **Utilitários de Validação**

- `formatPhone()` - Formatação de telefone
- `validatePhone()` - Validação de telefone
- `cleanPhone()` - Limpeza de telefone

### **Ícones**

- `AlertCircle` - Ícone de erro
- `X` - Ícone de fechar
- `Check` - Ícone de sucesso

### **Assets**

- `LogoIcon` - Logo do ClonUp (favicon.png)

---

**🎨 Design System de Autenticação ClonUp - Completo e Documentado!** ✨
