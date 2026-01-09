import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: api.getStats,
  });
};

export const useRevenueData = () => {
  return useQuery({
    queryKey: ['revenue-history'],
    queryFn: api.getRevenueHistory,
  });
};

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: api.getMembers,
  });
};

export const useExpiringMembers = () => {
  return useQuery({
    queryKey: ['members-expiring'],
    queryFn: api.getExpiringMembers,
  });
};

export const useSendPaymentLink = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberId: string) => api.sendPaymentLink(memberId),
    onSuccess: () => {
      // In a real app, toast notification would go here
      console.log("Payment link sent successfully");
    }
  });
};

// Finance Hooks
export const useFinancialSummary = () => {
  return useQuery({
    queryKey: ['financial-summary'],
    queryFn: api.getFinancialSummary,
  });
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: api.getTransactions,
  });
};

export const useOutstandingPayments = () => {
  return useQuery({
    queryKey: ['outstanding-payments'],
    queryFn: api.getOutstandingPayments,
  });
};

// Analytics Hooks
export const useAnalyticsMetrics = () => {
  return useQuery({
    queryKey: ['analytics-metrics'],
    queryFn: api.getAnalyticsMetrics,
  });
};

export const useMemberGrowth = () => {
  return useQuery({
    queryKey: ['member-growth'],
    queryFn: api.getMemberGrowth,
  });
};

export const useAttendanceData = () => {
  return useQuery({
    queryKey: ['attendance-data'],
    queryFn: api.getAttendanceData,
  });
};

export const usePlanDistribution = () => {
  return useQuery({
    queryKey: ['plan-distribution'],
    queryFn: api.getPlanDistribution,
  });
};

// Settings Hooks
export const useGymSettings = () => {
  return useQuery({
    queryKey: ['gym-settings'],
    queryFn: api.getGymSettings,
  });
};

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ['notification-preferences'],
    queryFn: api.getNotificationPreferences,
  });
};

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['user-profile'],
    queryFn: api.getUserProfile,
  });
};

export const useBillingInfo = () => {
  return useQuery({
    queryKey: ['billing-info'],
    queryFn: api.getBillingInfo,
  });
};

export const useUpdateGymSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateGymSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-settings'] });
      console.log("Gym settings updated successfully");
    }
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateNotificationPreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      console.log("Notification preferences updated successfully");
    }
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateUserProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      console.log("User profile updated successfully");
    }
  });
};

