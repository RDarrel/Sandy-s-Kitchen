import { Skeleton } from "@/components/ui/skeleton";

const SectionHeaderSkeleton = () => {
  return (
    <div>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-1 h-5 w-64 max-w-full" />
    </div>
  );
};

export default SectionHeaderSkeleton;
