import CustomPagination from "@/components/shared/pagination";
import { memo, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handlePagination } from "@/services/utilities";
import StockRequestCard from "../request-card";
import StockRequestsSkeleton from "../skeleton";
import ConvertToOrderModal from "./modal";
import { UPDATE } from "@/services/redux/slices/procurement/stock-requests";
import { toast } from "sonner";

const PendingStockRequestsTab = () => {
  const { filtered: requests, isLoading } = useSelector(
    ({ stockRequests }) => stockRequests,
  );
  const { token, auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ stockRequests }) => stockRequests);
  const rows = useMemo(() => {
    const safe = Array.isArray(requests) ? requests : [];
    return safe.filter(
      (row) => String(row?.status || "").toLowerCase() === "pending",
    );
  }, [requests]);
  const [openById, setOpenById] = useState({});
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(5);
  const [convertOpen, setConvertOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const dispatch = useDispatch();

  const declineRequest = (request) => {
    const requestId = String(request?._id || "");
    if (!requestId) return;

    dispatch(
      UPDATE({
        data: {
          _id: requestId,
          status: "rejected",
          admin: {
            reviewedBy: auth?._id,
            reviewedAt: new Date(),
          },
          updatingRequest: true,
        },
        token,
      }),
    )
      .unwrap()
      .then(() => toast.success("Request declined."))
      .catch(() => toast.error("Failed to decline request. Please try again."));
  };

  if (isLoading) {
    return <StockRequestsSkeleton />;
  }

  if (!rows.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 p-7 text-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            No pending requests
          </p>
          <p className="text-xs text-muted-foreground">
            New stock requests waiting for review will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {handlePagination(rows, page, maxPage).map((request, index) => {
        const rowId = String(request?._id || index);
        return (
          <StockRequestCard
            key={rowId}
            request={request}
            isOpen={Boolean(openById[rowId])}
            onOpenChange={(nextOpen) =>
              setOpenById((prev) => ({ ...prev, [rowId]: nextOpen }))
            }
            showActions
            actionsDisabled={formSubmitted}
            onDecline={declineRequest}
            onConvertToOrder={(row) => {
              setSelectedRequest(row);
              setConvertOpen(true);
            }}
          />
        );
      })}

      <CustomPagination
        title="Stock request"
        datas={rows}
        page={page}
        maxPage={maxPage}
        setPage={setPage}
        setMaxPage={setMaxPage}
      />

      <ConvertToOrderModal
        open={convertOpen}
        onOpenChange={(nextOpen) => {
          setConvertOpen(nextOpen);
          if (!nextOpen) setSelectedRequest(null);
        }}
        request={selectedRequest}
      />
    </div>
  );
};

export default memo(PendingStockRequestsTab);
