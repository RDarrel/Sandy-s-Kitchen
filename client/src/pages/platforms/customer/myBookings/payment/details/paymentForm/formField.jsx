import { Label } from "@/components/ui/label";

const FormField = ({ label, required = false, children }) => {
  return (
    <div className="grid gap-1">
      <Label className="text-xs font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>

      {children}
    </div>
  );
};

export default FormField;
