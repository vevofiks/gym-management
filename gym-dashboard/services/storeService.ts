import { api } from '@/store/AuthStore';
import {
    StoreProduct,
    StoreProductCreate,
    StoreSale,
    StoreSaleCreate,
    StoreStats,
} from '@/types';

export const getProducts = async (activeOnly: boolean = true): Promise<StoreProduct[]> => {
    const response = await api.get('/store/products', {
        params: { active_only: activeOnly }
    });
    return response.data;
};

export const getProduct = async (id: number): Promise<StoreProduct> => {
    const response = await api.get(`/store/products/${id}`);
    return response.data;
};

export const createProduct = async (product: StoreProductCreate): Promise<StoreProduct> => {
    const response = await api.post('/store/products', product);
    return response.data;
};

export const updateProduct = async (id: number, product: Partial<StoreProductCreate>): Promise<StoreProduct> => {
    const response = await api.put(`/store/products/${id}`, product);
    return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
    await api.delete(`/store/products/${id}`);
};

export const recordSale = async (sale: StoreSaleCreate): Promise<StoreSale> => {
    const response = await api.post('/store/sales', sale);
    return response.data;
};

export const getSales = async (skip: number = 0, limit: number = 100): Promise<StoreSale[]> => {
    const response = await api.get('/store/sales', {
        params: { skip, limit }
    });
    return response.data;
};

export const getStoreStats = async (): Promise<StoreStats> => {
    const response = await api.get('/store/stats');
    return response.data;
};

export const uploadImage = async (file: File): Promise<{ filename: string; url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/store/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
