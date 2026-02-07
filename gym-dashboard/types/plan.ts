// Membership Plan Types

export interface MembershipPlan {
    id: number;
    tenant_id: number;
    name: string;
    description: string | null;
    duration_days: number;
    price: number;
    features: string[] | null; // Array of feature strings
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlanCreate {
    name: string;
    description?: string;
    duration_days: number;
    price: number;
    features?: string[];
    is_active?: boolean;
}

export interface PlanUpdate {
    name?: string;
    description?: string;
    duration_days?: number;
    price?: number;
    features?: string[];
    is_active?: boolean;
}

export interface PlanStats {
    plan_id: number;
    plan_name: string;
    active_members: number;
    total_revenue: number;
    average_duration: number;
}

export interface PlanListResponse {
    plans: MembershipPlan[];
    total: number;
    page: number;
    page_size: number;
    total_pages: number;
}
