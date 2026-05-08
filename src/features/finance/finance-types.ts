export type FinancialTransactionType = "REVENUE" | "EXPENSE";

export type FinancialTransactionCategory =
  | "OFFERINGS"
  | "TITHES"
  | "DONATIONS"
  | "MAINTENANCE"
  | "FOOD"
  | "INSTRUMENTS"
  | "TECHNOLOGY"
  | "FURNITURE"
  | "STRUCTURE";

export interface FinancialAccount {
  id: string;
  balance: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinancialCategory {
  value: FinancialTransactionCategory;
  label: string;
}

export interface FinancialCategories {
  revenue: FinancialCategory[];
  expense: FinancialCategory[];
}

export interface FinancialTransaction {
  id: string;
  title: string;
  type: FinancialTransactionType;
  category: FinancialTransactionCategory;
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
  category: FinancialTransactionCategory;
  amount: string;
  date: string;
  isEffective?: boolean;
}

export interface UpdateFinancialTransactionPayload {
  title?: string;
  type?: FinancialTransactionType;
  category?: FinancialTransactionCategory;
  amount?: string;
  date?: string;
}
