import axios from "axios";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "/api"
    : configuredApiUrl || "http://localhost:5000/api";

const FALLBACK_API_ERROR_MESSAGE =
  "Não foi possível concluir a solicitação. Tente novamente em instantes.";

const PASSWORD_RULE_MESSAGE =
  "A senha deve ter pelo menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número.";

const MESSAGE_TRANSLATIONS: Array<[string, string]> = [
  ["password must match", PASSWORD_RULE_MESSAGE],
  [
    "password must be longer than or equal to 8 characters",
    PASSWORD_RULE_MESSAGE,
  ],
  [
    "password must be shorter than or equal to 72 characters",
    "A senha deve ter no máximo 72 caracteres.",
  ],
  ["email must be an email", "Informe um email válido."],
  [
    "email must be shorter than or equal to 254 characters",
    "O email informado é muito longo.",
  ],
  ["whatsapp must match", "Informe um WhatsApp válido com DDD."],
  [
    "whatsapp must be longer than or equal to 10 characters",
    "Informe um WhatsApp válido com DDD.",
  ],
  [
    "whatsapp must be shorter than or equal to 15 characters",
    "Informe um WhatsApp válido com DDD.",
  ],
  ["code must match", "O código deve ter 6 dígitos."],
  ["resettoken must match", "Código de redefinição inválido ou expirado."],
  ["convite invalido ou expirado", "Convite invalido ou expirado."],
  [
    "membro ja possui acesso ao portal",
    "Este membro ja possui acesso ao portal.",
  ],
  [
    "e-mail ou whatsapp ja cadastrado para esta igreja",
    "E-mail ou WhatsApp ja cadastrado para esta igreja.",
  ],
  ["e-mail ja cadastrado", "E-mail ja cadastrado."],
  [
    "objetivo de doacao nao encontrado",
    "Objetivo de doacao nao encontrado.",
  ],
  [
    "assinatura necessaria para acessar esta funcionalidade",
    "Regularize a assinatura para continuar usando esta funcionalidade.",
  ],
  [
    "chave pix de assinatura nao configurada",
    "O Pix de assinatura ainda nao foi configurado. Fale com o suporte.",
  ],
  ["envie uma imagem", "Envie uma imagem para continuar."],
  [
    "formato de imagem nao permitido",
    "Use uma imagem em JPG/JPEG, PNG ou WebP.",
  ],
  ["arquivo de imagem invalido", "Selecione uma imagem valida."],
  ["a imagem deve ter no maximo 3 mb", "A imagem deve ter no maximo 3 MB."],
  [
    "imagem nao encontrada para esta igreja",
    "Selecione a imagem novamente e tente salvar.",
  ],
  ["regular expression", "Revise os dados informados e tente novamente."],
  ["should not exist", "Revise os dados informados e tente novamente."],
];

export const api = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

export function isUnauthorizedApiError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isForbiddenApiError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 403;
}

export function isSubscriptionRequiredApiError(error: unknown) {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 402 ||
      error.response?.data?.code === "SUBSCRIPTION_REQUIRED")
  );
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return translateApiMessage(message[0]) ?? FALLBACK_API_ERROR_MESSAGE;
    }

    if (typeof message === "string") {
      return translateApiMessage(message) ?? FALLBACK_API_ERROR_MESSAGE;
    }
  }

  return FALLBACK_API_ERROR_MESSAGE;
}

function translateApiMessage(message: unknown) {
  if (typeof message !== "string" || message.trim().length === 0) {
    return null;
  }

  const normalizedMessage = message.trim();
  const lowerMessage = normalizedMessage.toLowerCase();
  const translatedMessage = MESSAGE_TRANSLATIONS.find(([technicalMessage]) =>
    lowerMessage.includes(technicalMessage),
  )?.[1];

  return translatedMessage ?? normalizedMessage;
}
