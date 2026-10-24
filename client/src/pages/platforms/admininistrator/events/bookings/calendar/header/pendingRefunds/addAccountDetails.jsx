import { useId, useState } from "react";
import { Content } from "@radix-ui/react-alert-dialog";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Spinner from "@/components/shared/spinner";
import { SAVE_REFUND_ACCOUNT } from "@/services/redux/slices/events/bookings";

const controlClass =
  "h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

const AddAccountDetails = ({
  open,
  onOpenChange,
  booking,
  setBooking,
  paymentMethods,
}) => {
  const id = useId();
  const dispatch = useDispatch();
  const { auth } = useSelector(({ auth }) => auth);
  const [method, setMethod] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountSource, setAccountSource] = useState("");
  const [saving, setSaving] = useState(false);
  const methods = paymentMethods.filter(
    ({ isActive, type }) =>
      isActive && (type === "e_wallet" || type === "bank_transfer"),
  );
  const selectedMethod = methods.find(({ _id }) => _id === method);
  const isWallet = selectedMethod?.type === "e_wallet";

  const close = () => {
    if (saving) return;
    onOpenChange(false);
    setMethod("");
    setAccountName("");
    setAccountNumber("");
    setAccountSource("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (saving || !selectedMethod || !auth?._id) return;
    if (!accountName.trim() || !accountNumber.trim()) {
      toast.error("Enter the account name and number.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await dispatch(
        SAVE_REFUND_ACCOUNT({
          _id: booking._id,
          account: {
            method,
            accountName: accountName.trim(),
            accountNumber: accountNumber.replace(/\s/g, ""),
            accountSource,
            accountProvidedBy: "staff",
            accountProvidedByUser: auth._id,
            accountProvidedAt: new Date().toISOString(),
          },
        }),
      ).unwrap();
      setBooking((previous) => ({
        ...previous,
        cancellation: {
          ...previous.cancellation,
          refund: data.cancellation.refund,
        },
      }));
      onOpenChange(false);
      toast.success("Refund account details saved.");
    } catch {
      toast.error("Unable to save refund account details. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => !value && close()}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="z-[100] bg-black/60" />
        <Content className="fixed left-1/2 top-1/2 z-[110] max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-background text-foreground shadow-xl outline-none">
          <form onSubmit={handleSubmit}>
            <div className="space-y-1 px-4 pt-3">
              <AlertDialogTitle className="text-base font-semibold">
                Add Account Details
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-5">
                Enter the refund account shared by the customer.
              </AlertDialogDescription>
            </div>
            <fieldset disabled={saving} className="space-y-3 p-4">
              <div className="space-y-1">
                <Label htmlFor={`${id}-method`} className="text-xs">
                  Refund Method *
                </Label>
                <Select
                  required
                  disabled={saving}
                  value={method}
                  onValueChange={(value) => {
                    setMethod(value);
                    setAccountNumber("");
                  }}
                >
                  <SelectTrigger id={`${id}-method`} className={controlClass}>
                    <SelectValue placeholder="Select a method" />
                  </SelectTrigger>
                  <SelectContent className="z-[120]">
                    {methods.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {methods.length === 0 && (
                  <p role="status" className="text-xs text-muted-foreground">
                    No refund methods available. Please try again later.
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-name`} className="text-xs">
                  Account Name *
                </Label>
                <Input
                  id={`${id}-name`}
                  className={controlClass}
                  required
                  maxLength={150}
                  value={accountName}
                  onChange={(event) => setAccountName(event.target.value)}
                  placeholder="Account holder's name"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-number`} className="text-xs">
                  Account Number *
                </Label>
                <Input
                  id={`${id}-number`}
                  className={controlClass}
                  required
                  inputMode="numeric"
                  maxLength={isWallet ? 11 : 34}
                  value={accountNumber}
                  onChange={(event) => setAccountNumber(event.target.value)}
                  placeholder={isWallet ? "09XXXXXXXXX" : "Account number"}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor={`${id}-source`} className="text-xs">
                  Details Received Via *
                </Label>
                <Select
                  required
                  disabled={saving}
                  value={accountSource}
                  onValueChange={setAccountSource}
                >
                  <SelectTrigger id={`${id}-source`} className={controlClass}>
                    <SelectValue placeholder="Select a source" />
                  </SelectTrigger>
                  <SelectContent className="z-[120]">
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="messenger">Messenger</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </fieldset>
            <div className="flex flex-wrap justify-end gap-2 border-t px-4 py-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={close}
                disabled={saving}
              >
                Back
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={saving || !method || !auth?._id}
              >
                Save Account Details <Spinner formSubmitted={saving} />
              </Button>
            </div>
          </form>
        </Content>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

export default AddAccountDetails;
