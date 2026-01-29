import { Product, ABCClass, StockStatus } from '../types';

export const calculateEOQ = (demandRate: number, orderingCost: number, holdingCostPercent: number, unitCost: number): number => {
  // Annual Demand
  const D = demandRate * 365;
  // Ordering Cost
  const S = orderingCost;
  // Annual Holding Cost per unit (H = i * C)
  const H = holdingCostPercent * unitCost;

  if (H === 0) return 0;
  
  // EOQ = sqrt(2DS / H)
  return Math.round(Math.sqrt((2 * D * S) / H));
};

export const getStockStatus = (p: Product): StockStatus => {
  if (p.stockLevel === 0) return StockStatus.OUT_OF_STOCK;
  if (p.stockLevel <= p.reorderPoint) return StockStatus.LOW;
  // Arbitrary overstock threshold: > 3x reorder point + safety stock
  if (p.stockLevel > (p.reorderPoint * 3 + p.safetyStock)) return StockStatus.OVERSTOCK;
  return StockStatus.OK;
};

export const calculateABCClasses = (products: Product[]): Map<string, ABCClass> => {
  // 1. Calculate annual usage value for each product
  const usageValues = products.map(p => ({
    id: p.id,
    value: p.demandRate * 365 * p.unitCost
  }));

  // 2. Sort descending
  usageValues.sort((a, b) => b.value - a.value);

  // 3. Calculate total value
  const totalValue = usageValues.reduce((sum, item) => sum + item.value, 0);

  // 4. Assign classes based on cumulative percentage
  // A: Top 80% of value (~20% of items)
  // B: Next 15% of value (~30% of items)
  // C: Bottom 5% of value (~50% of items)
  
  let currentAccumulatedValue = 0;
  const classification = new Map<string, ABCClass>();

  usageValues.forEach(item => {
    currentAccumulatedValue += item.value;
    const percentage = currentAccumulatedValue / totalValue;

    if (percentage <= 0.80) {
      classification.set(item.id, ABCClass.A);
    } else if (percentage <= 0.95) {
      classification.set(item.id, ABCClass.B);
    } else {
      classification.set(item.id, ABCClass.C);
    }
  });

  return classification;
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
