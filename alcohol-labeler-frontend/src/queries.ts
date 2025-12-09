import { Query, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { LabelValidationResponse, JobCreateResponse } from './types';
import { VALIDATION_STATUS } from './types';

// Create label validation job
export function useCreateLabelValidation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData: FormData): Promise<JobCreateResponse> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/label-validations`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLabelValidations'] });
      queryClient.invalidateQueries({ queryKey: ['labelValidation'] });
    },
  });
}

// Poll for label validation result
export function useLabelValidation(jobId: string | null) {
  return useQuery({
    queryKey: ['labelValidation', jobId],
    queryFn: async (): Promise<LabelValidationResponse> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/label-validations/${jobId}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch validation result");
      }
      
      return response.json();
    },
    enabled: !!jobId,
    refetchInterval: (query: Query<LabelValidationResponse>) => {
      return query.state.data?.status === VALIDATION_STATUS.PROCESSING ? 1000 : false;
    },
    refetchIntervalInBackground: false,
  });
}

// Fetch all label validations
export function useAllLabelValidations() {
  return useQuery({
    queryKey: ['allLabelValidations'],
    queryFn: async (): Promise<LabelValidationResponse[]> => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/label-validations`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch all validation results");
      }
      
      return response.json();
    },
    refetchInterval: (query: Query<LabelValidationResponse[]>) => {
      const processing = query.state.data?.some(item => item.status === VALIDATION_STATUS.PROCESSING);
      return processing ? 1000 : false;
    },
    refetchIntervalInBackground: false,
  });
}
