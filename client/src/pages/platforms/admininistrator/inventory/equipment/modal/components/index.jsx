import { Label } from "@/components/ui/label";
import { getExistingCategory } from "../utils";
import { AlertCircle } from "lucide-react";

export const FormField = ({ label, error, content }) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {content}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
};

export const NameWarning = ({ name = "", selectedId, collections = [] }) => {
  const existingItem = getExistingCategory(collections, name, selectedId);

  if (!existingItem) {
    return null;
  }

  return (
    <div className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>
        "{name.trim()}" already exists. Please use a different category name.
      </p>
    </div>
  );
};
