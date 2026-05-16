import { api } from "@/lib/api";

import type { PaginatedResponse, PaginationParams } from "@/lib/pagination";

import type {
  CreateFinancialCategoryPayload,
  CreateFinancialTransactionPayload,
  FinancialAccount,
  FinancialCategories,
  FinancialCategory,
  FinancialTransaction,
  SetAccountBalancePayload,
  UpdateFinancialCategoryPayload,
  UpdateFinancialTransactionPayload,
} from "./finance-types";

export async function getFinanceCategories() {
  const { data } = await api.get<FinancialCategories>("/finance/categories");
  return data;
}

export async function createFinanceCategory(
  payload: CreateFinancialCategoryPayload,
) {
  const { data } = await api.post<FinancialCategory>(
    "/finance/categories",
    payload,
  );
  return data;
}

export async function updateFinanceCategory(
  categoryId: string,
  payload: UpdateFinancialCategoryPayload,
) {
  const { data } = await api.patch<FinancialCategory>(
    `/finance/categories/${categoryId}`,
    payload,
  );
  return data;
}

export async function deleteFinanceCategory(categoryId: string) {
  await api.delete(`/finance/categories/${categoryId}`);
}

export async function getFinanceAccount() {
  const { data } = await api.get<FinancialAccount>("/finance/account");
  return data;
}

export async function setFinanceAccountBalance(
  payload: SetAccountBalancePayload,
) {
  const { data } = await api.put<FinancialAccount>(
    "/finance/account/balance",
    payload,
  );
  return data;
}

export interface ListFinancialTransactionsParams extends PaginationParams {
  month?: string;
}

export async function listFinancialTransactions(
  params?: ListFinancialTransactionsParams,
) {
  const { data } = await api.get<PaginatedResponse<FinancialTransaction>>(
    "/finance/transactions",
    { params },
  );
  return data;
}

export async function createFinancialTransaction(
  payload: CreateFinancialTransactionPayload,
) {
  const { data } = await api.post<FinancialTransaction>(
    "/finance/transactions",
    payload,
  );
  return data;
}

export async function updateFinancialTransaction(
  transactionId: string,
  payload: UpdateFinancialTransactionPayload,
) {
  const { data } = await api.patch<FinancialTransaction>(
    `/finance/transactions/${transactionId}`,
    payload,
  );
  return data;
}

export async function settleFinancialTransaction(transactionId: string) {
  const { data } = await api.post<FinancialTransaction>(
    `/finance/transactions/${transactionId}/settle`,
  );
  return data;
}

export async function deleteFinancialTransaction(transactionId: string) {
  await api.delete(`/finance/transactions/${transactionId}`);
}
