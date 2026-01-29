import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getInventoryAnalysis = async (products: Product[], query: string): Promise<string> => {
  try {
    const productSummary = products.map(p => ({
      sku: p.sku,
      name: p.name,
      stock: p.stockLevel,
      status: p.stockLevel <= p.safetyStock ? 'CRITICAL_LOW' : 'OK',
      value: p.stockLevel * p.unitCost,
      turnoverPotential: p.demandRate * 365,
    }));

    const prompt = `
      You are an expert Inventory Manager and Supply Chain Analyst (CPIM certified).
      Analyze the following inventory data summary and answer the user's query.
      
      Data Summary:
      ${JSON.stringify(productSummary.slice(0, 15))}
      ...(truncated for brevity if too long)

      User Query: "${query}"

      Provide a concise, actionable, and professional response. Use markdown formatting.
      If suggesting actions, prioritize by financial impact (High Value items or Stockouts).
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I encountered an error analyzing your inventory. Please check your API key or try again later.";
  }
};

export const getProductOptimization = async (product: Product): Promise<string> => {
  try {
    const prompt = `
      Perform a deep dive inventory optimization analysis for this product:
      Name: ${product.name}
      SKU: ${product.sku}
      Unit Cost: $${product.unitCost}
      Holding Cost %: ${product.holdingCostPercent * 100}%
      Ordering Cost: $${product.orderingCost}
      Avg Daily Demand: ${product.demandRate}
      Lead Time: ${product.leadTimeDays} days
      Current Stock: ${product.stockLevel}
      Safety Stock: ${product.safetyStock}

      Calculate the Economic Order Quantity (EOQ) and explain it.
      Analyze if the current Reorder Point (${product.reorderPoint}) is sufficient.
      Suggest strategies to reduce carrying costs or stockout risks.
      Keep it professional and structured.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to generate optimization strategy.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Optimization analysis unavailable.";
  }
};
