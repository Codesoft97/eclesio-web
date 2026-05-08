import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export function isUnauthorizedApiError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;

    if (Array.isArray(message)) {
      return message[0] ?? "Nao foi possivel concluir a solicitacao.";
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Nao foi possivel concluir a solicitacao.";
}
