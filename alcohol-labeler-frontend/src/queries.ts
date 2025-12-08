import { Query, useMutation, useQuery } from '@tanstack/react-query';
import type { LabelValidationResponse, JobCreateResponse } from './types';
import { VALIDATION_STATUS } from './types';

// Create label validation job
export function useCreateLabelValidation() {
  return useMutation({
    mutationFn: async (formData: FormData): Promise<JobCreateResponse> => {
      const response = await fetch("/api/validate-label", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit form");
      }

      return response.json();
    },
  });
}

// Poll for label validation result
export function useLabelValidation(jobId: string | null) {
  return useQuery({
    queryKey: ['labelValidation', jobId],
    queryFn: async (): Promise<LabelValidationResponse> => {
      const response = await fetch(`/api/label-validations/${jobId}`);
      
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
      const response = await fetch('/api/label-validations');
      
      if (!response.ok) {
        throw new Error("Failed to fetch all validation results");
      }
      
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds to keep data fresh
    refetchIntervalInBackground: false,
  });
}
