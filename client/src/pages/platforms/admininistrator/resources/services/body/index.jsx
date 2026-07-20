import { CardContent } from "@/components/ui/card";
import { CustomAlert } from "@/components/shared/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useSelector } from "react-redux";
import CustomPagination from "@/components/shared/pagination";
import { handlePagination } from "@/services/utilities";
import { useState } from "react";
import TableLoading from "@/components/shared/loading/table";
import Equipment from "./equipment";

const Body = ({
  deleteOpen,
  setDeleteOpen,
  selected,
  onRequestDelete = () => {},
  onConfirmDelete = () => {},
}) => {
  const { filtered, formSubmitted, isLoading } = useSelector(
    ({ services }) => services,
  );
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);

  return (
    <>
      <CardContent className="space-y-4">
        {!isLoading ? (
          <>
            <div className="overflow-hidden rounded-[7px] border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/70">
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Available In</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length ? (
                    handlePagination(filtered, page, maxPage).map((item) => (
                      <Equipment
                        key={item._id}
                        item={item}
                        onRequestDelete={onRequestDelete}
                      />
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-14 text-center">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-foreground">
                            No services found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try another keyword to show matching service
                            records.
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <CustomPagination
              title="Equipment"
              titleExtension=" "
              page={page}
              setPage={setPage}
              maxPage={maxPage}
              setMaxPage={setMaxPage}
              datas={filtered}
            />
          </>
        ) : (
          <TableLoading numberOfColumns={7} />
        )}
      </CardContent>

      <CustomAlert
        isOpen={deleteOpen}
        formSubmitted={formSubmitted}
        capture={onConfirmDelete}
        setIsOpen={setDeleteOpen}
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Delete Service"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selected?.name || "this service"}
            </span>
            ?
          </>
        }
      />
    </>
  );
};

export default Body;
