import { AlertTriangle } from "lucide-react";

const InlineWarning = ({ message }) => {
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md border border-destructive/20 bg-destructive/5 px-2 py-1.5 text-xs leading-5 text-destructive">
      <AlertTriangle className="mt-0.5 size-3 shrink-0" />

      <span>{message}</span>
    </div>
  );
};

export default InlineWarning;
