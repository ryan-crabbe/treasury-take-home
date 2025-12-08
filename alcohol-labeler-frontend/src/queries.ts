import { Query, useMutation, useQuery } from '@tanstack/react-query';
import type { AlcoholLabelFormData, LabelValidationResponse, JobCreateResponse } from './types';

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
      return query.state.data?.status === 'processing' ? 1000 : false;
    },
    refetchIntervalInBackground: false,
  });
}
