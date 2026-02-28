import { api } from '@/store/AuthStore';
import {
    MemberResponse,
    MemberCreate,
    MemberUpdate,
    MemberListResponse,
    MemberRenew,
    MemberProfileResponse,
    MemberStatus,
    MemberUniquenessCheckRequest,
    MemberUniquenessCheckResponse,
} from '@/types/index';

/**
 * Get all members for the current tenant with pagination and filters
 */
export const getMembers = async (
    page: number = 1,
    pageSize: number = 50,
    search?: string,
    statusFilter?: MemberStatus,
    reportType?: 'expiring_soon' | 'expired' | 'outstanding_dues',
    daysAhead?: number
): Promise<MemberListResponse> => {
    const params: any = { page, page_size: pageSize };
    if (search) params.search = search;
    if (statusFilter) params.status_filter = statusFilter;
    if (reportType) params.report_type = reportType;
    if (daysAhead) params.days_ahead = daysAhead;

    const response = await api.get<MemberListResponse>('/members/', { params });
    return response.data;
};

/**
 * Get a single member by ID
 */
export const getMemberById = async (memberId: number): Promise<MemberResponse> => {
    const response = await api.get<MemberResponse>(`/members/${memberId}`);
    return response.data;
};

/**
 * Create a new member
 */
export const createMember = async (memberData: MemberCreate): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>('/members/', memberData);
    return response.data;
};

/**
 * Update an existing member
 */
export const updateMember = async (
    memberId: number,
    memberData: MemberUpdate
): Promise<MemberResponse> => {
    const response = await api.put<MemberResponse>(`/members/${memberId}`, memberData);
    return response.data;
};

/**
 * Delete a member
 */
export const deleteMember = async (memberId: number): Promise<void> => {
    await api.delete(`/members/${memberId}`);
};

/**
 * Renew a member's membership
 */
export const renewMembership = async (
    memberId: number,
    renewalData: MemberRenew
): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>(`/members/${memberId}/renew`, renewalData);
    return response.data;
};

/**
 * Get detailed member profile with payment history
 */
export const getMemberProfile = async (memberId: number): Promise<MemberProfileResponse> => {
    const response = await api.get<MemberProfileResponse>(`/members/${memberId}/profile`);
    return response.data;
};

/**
 * Upload member photo (before or after)
 */
export const uploadMemberPhoto = async (
    memberId: number,
    photoType: 'before' | 'after',
    photoUrl: string
): Promise<MemberResponse> => {
    const response = await api.post<MemberResponse>(
        `/members/${memberId}/photo/${photoType}`,
        null,
        { params: { photo_url: photoUrl } }
    );
    return response.data;
};

/**
 * Export all members to CSV
 */
export const exportMembersCSV = async (): Promise<void> => {
    const response = await api.get('/members/export/csv', {
        responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `members_export.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

// ---- Progress Tracking ----

export interface ProgressRecord {
    id: number;
    member_id: number;
    tenant_id: number;
    measurement_date: string;
    weight?: number;
    height?: number;
    bmi?: number;
    body_fat_percentage?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface ProgressCreate {
    measurement_date: string;
    weight?: number;
    height?: number;
    bmi?: number;
    body_fat_percentage?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    arms?: number;
    thighs?: number;
    notes?: string;
}

export const getMemberProgress = async (memberId: number): Promise<{ data: ProgressRecord[]; total: number }> => {
    const response = await api.get(`/members/${memberId}/progress`);
    return response.data;
};

export const addMemberProgress = async (memberId: number, data: ProgressCreate): Promise<ProgressRecord> => {
    const response = await api.post<ProgressRecord>(`/members/${memberId}/progress`, data);
    return response.data;
};

export const deleteMemberProgress = async (recordId: number): Promise<void> => {
    await api.delete(`/members/progress/${recordId}`);
};

/**
 * Validate member uniqueness (email, phone)
 */
export const validateMemberUniqueness = async (
    data: MemberUniquenessCheckRequest
): Promise<MemberUniquenessCheckResponse> => {
    const response = await api.post<MemberUniquenessCheckResponse>(
        '/members/validate-uniqueness',
        data
    );
    return response.data;
};
