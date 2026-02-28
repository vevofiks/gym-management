'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    ShoppingBag,
    TrendingUp,
    Plus,
    Search,
    Package,
    History,
    Edit2,
    Trash2,
    RefreshCw,
    Lock,
    ShoppingBasket,
    AlertCircle
} from 'lucide-react';
import { useSubscriptionStore } from '@/store/SubscriptionStore';
import { getProducts, getStoreStats, getSales, deleteProduct } from '@/services/storeService';
import { StoreProduct, StoreStats, StoreSale } from '@/types';
import toast from 'react-hot-toast';
import { cn, getPublicUrl } from '@/lib/utils';
import { AddProductModal } from '@/components/store/AddProductModal';
import { RecordSaleModal } from '@/components/store/RecordSaleModal';
import { format } from 'date-fns';

export default function StorePage() {
    const { hasFeature, subscription } = useSubscriptionStore();
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stats, setStats] = useState<StoreStats | null>(null);
    const [products, setProducts] = useState<StoreProduct[]>([]);
    const [sales, setSales] = useState<StoreSale[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'inventory' | 'sales'>('inventory');

    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<StoreProduct | null>(null);

    const hasAccess = hasFeature('store');

    const fetchData = useCallback(async () => {
        if (!hasAccess) return;
        try {
            setIsRefreshing(true);
            const [statsData, productsData, salesData] = await Promise.all([
                getStoreStats(),
                getProducts(),
                getSales(0, 50)
            ]);
            setStats(statsData);
            setProducts(productsData);
            setSales(salesData);
        } catch (error) {
            console.error('Failed to fetch store data:', error);
            toast.error('Failed to load store data');
        } finally {
            setIsRefreshing(false);
            setIsLoading(false);
        }
    }, [hasAccess]);

    useEffect(() => {
        if (hasAccess) {
            fetchData();
        } else {
            setIsLoading(false);
        }
    }, [fetchData, hasAccess]);

    const handleAddProduct = () => {
        setSelectedProduct(null);
        setIsAddModalOpen(true);
    };

    const handleEditProduct = (product: StoreProduct) => {
        setSelectedProduct(product);
        setIsAddModalOpen(true);
    };

    const handleDeleteProduct = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        try {
            await deleteProduct(id);
            toast.success('Product deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const handleSellProduct = (product: StoreProduct) => {
        setSelectedProduct(product);
        setIsSaleModalOpen(true);
    };

    if (!hasAccess && !isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 p-8">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                    <Lock size={40} className="text-primary" />
                </div>
                <div className="text-center max-w-md">
                    <h2 className="text-2xl font-black text-text-primary uppercase tracking-tight mb-2">
                        Pro Store Feature
                    </h2>
                    <p className="text-text-secondary font-medium mb-6">
                        The Gym Store feature is exclusive to Pro users. Track product inventory, sales, and revenue seamlessly. Upgrade your plan to unlock these retail capabilities.
                    </p>
                    <button className="px-8 py-3 rounded-xl bg-primary text-white font-black uppercase text-xs tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95">
                        Upgrade to Pro
                    </button>
                </div>
            </div>
        );
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-end gap-4">
                <div className="flex gap-3">
                    <button
                        onClick={fetchData}
                        disabled={isRefreshing}
                        className="p-3 rounded-xl bg-card border border-border text-text-secondary hover:text-primary transition-all active:scale-95 shadow-soft"
                    >
                        <RefreshCw size={20} className={cn(isRefreshing && "animate-spin")} />
                    </button>
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                        onClick={handleAddProduct}
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add Product
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                        <p className="text-text-secondary font-bold uppercase tracking-widest text-[10px]">Syncing Storefront...</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                            <div className="p-2 w-fit bg-primary/10 rounded-xl text-primary mb-4">
                                <TrendingUp size={20} />
                            </div>
                            <div className="text-2xl font-black text-text-primary">
                                ₹{stats?.total_sales_amount.toLocaleString() || '0'}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Sales Revenue</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                            <div className="p-2 w-fit bg-emerald-500/10 rounded-xl text-emerald-500 mb-4">
                                <ShoppingBasket size={20} />
                            </div>
                            <div className="text-2xl font-black text-text-primary">
                                {stats?.total_sales_count || 0}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Total Orders</div>
                        </div>

                        <div className="bg-card border border-border p-6 rounded-3xl shadow-soft">
                            <div className="p-2 w-fit bg-blue-500/10 rounded-xl text-blue-500 mb-4">
                                <Package size={20} />
                            </div>
                            <div className="text-2xl font-black text-text-primary">
                                {stats?.product_count || 0}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Active Products</div>
                        </div>

                        <div className={cn(
                            "bg-card border p-6 rounded-3xl shadow-soft",
                            (stats?.low_stock_products.length || 0) > 0 ? "border-red-500/50 bg-red-500/5" : "border-border"
                        )}>
                            <div className={cn(
                                "p-2 w-fit rounded-xl mb-4",
                                (stats?.low_stock_products.length || 0) > 0 ? "bg-red-500/10 text-red-500" : "bg-text-secondary/10 text-text-secondary"
                            )}>
                                <AlertCircle size={20} />
                            </div>
                            <div className={cn(
                                "text-2xl font-black",
                                (stats?.low_stock_products.length || 0) > 0 ? "text-red-500" : "text-text-primary"
                            )}>
                                {stats?.low_stock_products.length || 0}
                            </div>
                            <div className="text-xs font-bold text-text-secondary uppercase tracking-wider">Low Stock Alerts</div>
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div className="bg-card border border-border rounded-[2.5rem] shadow-soft overflow-hidden">
                        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6 bg-muted/30">
                            <div className="flex bg-background p-1.5 rounded-2xl border border-border w-fit">
                                <button
                                    onClick={() => setActiveTab('inventory')}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === 'inventory' ? "bg-primary text-white shadow-glow" : "text-text-secondary hover:text-text-primary"
                                    )}
                                >
                                    <Package size={16} />
                                    Inventory
                                </button>
                                <button
                                    onClick={() => setActiveTab('sales')}
                                    className={cn(
                                        "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === 'sales' ? "bg-primary text-white shadow-glow" : "text-text-secondary hover:text-text-primary"
                                    )}
                                >
                                    <History size={16} />
                                    Sales History
                                </button>
                            </div>

                            <div className="relative group max-w-md w-full">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search size={18} className="text-text-secondary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search products by name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl text-sm font-medium placeholder:text-text-secondary/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-inner-sm"
                                />
                            </div>
                        </div>

                        <div className="p-8">
                            {activeTab === 'inventory' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <div key={product.id} className="group bg-background border border-border rounded-3xl overflow-hidden hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                                                <div className="aspect-square relative overflow-hidden bg-muted">
                                                    {product.image_url ? (
                                                        <img
                                                            src={getPublicUrl(product.image_url) || ''}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                                                            <Package size={64} strokeWidth={1} />
                                                        </div>
                                                    )}
                                                    <div className="absolute top-4 right-4 flex gap-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditProduct(product); }}
                                                            className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-text-secondary hover:text-primary shadow-sm hover:scale-110 transition-all"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }}
                                                            className="p-2 rounded-xl bg-white/90 backdrop-blur-sm text-text-secondary hover:text-red-500 shadow-sm hover:scale-110 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                    <div className="absolute bottom-4 left-4">
                                                        <div className={cn(
                                                            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                                                            product.quantity > 10 ? "bg-emerald-500/90 text-white" :
                                                                product.quantity > 0 ? "bg-orange-500/90 text-white" : "bg-red-500/90 text-white"
                                                        )}>
                                                            {product.quantity > 0 ? `${product.quantity} In Stock` : 'Out of Stock'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="text-lg font-black text-text-primary mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                                                    <p className="text-xs text-text-secondary font-medium line-clamp-2 min-h-8 mb-4">
                                                        {product.description || 'No description provided.'}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <div className="text-xl font-black text-text-primary">₹{product.price.toLocaleString()}</div>
                                                        <button
                                                            disabled={product.quantity <= 0}
                                                            className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                                                            onClick={() => handleSellProduct(product)}
                                                        >
                                                            Quick Sell
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                                                <ShoppingBag size={32} className="text-text-secondary/50" />
                                            </div>
                                            <h3 className="text-xl font-black text-text-primary uppercase mb-2">No Products Found</h3>
                                            <p className="text-text-secondary max-w-sm mb-8 font-medium">Add some products to your gym store (like creatine, protein, or apparel) to start tracking inventory.</p>
                                            <button
                                                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all active:scale-95"
                                                onClick={() => handleAddProduct()}
                                            >
                                                Add Your First Product
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {sales.length === 0 ? (
                                        <div className="text-center py-20">
                                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <History size={24} className="text-text-secondary/50" />
                                            </div>
                                            <h3 className="text-lg font-black text-text-primary uppercase">No Sales Yet</h3>
                                            <p className="text-xs text-text-secondary font-medium">Record your first sale to see it in history.</p>
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="border-b border-border">
                                                        <th className="px-4 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Date</th>
                                                        <th className="px-4 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Product</th>
                                                        <th className="px-4 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-center">Qty</th>
                                                        <th className="px-4 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest">Method</th>
                                                        <th className="px-4 py-4 text-[10px] font-black text-text-secondary uppercase tracking-widest text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border/50">
                                                    {sales.map((sale) => (
                                                        <tr key={sale.id} className="hover:bg-muted/50 transition-colors group">
                                                            <td className="px-4 py-4 text-xs font-bold text-text-secondary">
                                                                {format(new Date(sale.sale_date), 'dd MMM, HH:mm')}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-black text-text-primary">
                                                                {sale.product_name || 'Product'}
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-bold text-text-secondary text-center">
                                                                {sale.quantity}
                                                            </td>
                                                            <td className="px-4 py-4">
                                                                <span className="px-2 py-1 rounded-lg bg-muted text-[10px] font-black uppercase tracking-tighter text-text-secondary">
                                                                    {sale.payment_method}
                                                                </span>
                                                            </td>
                                                            <td className="px-4 py-4 text-sm font-black text-primary text-right">
                                                                ₹{Number(sale.total_amount).toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* Modals */}
            <AddProductModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
                productToEdit={selectedProduct}
            />
            <RecordSaleModal
                isOpen={isSaleModalOpen}
                onClose={() => setIsSaleModalOpen(false)}
                onSuccess={fetchData}
                product={selectedProduct}
            />
        </div>
    );
}
