import { SearchSlashIcon } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "@/components/ui/button";
import { SEARCH } from "@/services/redux/slices/events/cateringPackages";

const Empty = () => {
  const { search } = useSelector(({ venues }) => venues),
    dispatch = useDispatch();

  return (
    <div className="min-h-[18rem] flex items-center justify-center rounded-lg border border-dashed border-primary/20 bg-muted/20 p-8">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <SearchSlashIcon className="h-8 w-8 text-primary" />
        </div>

        <h2 className="text-xl font-semibold tracking-tight">
          No venues found
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          We couldn't find any catering packages matching{" "}
          <span className="font-medium text-foreground">"{search}"</span>.
        </p>

        <p className="mt-1 text-sm text-muted-foreground">
          Try searching with a different keyword or clear the search to view all
          available venues.
        </p>

        <Button
          variant="outline"
          className="mt-6"
          onClick={() => dispatch(SEARCH(""))}
        >
          Clear Search
        </Button>
      </div>
    </div>
  );
};

export default Empty;
