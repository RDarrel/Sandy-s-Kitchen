import { Skeleton } from "@/components/ui/skeleton";

const FormFieldSkeleton = () => {
  return (
    <div className="grid gap-1">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
};

export default FormFieldSkeleton;
