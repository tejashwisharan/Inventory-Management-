import React, { useState, useMemo } from 'react';
import { Product, ABCClass, StockStatus } from '../types';
import { calculateABCClasses, getStockStatus, formatCurrency } from '../utils/inventoryMath';
import { Search, Filter, AlertTriangle, ArrowRight, Eye, Plus, X, Save, Box, DollarSign, MapPin } from 'lucide-react';

interface InventoryListProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
}

const INITIAL_FORM_STATE: Partial<Product> = {
  name: '',
  sku: '',
  category: 'General',
  description: '',
  stockLevel: 0,
  safetyStock: 0,
  reorderPoint: 0,
  unitCost: 0,
  unitPrice: 0,
  leadTimeDays: 0,
  demandRate: 0,
  holdingCostPercent: 0.15,
  orderingCost: 0,
  supplier: '',
  location: '',
};

export const InventoryList: React.FC<InventoryListProps> = ({ products, onSelectProduct, onAddProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>(INITIAL_FORM_STATE);

  const abcMap = useMemo(() => calculateABCClasses(products), [products]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const status = getStockStatus(p);
    const matchesStatus = filterStatus === 'ALL' || 
                          (filterStatus === 'LOW' && (status === StockStatus.LOW || status === StockStatus.OUT_OF_STOCK)) ||
                          (filterStatus === status);
    return matchesSearch && matchesStatus;
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku) return;

    const newProduct: Product = {
      id: `p-${Date.now()}`,
      sku: formData.sku!,
      name: formData.name!,
      category: formData.category || 'General',
      description: formData.description || '',
      stockLevel: formData.stockLevel || 0,
      safetyStock: formData.safetyStock || 0,
      reorderPoint: formData.reorderPoint || 0,
      unitCost: formData.unitCost || 0,
      unitPrice: formData.unitPrice || 0,
      leadTimeDays: formData.leadTimeDays || 0,
      demandRate: formData.demandRate || 0,
      holdingCostPercent: formData.holdingCostPercent || 0.15,
      orderingCost: formData.orderingCost || 0,
      supplier: formData.supplier || 'Unknown',
      location: formData.location || 'Unassigned',
      lastCountDate: new Date().toISOString().split('T')[0],
      transactions: [],
    };

    onAddProduct(newProduct);
    setIsModalOpen(false);
    setFormData(INITIAL_FORM_STATE);
  };

  const getStatusBadge = (p: Product) => {
    const status = getStockStatus(p);
    switch (status) {
      case StockStatus.OUT_OF_STOCK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of Stock</span>;
      case StockStatus.LOW:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Low Stock</span>;
      case StockStatus.OVERSTOCK:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Overstock</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Healthy</span>;
    }
  };

  const getABCBadge = (id: string) => {
    const abc = abcMap.get(id);
    const colors: Record<string, string> = {
      [ABCClass.A]: 'bg-purple-100 text-purple-800 border-purple-200',
      [ABCClass.B]: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      [ABCClass.C]: 'bg-slate-100 text-slate-800 border-slate-200',
    };
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 rounded border text-xs font-bold ${colors[abc || 'C']}`}>
        {abc}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Inventory Matrix</h1>
           <p className="text-slate-500">Manage SKUs, track locations, and monitor stock levels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search SKU or Name..." 
                    className="pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <select 
                className="pl-3 pr-8 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
                <option value="ALL">All Status</option>
                <option value="LOW">Low & Out</option>
                <option value="OVERSTOCK">Overstock</option>
                <option value="OK">Healthy</option>
            </select>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors whitespace-nowrap"
            >
                <Plus size={18} />
                <span>Add Item</span>
            </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Product Info</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">ABC Class</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Unit Value</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => onSelectProduct(p)}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-900">{p.name}</span>
                                    <span className="text-xs text-slate-500">{p.sku} • {p.location}</span>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getABCBadge(p.id)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                {getStatusBadge(p)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                                {p.stockLevel} <span className="text-slate-400 font-normal">/ {p.reorderPoint} (RP)</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-slate-600">
                                {formatCurrency(p.unitCost)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-800">
                                {formatCurrency(p.unitCost * p.stockLevel)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                <button onClick={(e) => { e.stopPropagation(); onSelectProduct(p); }} className="text-blue-600 hover:text-blue-800 p-2">
                                    <Eye size={18} />
                                </button>
                            </td>
                        </tr>
                    ))}
                    {filteredProducts.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                No products found matching your criteria.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-slate-100 p-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Box className="text-blue-600" size={20} />
                Add New Product
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              
              {/* Section: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                    <input 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Steel Bearing"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">SKU *</label>
                    <input 
                      required
                      name="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. ME-105"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="General">General</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                      <option value="Packaging">Packaging</option>
                      <option value="Chemicals">Chemicals</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 text-slate-400" size={16} />
                      <input 
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="e.g. A-01-12"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Product details and specifications..."
                    />
                  </div>
                </div>
              </div>

              {/* Section: Inventory Control */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Inventory Control</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Level</label>
                    <input 
                      type="number"
                      name="stockLevel"
                      min="0"
                      value={formData.stockLevel}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Safety Stock</label>
                    <input 
                      type="number"
                      name="safetyStock"
                      min="0"
                      value={formData.safetyStock}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Reorder Point</label>
                    <input 
                      type="number"
                      name="reorderPoint"
                      min="0"
                      value={formData.reorderPoint}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Lead Time (Days)</label>
                    <input 
                      type="number"
                      name="leadTimeDays"
                      min="0"
                      value={formData.leadTimeDays}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Financials & Suppliers */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 pb-2">Financials & Supplier</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Cost ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                          type="number"
                          name="unitCost"
                          min="0"
                          step="0.01"
                          value={formData.unitCost}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit Price ($)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                          type="number"
                          name="unitPrice"
                          min="0"
                          step="0.01"
                          value={formData.unitPrice}
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                  </div>
                   <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Ordering Cost ($)</label>
                    <input 
                      type="number"
                      name="orderingCost"
                      min="0"
                      value={formData.orderingCost}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                   <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Supplier Name</label>
                    <input 
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g. Acme Industries"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Est. Daily Demand</label>
                    <input 
                      type="number"
                      name="demandRate"
                      min="0"
                      step="0.1"
                      value={formData.demandRate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm flex items-center gap-2 transition-colors"
                >
                  <Save size={18} />
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};