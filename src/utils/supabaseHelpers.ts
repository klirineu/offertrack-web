/**
 * Helper para adicionar timeout em promessas do Supabase
 * Previne requisições bloqueadas indefinidamente após troca de abas
 */

/**
 * Envolve uma promessa com um timeout
 * @param promise A promessa a ser executada
 * @param timeoutMs Tempo limite em milissegundos (padrão: 10 segundos)
 * @returns A promessa original ou uma rejeição com timeout
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operação do Supabase excedeu o timeout de ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

/**
 * Verifica se o cliente Supabase está saudável fazendo uma chamada simples com timeout
 * @param supabaseClient Instância do cliente Supabase
 * @param timeoutMs Tempo limite para a verificação (padrão: 5 segundos)
 * @returns true se o cliente está respondendo, false caso contrário
 */
export async function isSupabaseClientHealthy(
  supabaseClient: { auth: { getSession: () => Promise<unknown> } },
  timeoutMs: number = 5000
): Promise<boolean> {
  try {
    await withTimeout(supabaseClient.auth.getSession(), timeoutMs);
    return true;
  } catch (error) {
    console.warn('Cliente Supabase não está respondendo:', error);
    return false;
  }
}

