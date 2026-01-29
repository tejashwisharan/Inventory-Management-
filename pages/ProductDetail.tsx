import React, { useState, useEffect } from 'react';
import { Product, StockStatus } from '../types';
import { getStockStatus, formatCurrency, calculateEOQ } from '../utils/inventoryMath';
import { getProductOptimization } from '../services/geminiService';
import { ArrowLeft, Box, TrendingUp, AlertTriangle, Cpu, Truck, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const eoq = calculateEOQ(product.demandRate, product.orderingCost, product.holdingCostPercent, product.unitCost);
  const status = getStockStatus(product);

  useEffect(() => {
    // Generate AI analysis on mount
    const fetchAnalysis = async () => {
      setLoadingAi(true);
      const text = await getProductOptimization(product);
      setAiAnalysis(text);
      setLoadingAi(false);
    };
    fetchAnalysis();
  }, [product]);

  // Mock forecast data for chart
  const forecastData = Array.from({ length: 12 }, (_, i) => ({
    month: `M${i + 1}`,
    demand: Math.floor(product.demandRate * 30 + (Math.random() * 10 - 5)),
  }));

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-slate-800 transition-colors">
        <ArrowLeft size={18} className="mr-1" /> Back to Inventory
      </button>

      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
            <div className="flex items-center space-x-3 mb-1">
                <h1 className="text-3xl font-bold text-slate-900">{product.name}</h1>
                <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs font-mono">{product.sku}</span>
            </div>
            <p className="text-slate-500">{product.description}</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <div className="text-right">
                <p className="text-sm text-slate-500">Current Stock</p>
                <p className={`text-2xl font-bold ${status === StockStatus.LOW || status === StockStatus.OUT_OF_STOCK ? 'text-red-600' : 'text-slate-900'}`}>
                    {product.stockLevel} units
                </p>
            </div>
             <div className="text-right border-l pl-4 border-slate-200">
                <p className="text-sm text-slate-500">Unit Cost</p>
                <p className="text-xl font-semibold text-slate-900">{formatCurrency(product.unitCost)}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Key Metrics */}
        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2 text-slate-500">
                        <Activity size={18} />
                        <span className="text-sm font-medium">Daily Demand</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{product.demandRate} <span className="text-sm font-normal text-slate-400">units/day</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2 text-slate-500">
                        <Truck size={18} />
                        <span className="text-sm font-medium">Lead Time</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{product.leadTimeDays} <span className="text-sm font-normal text-slate-400">days</span></p>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-2 mb-2 text-slate-500">
                        <Box size={18} />
                        <span className="text-sm font-medium">Optimal Order (EOQ)</span>
                    </div>
                    <p className="text-2xl font-bold text-indigo-600">{eoq} <span className="text-sm font-normal text-slate-400">units</span></p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Projected Demand & Stock Depletion</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={forecastData}>
                            <defs>
                                <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <Tooltip />
                            <Area type="monotone" dataKey="demand" stroke="#8884d8" fillOpacity={1} fill="url(#colorDemand)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-fit">
            <div className="flex items-center space-x-2 mb-4">
                <Cpu className="text-indigo-600" size={24} />
                <h3 className="text-lg font-bold text-indigo-900">Gemini Optimization</h3>
            </div>
            
            {loadingAi ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="text-sm text-slate-500">Analyzing supply chain parameters...</p>
                </div>
            ) : (
                <div className="prose prose-sm prose-indigo max-w-none">
                    <div className="bg-indigo-50 p-4 rounded-lg text-slate-700 text-sm leading-relaxed whitespace-pre-line">
                        {aiAnalysis}
                    </div>
                </div>
            )}
            
            <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="text-sm font-semibold text-slate-700 mb-2">Parameters Used</h4>
                <ul className="text-xs text-slate-500 space-y-1">
                    <li className="flex justify-between"><span>Holding Cost:</span> <span>{(product.holdingCostPercent * 100).toFixed(0)}%</span></li>
                    <li className="flex justify-between"><span>Ordering Cost:</span> <span>${product.orderingCost}</span></li>
                    <li className="flex justify-between"><span>Safety Stock:</span> <span>{product.safetyStock}</span></li>
                </ul>
            </div>
        </div>
      </div>
    </div>
  );
};
