import { api } from '@/store/AuthStore';
import {
    WhatsAppStatusResponse,
    WhatsAppQRCodeResponse,
    WhatsAppMessageResponse,
} from '@/types';

export const getWhatsAppStatus = async (): Promise<WhatsAppStatusResponse> => {
    const response = await api.get('/whatsapp/status');
    return response.data;
};

export const getWhatsAppQR = async (): Promise<WhatsAppQRCodeResponse> => {
    const response = await api.get('/whatsapp/qr');
    return response.data;
};

export const logoutWhatsApp = async (): Promise<WhatsAppMessageResponse> => {
    const response = await api.post('/whatsapp/logout');
    return response.data;
};

export const sendTestWhatsAppMessage = async (
    phoneNumber: string,
    message?: string
): Promise<WhatsAppMessageResponse> => {
    const response = await api.post('/whatsapp/test-message', null, {
        params: { phone_number: phoneNumber, message },
    });
    return response.data;
};

export const triggerWhatsAppExpiryReminders = async (days: number = 7): Promise<any> => {
    const response = await api.post('/members/remind-expiry', null, {
        params: { days },
    });
    return response.data;
};
export const resetWhatsAppSession = async (): Promise<WhatsAppMessageResponse> => {
    const response = await api.post('/whatsapp/reset');
    return response.data;
};

export const getWhatsAppSettings = async (): Promise<any> => {
    const response = await api.get('/whatsapp/settings/');
    return response.data;
};

export const updateWhatsAppSettings = async (settings: any): Promise<any> => {
    const response = await api.patch('/whatsapp/settings/', settings);
    return response.data;
};

export const sendBroadcast = async (
    phoneNumbers: string[],
    message: string
): Promise<any> => {
    const response = await api.post('/marketing/broadcast', {
        phone_numbers: phoneNumbers,
        message: message,
    });
    return response.data;
};
