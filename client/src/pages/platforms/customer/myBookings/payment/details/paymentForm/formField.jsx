import { Label } from "@/components/ui/label";

const FormField = ({ label, children }) => {
  return (
    <div className="grid gap-1">
      <Label className="text-xs font-medium">{label}</Label>

      {children}
    </div>
  );
};

export default FormField;
