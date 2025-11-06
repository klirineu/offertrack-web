# 🔧 Solução para Problema de Cache na Vercel

## 🐛 Problema
O HTML está sendo salvo corretamente no Git e na Vercel, mas quando acessado no navegador, ainda mostra o conteúdo antigo (ex: logo antiga). Não é cache do navegador, parece ser cache da Vercel/CDN.

## ✅ Soluções Implementadas no Frontend

### 1. Cache-Busting Agressivo
- Timestamp único em cada requisição
- Parâmetros aleatórios (`?_t=timestamp&_r=random&nocache=1`)
- Headers anti-cache em todas as requisições

### 2. Múltiplas Camadas de Sincronização
- 4 camadas de sincronização de atributos do DOM vivo
- Última sincronização imediatamente antes de serializar o HTML
- Garante que valores atualizados sejam capturados

### 3. Logs de Debug
- Logs no console mostram o HTML sendo enviado
- Mostra todos os `src` das imagens
- Ajuda a identificar se o problema está no frontend ou backend

## 🔨 Ações Necessárias no Backend/Vercel

### 1. Verificar Headers de Cache na Rota `/api/clone/save`
```javascript
// No backend, garantir que a resposta tenha:
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
```

### 2. Verificar Headers de Cache ao Servir os Sites
```javascript
// Ao servir o site (ex: ${subdomain}.clonup.site)
// Adicionar headers anti-cache:
res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
res.setHeader('Pragma', 'no-cache');
res.setHeader('Expires', '0');
res.setHeader('ETag', Date.now().toString()); // ETag único
```

### 3. Configurar vercel.json para Desabilitar Cache
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        },
        {
          "key": "Pragma",
          "value": "no-cache"
        },
        {
          "key": "Expires",
          "value": "0"
        }
      ]
    }
  ]
}
```

### 4. Invalidar Cache da Vercel após Salvar
Após salvar o HTML, o backend deve:
- Invalidar o cache da Vercel para aquele subdomínio
- Ou fazer um redeploy automático
- Ou usar a API da Vercel para invalidar o cache

### 5. Verificar se o HTML está sendo Salvo Corretamente
Adicionar logs no backend para verificar:
```javascript
console.log('[Backend] HTML recebido:', {
  length: html.length,
  hasImg: html.includes('<img'),
  imgSrcs: Array.from(html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)).map(m => m[1])
});
```

## 🔍 Como Verificar

1. **Verificar no Console do Navegador:**
   - Abra o DevTools (F12)
   - Vá em Network
   - Procure pela requisição ao site
   - Verifique os headers de resposta
   - Verifique se há cache headers como `Cache-Control: public, max-age=...`

2. **Verificar o HTML Enviado:**
   - No console, procure por `[Save] HTML sendo enviado:`
   - Verifique se os `imgSrcs` mostram a URL nova da imagem
   - Compare com o HTML que está sendo servido

3. **Testar Diretamente:**
   - Acesse `https://subdomain.clonup.site?_t=123456&nocache=1`
   - Verifique o View Source (Ctrl+U)
   - Procure pela tag `<img>` e verifique o `src`

## 🎯 Próximos Passos

1. **Verificar Backend:**
   - Adicionar logs para ver o HTML recebido
   - Verificar se está salvando corretamente
   - Verificar headers de resposta

2. **Configurar Vercel:**
   - Adicionar headers anti-cache no `vercel.json`
   - Ou configurar no painel da Vercel

3. **Invalidar Cache:**
   - Após salvar, invalidar o cache da Vercel
   - Ou fazer um redeploy automático

## 📝 Nota Importante

O problema pode estar em:
1. **Cache da Vercel CDN** - A Vercel pode estar fazendo cache do HTML antigo
2. **Backend não está salvando** - O HTML pode não estar sendo persistido corretamente
3. **Backend servindo HTML antigo** - O backend pode estar lendo de um cache local

Verifique qual desses é o problema usando os logs e verificações acima.

