import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { InventoryList } from './pages/InventoryList';
import { ProductDetail } from './pages/ProductDetail';
import { AIAdvisor } from './pages/AIAdvisor';
import { INITIAL_PRODUCTS } from './constants';
import { Product } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (page !== 'product-detail') {
      setSelectedProduct(null);
    }
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product-detail');
  };

  const handleAddProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    // Optional: Navigate to the new product or stay on list
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard products={products} onNavigate={handleNavigate} />;
      case 'inventory':
        return (
          <InventoryList 
            products={products} 
            onSelectProduct={handleSelectProduct} 
            onAddProduct={handleAddProduct} 
          />
        );
      case 'product-detail':
        return selectedProduct ? (
          <ProductDetail product={selectedProduct} onBack={() => handleNavigate('inventory')} />
        ) : (
          <InventoryList 
            products={products} 
            onSelectProduct={handleSelectProduct} 
            onAddProduct={handleAddProduct}
          />
        );
      case 'ai-analyst':
        return <AIAdvisor products={products} />;
      case 'forecasting':
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500">
                <h2 className="text-2xl font-bold mb-2">Demand Forecasting Module</h2>
                <p>Advanced statistical forecasting (Holt-Winters, ARIMA) coming soon.</p>
                <button onClick={() => handleNavigate('dashboard')} className="mt-4 text-blue-600 hover:underline">Return to Dashboard</button>
            </div>
        );
      default:
        return <Dashboard products={products} onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activePage={currentPage} onNavigate={handleNavigate}>
      {renderContent()}
    </Layout>
  );
};

export default App;
