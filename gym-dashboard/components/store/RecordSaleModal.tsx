'use client';

import { useState } from 'react';
import { X, ShoppingBag, DollarSign, Package, CreditCard, Wallet, Smartphone, RefreshCw } from 'lucide-react';
import { StoreProduct, StoreSaleCreate } from '@/types';
import { recordSale } from '@/services/storeService';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface RecordSaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    product: StoreProduct | null;
}

export function RecordSaleModal({ isOpen, onClose, onSuccess, product }: RecordSaleModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'card'>('cash');

    if (!isOpen || !product) return null;

    const totalAmount = (product.price * quantity).toLocaleString();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (quantity > product.quantity) {
            toast.error('Insufficient stock');
            return;
        }

        try {
            setIsLoading(true);
            await recordSale({
                product_id: product.id,
                quantity: quantity,
                payment_method: paymentMethod
            });
            toast.success(`Sale recorded: ${quantity} x ${product.name}`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to record sale:', error);
            toast.error('Failed to record sale');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                    <h2 className="text-xl font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                        <ShoppingBag className="text-primary" />
                        Record Sale
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-text-secondary transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Product Summary */}
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl border border-border">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-border shrink-0">
                            {product.image_url ? (
                                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-secondary/20">
                                    <Package size={24} />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-black text-text-primary leading-tight">{product.name}</h3>
                            <div className="text-xs font-bold text-text-secondary uppercase mt-1 flex items-center gap-2">
                                <span>₹{product.price.toLocaleString()}</span>
                                <span className="w-1 h-1 bg-text-secondary/30 rounded-full" />
                                <span className={cn(
                                    product.quantity <= 5 ? "text-red-500" : "text-emerald-500"
                                )}>
                                    {product.quantity} in stock
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Sale Quantity</label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-xl border border-border flex items-center justify-center font-black text-xl hover:bg-muted transition-all active:scale-90"
                                >
                                    -
                                </button>
                                <div className="flex-1 px-4 py-3 bg-background border border-border rounded-xl text-center font-black text-xl">
                                    {quantity}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setQuantity(Math.min(product.quantity, quantity + 1))}
                                    className="w-12 h-12 rounded-xl border border-border flex items-center justify-center font-black text-xl hover:bg-muted transition-all active:scale-90"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest ml-1">Payment Method</label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'cash', label: 'Cash', icon: Wallet },
                                    { id: 'upi', label: 'UPI', icon: Smartphone },
                                    { id: 'card', label: 'Card', icon: CreditCard }
                                ].map((method) => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setPaymentMethod(method.id as any)}
                                        className={cn(
                                            "flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all active:scale-95",
                                            paymentMethod === method.id
                                                ? "bg-primary border-primary text-white shadow-glow-sm"
                                                : "bg-background border-border text-text-secondary hover:border-primary/30"
                                        )}
                                    >
                                        <method.icon size={18} />
                                        <span className="text-[10px] font-black uppercase">{method.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">Total Amount</span>
                            <span className="text-2xl font-black text-primary">₹{totalAmount}</span>
                        </div>
                        <button
                            disabled={isLoading || product.quantity <= 0}
                            type="submit"
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                        >
                            {isLoading ? (
                                <RefreshCw size={18} className="animate-spin" />
                            ) : (
                                <ShoppingBag size={18} strokeWidth={3} />
                            )}
                            Confirm Sale
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
