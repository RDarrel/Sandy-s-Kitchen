import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomAlert } from "@/components/shared/alert";
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
import { useState } from "react";

const BatchesModalBody = ({
	rows = [],
	isLoading = false,
	tableColSpan = 7,
	tracksExpiration = true,
	formatQty,
	statusBadge,
	onConfirmDispose,
}) => {
	const [disposeOpen, setDisposeOpen] = useState(false);
	const [selectedBatch, setSelectedBatch] = useState(null);

	const handleRequestDispose = (batch) => {
		setSelectedBatch(batch || null);
		setDisposeOpen(true);
	};

	const handleConfirmDispose = () => {
		try {
			onConfirmDispose?.(selectedBatch);
		} finally {
			setDisposeOpen(false);
			setSelectedBatch(null);
		}
	};

	return (
		<>
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
								onClick={() => handleRequestDispose(batch)}
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

      <CustomAlert
        isOpen={disposeOpen}
        formSubmitted={false}
        capture={handleConfirmDispose}
        setIsOpen={setDisposeOpen}
        showCancelButton
        className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
        buttonTitle="Dispose Batch"
        buttonClassName="bg-red-600 hover:bg-red-700"
        index={0}
        message={
          <>
            <p>
              Are you sure you want to dispose{" "}
              <span className="font-semibold text-red-600">
                {selectedBatch?.displayCode || "this batch"}
              </span>
              ?
            </p>

            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
              <p>
                <span className="font-medium text-foreground">Batch:</span>{" "}
                {selectedBatch?.displayCode || "â€”"}
              </p>
              <p>
                <span className="font-medium text-foreground">
                  Remaining Qty:
                </span>{" "}
                {selectedBatch
                  ? formatQty?.(selectedBatch?.remainingQtyDisplay) ?? "â€”"
                  : "â€”"}
              </p>
              {tracksExpiration ? (
                <p>
                  <span className="font-medium text-foreground">
                    Expiration:
                  </span>{" "}
                  {selectedBatch?.expirationDate
                    ? Formatter.date(selectedBatch.expirationDate)
                    : "â€”"}
                </p>
              ) : null}

              <p className="pt-2 text-xs leading-5 text-muted-foreground">
                This action will remove the expired stock from pending disposal
                records.
              </p>
            </div>
          </>
        }
      />
		</>
	);
};

export default BatchesModalBody;
