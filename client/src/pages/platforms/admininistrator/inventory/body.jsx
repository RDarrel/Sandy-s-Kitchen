import { Button } from "@/components/ui/button";
import { CustomAlert } from "@/components/shared/alert";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash2, Boxes, Activity } from "lucide-react";
import { capitalize } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import CustomPagination from "@/components/shared/pagination";
import { Formatter, handlePagination, Stock } from "@/services/utilities";
import { useMemo, useState } from "react";
import {
  Set_SELECTED,
  SetVIEW_BATCHES,
  SetVIEW_STOCK_MOVEMENTS,
} from "@/services/redux/slices/inventory/inventoryItems";
import TableLoading from "@/components/shared/loading/table";

const ActionButton = ({ title, icon: Icon, destructive = false, onClick }) => (
  <Button
    type="button"
    size="icon"
    variant="outline"
    onClick={onClick}
    className={
      destructive
        ? "border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
        : "hover:bg-accent/15 hover:text-accent-foreground"
    }
  >
    <Icon className="h-4 w-4" />
    <span className="sr-only">{title}</span>
  </Button>
);

const InventoryBody = ({
  deleteOpen,
  setDeleteOpen,
  selected,
  onRequestDelete,
  onConfirmDelete,
}) => {
  const { filtered, formSubmitted, isLoading } = useSelector(
      ({ inventoryItems }) => inventoryItems,
    ),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    dispatch = useDispatch();

  const sortedFiltered = useMemo(() => {
    const rank = {
      "out of stock": 0,
      "low stock": 1,
      "in stock": 2,
    };

    return (filtered || [])
      .map((item, index) => ({ item, index }))
      .sort((a, b) => {
        const aKey = String(a?.item?.stockStatus || "")
          .trim()
          .toLowerCase();
        const bKey = String(b?.item?.stockStatus || "")
          .trim()
          .toLowerCase();
        const aRank = rank[aKey] ?? 99;
        const bRank = rank[bKey] ?? 99;

        if (aRank !== bRank) return aRank - bRank;
        return a.index - b.index;
      })
      .map(({ item }) => item);
  }, [filtered]);
  return (
    <>
      <CardContent className="space-y-4">
        {!isLoading ? (
          <>
            <div className="overflow-hidden rounded-[7px] border border-border bg-card">
              <Table>
                <TableHeader className="bg-muted/70">
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Unit Cost</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Expiring Soon</TableHead>
                    <TableHead>Expired</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedFiltered.length ? (
                    handlePagination(sortedFiltered, page, maxPage).map(
                      (item) => {
                        return (
                          <TableRow key={item._id} className="">
                            <TableCell className="whitespace-normal">
                              <div className="space-y-1">
                                <p className="font-semibold text-foreground">
                                  {capitalize(item.name)}
                                </p>
                                <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                                  {item.description ||
                                    "No description provided."}
                                </p>
                              </div>
                            </TableCell>

                            <TableCell>
                              <p className="font-medium text-foreground">{`${Formatter.amount(item.cost)} / ${Stock.getUnit(item.measurement)}`}</p>
                              {item?.supplier ? (
                                <p className="text-xs text-muted-foreground">
                                  From {item.supplier.name}
                                  {item?.suppliers?.length > 1 && (
                                    <span className="ml-1">
                                      (+{item.suppliers.length - 1} more)
                                    </span>
                                  )}
                                </p>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No supplier
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <p className="font-medium text-foreground">
                                {Stock.display(
                                  item?.stockDisplay?.current,
                                  item.measurement,
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {capitalize(item?.stockStatus)}
                              </p>
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {Stock.display(
                                item?.expiringSoon?.display,
                                item.measurement,
                              )}
                            </TableCell>
                            <TableCell className="font-medium text-foreground">
                              {Stock.display(
                                item?.expired?.display,
                                item.measurement,
                              )}
                            </TableCell>

                            <TableCell>
                              <div className="flex justify-end gap-2">
                                <ActionButton
                                  title="Stock Movements"
                                  icon={Activity}
                                  destructive
                                  onClick={() =>
                                    dispatch(SetVIEW_STOCK_MOVEMENTS(item))
                                  }
                                />
                                <ActionButton
                                  title="View Batches"
                                  icon={Boxes}
                                  destructive
                                  onClick={() =>
                                    dispatch(SetVIEW_BATCHES(item))
                                  }
                                />
                                <ActionButton
                                  title="Edit"
                                  icon={Pencil}
                                  onClick={() => dispatch(Set_SELECTED(item))}
                                />

                                <ActionButton
                                  title="Delete"
                                  icon={Trash2}
                                  destructive
                                  onClick={() => onRequestDelete(item)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      },
                    )
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="py-14 text-center">
                        <div className="space-y-2">
                          <p className="text-base font-semibold text-foreground">
                            No inventory items found
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Try another keyword or reset the filters to show all
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
              title="Inventory Item"
              titleExtension="s"
              page={page}
              setPage={setPage}
              maxPage={maxPage}
              setMaxPage={setMaxPage}
              datas={sortedFiltered}
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
        buttonTitle="Delete Item"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-red-600">
              {selected?.name || "this item"}
            </span>{" "}
            ?
          </>
        }
      />
    </>
  );
};

export default InventoryBody;
