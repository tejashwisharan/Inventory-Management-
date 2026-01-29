import React from 'react';
import { Product, StockStatus } from '../types';
import { getStockStatus, formatCurrency } from '../utils/inventoryMath';
import { AlertCircle, DollarSign, RefreshCw, Box, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  products: Product[];
  onNavigate: (page: string) => void;
}

const StatCard = ({ title, value, subtext, icon: Icon, colorClass, trend }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg ${colorClass}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
    <div className="mt-4 flex items-center text-sm">
        {trend === 'up' && <ArrowUpRight size={16} className="text-green-500 mr-1" />}
        {trend === 'down' && <ArrowDownRight size={16} className="text-red-500 mr-1" />}
      <span className="text-slate-400">{subtext}</span>
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ products, onNavigate }) => {
  const totalValue = products.reduce((acc, p) => acc + (p.stockLevel * p.unitCost), 0);
  const lowStockItems = products.filter(p => getStockStatus(p) === StockStatus.LOW).length;
  const outOfStockItems = products.filter(p => getStockStatus(p) === StockStatus.OUT_OF_STOCK).length;
  // Simplistic turn rate avg
  const avgTurnRate = (products.reduce((acc, p) => acc + (p.demandRate * 365 / Math.max(1, p.stockLevel)), 0) / products.length).toFixed(1);

  const categoryData = Object.values(products.reduce((acc: any, p) => {
      if (!acc[p.category]) acc[p.category] = { name: p.category, value: 0 };
      acc[p.category].value += (p.stockLevel * p.unitCost);
      return acc;
  }, {}));

  const stockHealthData = [
      { name: 'Healthy', value: products.filter(p => getStockStatus(p) === StockStatus.OK).length, color: '#22c55e' },
      { name: 'Low', value: lowStockItems, color: '#eab308' },
      { name: 'Critical', value: outOfStockItems, color: '#ef4444' },
      { name: 'Overstock', value: products.filter(p => getStockStatus(p) === StockStatus.OVERSTOCK).length, color: '#3b82f6' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
           <p className="text-slate-500">Real-time inventory overview & performance metrics.</p>
        </div>
        <div className="mt-4 md:mt-0">
             <button onClick={() => onNavigate('ai-analyst')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <Box size={16} />
                <span>Ask AI Assistant</span>
             </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Inventory Value" 
          value={formatCurrency(totalValue)} 
          subtext="Based on weighted avg cost"
          icon={DollarSign}
          colorClass="bg-emerald-500"
          trend="up"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStockItems} 
          subtext={`${outOfStockItems} out of stock`}
          icon={AlertCircle}
          colorClass={lowStockItems > 0 ? "bg-amber-500" : "bg-slate-400"}
          trend="down"
        />
        <StatCard 
          title="Avg Turnover Rate" 
          value={`${avgTurnRate}x`} 
          subtext="Annualized turns"
          icon={RefreshCw}
          colorClass="bg-blue-500"
          trend="up"
        />
        <StatCard 
          title="Total SKUs" 
          value={products.length} 
          subtext="Active in catalog"
          icon={Box}
          colorClass="bg-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Value by Category Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm col-span-2">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Inventory Value by Category</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} tickFormatter={(val) => `$${val}`} />
                        <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: number) => formatCurrency(value)}
                        />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Stock Health */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-6">Stock Health Status</h3>
             <div className="space-y-4">
                 {stockHealthData.map((item) => (
                     <div key={item.name} className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                             <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-slate-600 font-medium">{item.name}</span>
                         </div>
                         <div className="flex items-center space-x-2">
                            <span className="text-slate-900 font-bold">{item.value}</span>
                            <span className="text-xs text-slate-400">SKUs</span>
                         </div>
                     </div>
                 ))}
             </div>
             <div className="mt-8 pt-6 border-t border-slate-100">
                <p className="text-sm text-slate-500 leading-relaxed">
                   <strong>Insight:</strong> You have {outOfStockItems} critical stockouts. Immediate replenishment is recommended for high-velocity items to avoid revenue loss.
                </p>
             </div>
        </div>
      </div>
    </div>
  );
};
