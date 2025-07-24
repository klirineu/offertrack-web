// DDDs válidos do Brasil
export const validDDDs = [
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19, // São Paulo
  21,
  22,
  24, // Rio de Janeiro
  27,
  28, // Espírito Santo
  31,
  32,
  33,
  34,
  35,
  37,
  38, // Minas Gerais
  41,
  42,
  43,
  44,
  45,
  46, // Paraná
  47,
  48,
  49, // Santa Catarina
  51,
  53,
  54,
  55, // Rio Grande do Sul
  61, // Distrito Federal
  62,
  64, // Goiás
  63, // Tocantins
  65,
  66, // Mato Grosso
  67, // Mato Grosso do Sul
  68, // Acre
  69, // Rondônia
  71,
  73,
  74,
  75,
  77, // Bahia
  79, // Sergipe
  81,
  87, // Pernambuco
  82, // Alagoas
  83, // Paraíba
  84, // Rio Grande do Norte
  85,
  88, // Ceará
  86,
  89, // Piauí
  91,
  93,
  94, // Pará
  92,
  97, // Amazonas
  95, // Roraima
  96, // Amapá
  98,
  99, // Maranhão
];

/**
 * Formata um número de telefone brasileiro com máscara
 * @param value - String com o número de telefone
 * @returns String formatada com máscara (99) 99999-9999
 */
export const formatPhone = (value: string): string => {
  // Remove tudo que não for número
  const numbers = value.replace(/\D/g, "");

  // Aplica a máscara (99) 99999-9999
  if (numbers.length <= 11) {
    if (numbers.length <= 2) {
      return numbers.length === 0 ? "" : `(${numbers}`;
    }
    if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    }
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
      7
    )}`;
  }

  // Se tiver mais que 11 dígitos, corta
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
    7,
    11
  )}`;
};

/**
 * Valida um número de telefone brasileiro
 * @param phoneNumber - String com o número de telefone (pode ter máscara)
 * @returns String com mensagem de erro ou string vazia se válido
 */
export const validatePhone = (phoneNumber: string): string => {
  const numbers = phoneNumber.replace(/\D/g, "");

  // Deve ter exatamente 10 ou 11 dígitos (DDD + número)
  if (numbers.length < 10 || numbers.length > 11) {
    return "Telefone deve ter 10 ou 11 dígitos (com DDD)";
  }

  // Verificar se o DDD é válido
  const ddd = parseInt(numbers.slice(0, 2));
  if (!validDDDs.includes(ddd)) {
    return "DDD inválido. Insira um DDD válido do Brasil";
  }

  // Para números com 11 dígitos, o terceiro dígito deve ser 9 (celular)
  if (numbers.length === 11 && numbers[2] !== "9") {
    return "Para celular (11 dígitos), o terceiro dígito deve ser 9";
  }

  // Para números com 10 dígitos, o terceiro dígito não pode ser 9 (fixo)
  if (numbers.length === 10 && numbers[2] === "9") {
    return "Telefone fixo não pode começar com 9 após o DDD";
  }

  // Verificar se não são todos os dígitos iguais
  const firstDigit = numbers[0];
  if (numbers.split("").every((digit) => digit === firstDigit)) {
    return "Número de telefone inválido";
  }

  return "";
};

/**
 * Remove a formatação do telefone, deixando apenas números
 * @param phoneNumber - String com o número de telefone formatado
 * @returns String com apenas números
 */
export const cleanPhone = (phoneNumber: string): string => {
  return phoneNumber.replace(/\D/g, "");
};

/**
 * Verifica se um número de telefone é válido
 * @param phoneNumber - String com o número de telefone
 * @returns boolean indicando se é válido
 */
export const isValidPhone = (phoneNumber: string): boolean => {
  return validatePhone(phoneNumber) === "";
};
