import { api } from '@/store/AuthStore';
import {
    DietPlanTemplateCreate,
    DietPlanTemplateUpdate,
    DietPlanTemplateResponse,
    DietPlanListResponse,
    DietPlanAssignmentCreate,
    DietPlanAssignmentResponse,
} from '@/types';

/**
 * Create a new diet plan template
 */
export const createTemplate = async (
    data: DietPlanTemplateCreate
): Promise<DietPlanTemplateResponse> => {
    const response = await api.post<DietPlanTemplateResponse>('/diet-plans/templates', data);
    return response.data;
};

/**
 * List all diet plan templates
 */
export const listTemplates = async (params: {
    category?: string;
    active_only?: boolean;
}): Promise<DietPlanListResponse> => {
    const response = await api.get<DietPlanListResponse>('/diet-plans/templates', { params });
    return response.data;
};

/**
 * Get a specific diet plan template by ID
 */
export const getTemplate = async (templateId: number): Promise<DietPlanTemplateResponse> => {
    const response = await api.get<DietPlanTemplateResponse>(`/diet-plans/templates/${templateId}`);
    return response.data;
};

/**
 * Update a diet plan template
 */
export const updateTemplate = async (
    templateId: number,
    data: DietPlanTemplateUpdate
): Promise<DietPlanTemplateResponse> => {
    const response = await api.put<DietPlanTemplateResponse>(
        `/diet-plans/templates/${templateId}`,
        data
    );
    return response.data;
};

/**
 * Delete a diet plan template (soft delete)
 */
export const deleteTemplate = async (templateId: number): Promise<void> => {
    await api.delete(`/diet-plans/templates/${templateId}`);
};

/**
 * Assign a diet plan to a member
 */
export const assignToMember = async (
    data: DietPlanAssignmentCreate
): Promise<DietPlanAssignmentResponse> => {
    const response = await api.post<DietPlanAssignmentResponse>('/diet-plans/assign', data);
    return response.data;
};

/**
 * Get all diet plans assigned to a specific member
 */
export const getMemberDietPlans = async (
    memberId: number
): Promise<DietPlanAssignmentResponse[]> => {
    const response = await api.get<DietPlanAssignmentResponse[]>(
        `/diet-plans/members/${memberId}/plans`
    );
    return response.data;
};
