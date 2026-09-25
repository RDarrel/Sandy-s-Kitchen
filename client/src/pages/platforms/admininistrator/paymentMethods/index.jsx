import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { CustomAlert } from "@/components/shared/alert";
import { useDispatch, useSelector } from "react-redux";
import {
  BROWSE,
  UPDATE,
  UPDATE_PAYMENT_METHOD,
} from "@/services/redux/slices/events/paymentMethods";
import { toast } from "sonner";
import PaymentMethodModal from "./modal";
import Toolbar from "./toolBar";
import Method from "./method";
import MethodSkeleton from "./method/methodSkeleton";
import Header from "./header";

const PaymentMethods = () => {
  const { filtered, formSubmitted, isLoading } = useSelector(
    ({ paymentMethods }) => paymentMethods,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [statusAlertOpen, setStatusAlertOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(BROWSE());
  }, [dispatch]);

  const openCreateModal = () => {
    setSelectedMethod(null);
    setModalOpen(true);
  };

  const openUpdateModal = (method) => {
    setSelectedMethod(method);
    setModalOpen(true);
  };

  const openStatusAlert = (method) => {
    setSelectedMethod(method);
    setStatusAlertOpen(true);
  };

  const closeStatusAlert = (open) => {
    setStatusAlertOpen(open);

    if (!open) {
      setSelectedMethod(null);
    }
  };

  const handleStatusChange = () => {
    const nextStatus = !selectedMethod?.isActive;

    dispatch(
      UPDATE({
        ...selectedMethod,
        isActive: nextStatus,
      }),
    )
      .unwrap()
      .then(({ data, success }) => {
        dispatch(UPDATE_PAYMENT_METHOD(data));
        toast.success(success);
        closeStatusAlert(false);
      })
      .catch((error) => {
        console.log("error", error?.message || error);
        toast.error("Failed to update payment method status.");
      });
  };

  return (
    <div className="bg-background p-3 md:p-5">
      <div className="mx-auto w-full max-w-5xl space-y-4">
        {/* Page Header */}
        <Header openCreateModal={openCreateModal} />

        {/* Payment Methods Container */}
        <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
          <Toolbar />

          {/* Methods */}
          {isLoading ? (
            <PaymentMethodsSkeleton />
          ) : filtered.length ? (
            <div className="grid gap-3 p-3 lg:grid-cols-2">
              {filtered.map((method) => (
                <Method
                  key={method._id}
                  method={method}
                  onEdit={openUpdateModal}
                  onStatusChange={openStatusAlert}
                />
              ))}
            </div>
          ) : (
            <EmptyState />
          )}
        </div>

        <PaymentMethodModal
          open={modalOpen}
          method={selectedMethod}
          onOpenChange={setModalOpen}
        />

        <CustomAlert
          isOpen={statusAlertOpen}
          capture={handleStatusChange}
          setIsOpen={closeStatusAlert}
          formSubmitted={formSubmitted}
          showCancelButton
          className="border-border bg-card shadow-[0_28px_90px_rgba(59,36,24,0.18)]"
          buttonTitle={selectedMethod?.isActive ? "Deactivate" : "Activate"}
          buttonClassName={
            selectedMethod?.isActive
              ? "bg-red-600 hover:bg-red-700"
              : "bg-emerald-600 hover:bg-emerald-700"
          }
          index={0}
          message={
            <div className="space-y-2">
              <p>
                Are you sure you want to{" "}
                {selectedMethod?.isActive ? "deactivate" : "activate"}{" "}
                <span className="font-semibold text-primary">
                  {selectedMethod?.name || "this payment method"}
                </span>
                ?
              </p>

              <p className="text-sm text-muted-foreground">
                {selectedMethod?.isActive
                  ? "Once deactivated, customers will no longer see or use this payment method during booking payments."
                  : "Once activated, customers will be able to see and use this payment method during booking payments."}
              </p>
            </div>
          }
        />
      </div>
    </div>
  );
};

const PaymentMethodsSkeleton = () => {
  return (
    <div className="grid gap-3 p-3 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <MethodSkeleton key={`payment-method-skeleton-${index}`} />
      ))}
    </div>
  );
};

const EmptyState = () => {
  return (
    <div className="px-4 py-12 text-center">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-md border bg-muted/40">
          <Search className="size-5 text-muted-foreground" />
        </div>

        <p className="text-sm font-medium text-foreground">
          No payment methods found
        </p>

        <p className="text-xs text-muted-foreground">
          Try a different search term or filter.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethods;
