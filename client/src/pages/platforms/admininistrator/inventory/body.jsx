import { Badge } from "@/components/ui/badge";
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
import { Eye, Pencil, Trash2 } from "lucide-react";
import { capitalize } from "lodash";
import { formatStock, getStockStatus, statusClasses } from "./config";
import { useDispatch, useSelector } from "react-redux";
import CustomPagination from "@/components/shared/pagination";
import { handlePagination } from "@/services/utilities";
import { useState } from "react";
import { Set_SELECTED } from "@/services/redux/slices/inventory/inventoryItem";

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
  onEdit,
  onRequestDelete,
  onConfirmDelete,
}) => {
  const { filtered } = useSelector(({ inventoryItem }) => inventoryItem),
    [page, setPage] = useState(1),
    [maxPage, setMaxPage] = useState(5),
    dispatch = useDispatch();
  return (
    <>
      <CardContent className="space-y-4">
        <div className="overflow-hidden rounded-[5px] border border-border bg-card">
          <Table>
            <TableHeader className="bg-muted/70">
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Measurement</TableHead>
                <TableHead>Current Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length ? (
                handlePagination(filtered, page, maxPage).map((item) => {
                  const status = getStockStatus(item);

                  return (
                    <TableRow key={item._id} className="bg-card">
                      <TableCell className="whitespace-normal">
                        <div className="space-y-1">
                          <p className="font-semibold text-foreground">
                            {capitalize(item.name)}
                          </p>
                          <p className="max-w-xs text-xs leading-5 text-muted-foreground">
                            {item.description || "No description provided."}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="rounded-full border-accent/35 bg-accent/12 text-accent-foreground"
                        >
                          {capitalize(item.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{capitalize(item.category)}</TableCell>
                      <TableCell>{capitalize(item.measurement)}</TableCell>
                      <TableCell className="font-medium text-foreground">
                        {formatStock(item.currentStock, item.baseUnit)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`rounded-full ${statusClasses[status]}`}
                        >
                          {capitalize(status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
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
                })
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
          datas={filtered}
        />
      </CardContent>

      <CustomAlert
        isOpen={deleteOpen}
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
