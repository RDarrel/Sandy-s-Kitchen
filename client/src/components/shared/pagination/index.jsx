import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import Rows from "./rows";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const CustomPagination = ({
  page = 1,
  maxPage = 5,
  datas = [],
  title = "",
  titleExtension = "s",
  setPage = () => {},
  setMaxPage = () => {},
}) => {
  const maxButtonCount = Math.ceil(datas.length / maxPage) || 1;
  const lengthOfDatas = datas?.length || 0;

  useEffect(() => {
    setPage(1);
  }, [maxButtonCount]);

  const countOfDatas = () => {
    const currentCount = page * maxPage;
    return currentCount >= lengthOfDatas ? lengthOfDatas : currentCount;
  };

  return (
    <div className="@container mt-5 min-w-0 w-full">
      <div className="flex min-w-0 flex-col gap-3 @min-[640px]:flex-row @min-[640px]:items-center @min-[640px]:gap-5">
        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <p className="min-w-0 text-xs text-muted-foreground sm:text-sm">
            {countOfDatas()} out of {datas?.length || 0}{" "}
            {`${title}${lengthOfDatas > 1 ? titleExtension : ""}`}
          </p>
          <Rows maxPage={maxPage} setMaxPage={setMaxPage} />
        </div>
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 @min-[640px]:shrink-0">
          <p className="whitespace-nowrap text-xs font-medium text-muted-foreground sm:text-sm" aria-live="polite">
            Page {page} of {maxButtonCount}
          </p>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              size="icon-sm"
              aria-label="Go to first page"
              variant={"outline"}
              disabled={page === 1}
              onClick={() => setPage(1)}
            >
              <ChevronsLeft />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              aria-label="Go to previous page"
              variant={"outline"}
              disabled={page === 1}
              onClick={() => setPage(page === 1 ? page : page - 1)}
            >
              <ChevronLeft />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              aria-label="Go to next page"
              variant={"outline"}
              disabled={page === maxButtonCount}
              onClick={() => setPage(page === maxButtonCount ? page : page + 1)}
            >
              <ChevronRight />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              aria-label="Go to last page"
              variant={"outline"}
              disabled={page === maxButtonCount}
              onClick={() => setPage(maxButtonCount)}
            >
              <ChevronsRight />
            </Button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default CustomPagination;
