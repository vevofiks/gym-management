import { Layout } from '@/components/layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import SubscriptionGuard from '@/components/SubscriptionGuard';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute>
            <SubscriptionGuard>
                <Layout>{children}</Layout>
            </SubscriptionGuard>
        </ProtectedRoute>
    );
}
