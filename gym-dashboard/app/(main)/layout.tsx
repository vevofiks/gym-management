'use client';

import { Layout } from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <Layout>{children}</Layout>
        </ProtectedRoute>
    );
}
