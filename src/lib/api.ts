import axios from "axios";

const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const apiBaseUrl =
  process.env.NODE_ENV === "production"
    ? "/api"
    : configuredApiUrl || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: apiBaseUrl,
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
      return message[0] ?? "Não foi possível concluir a solicitação.";
    }

    if (typeof message === "string") {
      return message;
    }
  }

  return "Não foi possível concluir a solicitação.";
}
