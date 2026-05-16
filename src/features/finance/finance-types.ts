export type FinancialTransactionType = "REVENUE" | "EXPENSE";

export interface FinancialAccount {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCategory {
  id: string;
  value: string;
  label: string;
  name: string;
  type: FinancialTransactionType;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCategories {
  revenue: FinancialCategory[];
  expense: FinancialCategory[];
}

export interface FinancialTransaction {
  id: string;
  title: string;
  type: FinancialTransactionType;
  categoryId: string;
  category: FinancialCategory;
  amount: string;
  date: string;
  isEffective: boolean;
  effectiveAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SetAccountBalancePayload {
  balance: string;
}

export interface CreateFinancialTransactionPayload {
  title: string;
  type: FinancialTransactionType;
  categoryId: string;
  amount: string;
  date: string;
  isEffective?: boolean;
}

export interface UpdateFinancialTransactionPayload {
  title?: string;
  type?: FinancialTransactionType;
  categoryId?: string;
  amount?: string;
  date?: string;
}

export interface CreateFinancialCategoryPayload {
  type: FinancialTransactionType;
  name: string;
}

export interface UpdateFinancialCategoryPayload {
  name: string;
}
