export enum ABCClass {
  A = 'A', // High value, tight control
  B = 'B', // Moderate value, moderate control
  C = 'C', // Low value, loose control
}

export enum StockStatus {
  OK = 'OK',
  LOW = 'LOW',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  OVERSTOCK = 'OVERSTOCK',
}

export interface Transaction {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  note: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  description: string;
  stockLevel: number;
  safetyStock: number;
  reorderPoint: number;
  unitCost: number;
  unitPrice: number;
  leadTimeDays: number;
  demandRate: number; // Avg daily demand
  holdingCostPercent: number; // Annual holding cost as % of unit cost
  orderingCost: number; // Cost to place one order
  supplier: string;
  location: string;
  lastCountDate: string;
  transactions: Transaction[];
}

export interface DashboardMetrics {
  totalInventoryValue: number;
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  averageTurnoverRate: number;
}

export interface AIInsight {
  type: 'FORECAST' | 'OPTIMIZATION' | 'ANOMALY';
  title: string;
  content: string;
  severity: 'info' | 'warning' | 'critical';
}
