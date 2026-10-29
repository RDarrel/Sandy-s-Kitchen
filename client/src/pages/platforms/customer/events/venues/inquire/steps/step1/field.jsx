import { Label } from "@/components/ui/label";

const Field = ({ label, required, children, className = "" }) => {
  return (
    <div className={`flex min-w-0 flex-col gap-1.5 ${className}`}>
      <Label className="text-xs font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {children}
    </div>
  );
};
export default Field;
