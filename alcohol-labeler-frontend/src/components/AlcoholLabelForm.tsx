import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "./ui/button";
import {
  alcoholLabelSchema,
  type AlcoholLabelFormData,
  type LabelValidationResponse,
} from "../types";
import { useCreateLabelValidation, useLabelValidation } from "../queries";
import { ValidationResultModal } from "./ValidationResultModal";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

function FormField({ label, children, error, required }: FormFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}

interface ImageUploadProps {
  onFileChange: (file: File | null) => void;
  error?: string;
  currentFile?: File | null;
}

function ImageUpload({ onFileChange, error }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      onFileChange(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearFile = () => {
    onFileChange(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Label preview"
              className="max-w-full max-h-48 mx-auto rounded-lg"
            />
            <div className="flex justify-center space-x-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={clearFile}
              >
                Remove
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-gray-500">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <p className="text-gray-600">
                Drag and drop your label image here, or{" "}
                <label className="text-blue-600 hover:text-blue-500 cursor-pointer">
                  browse files
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileInput}
                  />
                </label>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP up to 10MB
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AlcoholLabelForm() {
  const [jobId, setJobId] = useState<string | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const createValidationMutation = useCreateLabelValidation();
  const { data: validationResult, isLoading: isPolling } =
    useLabelValidation(jobId);

  // When validation completes, show the modal
  if (
    validationResult &&
    validationResult.status === "completed" &&
    !showResultModal
  ) {
    setShowResultModal(true);
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AlcoholLabelFormData>({
    resolver: zodResolver(alcoholLabelSchema),
    defaultValues: {
      brandName: "",
      productClass: "",
      alcoholContent: 0,
      netContents: "",
      labelImage: null,
    },
  });

  const watchedImage = watch("labelImage");

  const onSubmit = async (data: AlcoholLabelFormData) => {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("brandName", data.brandName);
      formData.append("productClass", data.productClass);
      formData.append("alcoholContent", data.alcoholContent.toString());
      if (data.netContents) {
        formData.append("netContents", data.netContents);
      }
      if (data.labelImage) {
        formData.append("labelImage", data.labelImage);
      }

      // Start validation job
      const result = await createValidationMutation.mutateAsync(formData);
      setJobId(result.jobId);
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle error (could show error toast/notification)
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
    setJobId(null);
  };

  const handleImageChange = (file: File | null) => {
    setValue("labelImage", file);
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          label="Brand Name"
          error={errors.brandName?.message}
          required
        >
          <input
            {...register("brandName")}
            type="text"
            placeholder="e.g., Old Tom Distillery"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The brand under which the product is sold
          </p>
        </FormField>

        <FormField
          label="Product Class/Type"
          error={errors.productClass?.message}
          required
        >
          <input
            {...register("productClass")}
            type="text"
            placeholder="e.g., Kentucky Straight Bourbon Whiskey, IPA, Vodka"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            The general class or type of the beverage (whiskey, beer style,
            etc.)
          </p>
        </FormField>

        <FormField
          label="Alcohol Content (%)"
          error={errors.alcoholContent?.message}
          required
        >
          <input
            {...register("alcoholContent", { valueAsNumber: true })}
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g., 45"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Alcohol by volume (ABV) percentage
          </p>
        </FormField>

        <FormField label="Net Contents" error={errors.netContents?.message}>
          <input
            {...register("netContents")}
            type="text"
            placeholder="e.g., 750 mL, 12 fl oz"
            className="mt-1 block w-full rounded-md border-gray-300 border px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Volume of the product (optional)
          </p>
        </FormField>

        <FormField
          label="Label Image"
          error={errors.labelImage?.message}
          required
        >
          <ImageUpload
            onFileChange={handleImageChange}
            error={errors.labelImage?.message}
            currentFile={watchedImage}
          />
        </FormField>

        <Button
          type="submit"
          disabled={createValidationMutation.isPending || isPolling}
          className="w-full"
        >
          {createValidationMutation.isPending
            ? "Starting validation..."
            : isPolling
            ? "Validating..."
            : "Validate Label"}
        </Button>
      </form>

      <ValidationResultModal
        isOpen={showResultModal}
        onClose={handleCloseModal}
        validation={validationResult || null}
      />
    </div>
  );
}
