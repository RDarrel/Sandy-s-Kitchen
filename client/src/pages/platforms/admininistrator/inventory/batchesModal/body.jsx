import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Formatter } from "@/services/utilities";
import { LoaderCircle } from "lucide-react";

const BatchesModalBody = ({
  rows = [],
  isLoading = false,
  tableColSpan = 7,
  tracksExpiration = true,
  formatQty,
  statusBadge,
}) => {
  return (
    <div className="overflow-hidden rounded-[7px] border border-border bg-card">
      <Table>
        <TableHeader className="bg-muted/70">
          <TableRow>
            <TableHead>Batch</TableHead>
            <TableHead className="text-right">Received Qty</TableHead>
            <TableHead className="text-right">Remaining Qty</TableHead>
            <TableHead>Received Date</TableHead>
            <TableHead>Expiration</TableHead>
            <TableHead className="text-center">Status</TableHead>
            {tracksExpiration ? (
              <TableHead className="text-center">Action</TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={tableColSpan} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="grid h-10 w-10 place-items-center rounded-full border border-border bg-muted/40">
                    <LoaderCircle className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Loading batches
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please wait a moment...
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : rows.length ? (
            rows.map((batch) => {
              const badge = statusBadge(batch.status);
              return (
                <TableRow key={batch._id}>
                  <TableCell className="whitespace-normal">
                    <p className="font-medium text-foreground">
                      {batch.displayCode}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {batch.supplierName}
                    </p>
                  </TableCell>
                  <TableCell className="text-right font-normal text-muted-foreground">
                    {formatQty(batch?.qtyDisplay)}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-foreground">
                    {formatQty(batch?.remainingQtyDisplay)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {batch.receivedDate
                      ? Formatter.date(batch.receivedDate)
                      : "—"}
                  </TableCell>
                  <TableCell className="font-semibold text-foreground">
                    {batch.expirationDate
                      ? Formatter.date(batch.expirationDate)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={badge.className}>{badge.label}</Badge>
                  </TableCell>
                  {tracksExpiration ? (
                    <TableCell className="text-center">
                      {/* {batch.isExpired ? ( */}
                      {true ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          Dispose
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  ) : null}
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={tableColSpan} className="py-12 text-center">
                <p className="text-sm text-muted-foreground">
                  No batches matched your search.
                </p>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BatchesModalBody;
