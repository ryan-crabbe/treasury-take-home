import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import type { LabelValidationResponse } from "../types";

interface ValidationResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: LabelValidationResponse | null;
}

export function ValidationResultModal({
  isOpen,
  onClose,
  validation,
}: ValidationResultModalProps) {
  if (!validation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {validation.success ? (
              <span className="text-green-600 text-lg">
                ✓ Validation Passed
              </span>
            ) : (
              <span className="text-red-600 text-lg">✗ Validation Failed</span>
            )}
          </DialogTitle>
          <DialogDescription>
            {validation.success
              ? "Your alcohol label meets all requirements."
              : "Your label has some issues that need to be addressed."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {validation.issues && Object.keys(validation.issues).length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-red-800">Issues:</h4>
              <ul className="list-disc list-inside space-y-1 text-red-700 bg-red-50 p-3 rounded">
                {Object.entries(validation.issues).map(([field, message]) => (
                  <li key={field}>
                    <strong>{field === "general" ? "General" : field}:</strong>{" "}
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
