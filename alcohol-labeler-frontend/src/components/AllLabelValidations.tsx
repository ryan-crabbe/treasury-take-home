import { useAllLabelValidations } from "../queries";
import { VALIDATION_STATUS } from "../types";
import type { LabelValidationResponse } from "../types";

interface StatusIndicatorProps {
  status: string;
}

function StatusIndicator({ status }: StatusIndicatorProps) {
  switch (status) {
    case VALIDATION_STATUS.PROCESSING:
      return (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-blue-600">Processing</span>
        </div>
      );
    case VALIDATION_STATUS.COMPLETED:
      return (
        <div className="flex items-center">
          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
          <span className="ml-2 text-sm text-green-700">Completed</span>
        </div>
      );
    case VALIDATION_STATUS.FAILED:
      return (
        <div className="flex items-center">
          <div className="h-3 w-3 bg-red-500 rounded-full"></div>
          <span className="ml-2 text-sm text-red-700">Failed</span>
        </div>
      );
    default:
      return (
        <div className="flex items-center">
          <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
          <span className="ml-2 text-sm text-gray-600">Unknown</span>
        </div>
      );
  }
}

interface ValidationRowProps {
  validation: LabelValidationResponse;
}

function ValidationRow({ validation }: ValidationRowProps) {
  return (
    <div className="border-b border-gray-200 py-3 px-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {validation.formData.brandName}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {validation.formData.productClass}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {new Date(validation.createdAt).toLocaleDateString()}{" "}
            {new Date(validation.createdAt).toLocaleTimeString()}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <StatusIndicator status={validation.status} />
        </div>
      </div>
    </div>
  );
}

export default function AllLabelValidations() {
  const { data: validations, isLoading, error } = useAllLabelValidations();

  if (isLoading) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Validations
        </h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading validations...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Validations
        </h2>
        <div className="text-center py-12">
          <div className="text-red-500 mb-2">
            <svg
              className="mx-auto h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-gray-600">Failed to load validations</p>
        </div>
      </div>
    );
  }

  if (!validations || validations.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Validations
        </h2>
        <div className="text-center py-12">
          <div className="text-gray-400 mb-2">
            <svg
              className="mx-auto h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-gray-600">No validations yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Submit a label to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Recent Validations
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {validations.length} validation{validations.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {validations.map((validation) => (
          <ValidationRow key={validation.id} validation={validation} />
        ))}
      </div>
    </div>
  );
}
