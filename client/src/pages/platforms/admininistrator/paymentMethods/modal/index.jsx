import { useEffect, useState } from "react";
import { CreditCard, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import ImageUpload from "./image";
import { useDispatch } from "react-redux";
import {
  INSERT_PAYMENT_METHOD,
  SAVE,
  UPDATE,
  UPDATE_PAYMENT_METHOD,
} from "@/services/redux/slices/events/paymentMethods";
import { UPLOAD } from "@/services/redux/slices/persons/auth";
import Cloudinary from "@/services/utilities/cloudinary";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
import { isImgURL } from "@/services/utilities";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_FORM = {
  name: "",
  type: "e_wallet",
  methoImgId: "",
  accountName: "",
  accountNumber: "",
  qrImgId: "",
  instructions: "",
  isActive: true,
};

const TYPE_OPTIONS = [
  {
    label: "Cash",
    value: "cash",
  },
  {
    label: "E-Wallet",
    value: "e_wallet",
  },
  {
    label: "Bank Transfer",
    value: "bank_transfer",
  },
];

const PaymentMethodModal = ({ open, method, onOpenChange }) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const isUpdate = Boolean(method?._id);

  const isCash = form.type === "cash";
  const isEWallet = form.type === "e_wallet";

  useEffect(() => {
    if (!open) return;
    setForm({
      ...DEFAULT_FORM,
      ...method,

      methodImgId: method?.methodImgId
        ? Cloudinary.getPaymentMethodImg(
            method?.methoImgId,
            method?._id,
            "method",
          )
        : "",

      qrImgId: method?.qrImgId
        ? Cloudinary.getPaymentMethodImg(method?.qrImgId, method?._id, "qr")
        : "",
    });
  }, [method, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const buildPayload = () => {
    const payload = {
      ...form,
      name: form.name.trim(),
      instructions: form.instructions.trim(),
    };

    if (form.type === "cash") {
      payload.accountName = "";
      payload.accountNumber = "";
      payload.bankName = "";
    }

    if (form.type === "e_wallet") {
      payload.accountName = form.accountName.trim();
      payload.accountNumber = form.accountNumber.trim();
      payload.bankName = "";
    }

    if (form.type === "bank_transfer") {
      payload.accountName = form.accountName.trim();
      payload.accountNumber = form.accountNumber.trim();
      payload.bankName = form.bankName.trim();
    }

    return payload;
  };

  const handleUploadImg = async (_id, fileName, base64, attr) => {
    const imgForm = Cloudinary.buildFileForm(
      base64,
      `paymentMethods/${_id}`,
      fileName,
      { paymentMethodId: _id, attributeName: attr },
    );
    const res = await dispatch(UPLOAD({ data: imgForm })).unwrap();
    return res.imgId;
  };

  const handleSave = async (payload) => {
    const { methodImgId = "", qrImgId = "", ...rest } = payload;

    dispatch(SAVE(rest))
      .unwrap()
      .then(async ({ data, success }) => {
        let mId = "";
        let qrId = "";
        if (methodImgId) {
          mId = await handleUploadImg(
            data?._id,
            "method",
            methodImgId,
            "methodImgId",
          );
        }
        if (qrImgId) {
          qrId = await handleUploadImg(data?._id, "qr", qrImgId, "qrImgId");
        }

        dispatch(
          INSERT_PAYMENT_METHOD({ ...data, methodImgId: mId, qrImgId: qrId }),
        );
        toast.success(success);
        setIsLoading(false);
        onOpenChange(false);
      })
      .catch((error) => {
        console.log("error", error?.message || error);
        toast.error("Failed to save payment method. Please try again.");
        setIsLoading(false);
      });
  };

  const handleUpdate = async (payload) => {
    const { methodImgId, qrImgId, ...rest } = payload;
    if (methodImgId && !isImgURL(methodImgId)) {
      await handleUploadImg(payload?._id, "method", methodImgId, "methodImgId");
    }
    if (qrImgId && !isImgURL(qrImgId)) {
      await handleUploadImg(payload?._id, "qr", qrImgId, "qrImgId");
    }

    dispatch(
      UPDATE({
        ...rest,
        ...(!methodImgId && { methodImgId }),
        ...(!qrImgId && { qrImgId }),
      }),
    )
      .unwrap()
      .then(({ data, success }) => {
        dispatch(UPDATE_PAYMENT_METHOD(data));
        toast.success(success);
        setIsLoading(false);
        onOpenChange(false);
      })
      .catch((error) => {
        console.log("error", error?.message || error);
        toast.error("Failed to update payment method. Please try again.");
        setIsLoading(false);
      });
  };
  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = buildPayload();

    setIsLoading(true);

    if (method?._id) return await handleUpdate(payload);
    return await handleSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-2xl">
        {/* Header */}
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background">
              <CreditCard className="size-4 text-muted-foreground" />
            </div>

            <div className="min-w-0">
              <DialogTitle className="text-lg text-foreground">
                {isUpdate ? "Update Payment Method" : "Add Payment Method"}
              </DialogTitle>

              <DialogDescription>
                Configure the payment channel details shown to customers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField label="Method Name" htmlFor="paymentMethodName" required>
              <Input
                id="paymentMethodName"
                value={form.name}
                onChange={(event) => handleChange("name", event.target.value)}
                placeholder={
                  isCash
                    ? "Cash at Counter"
                    : isEWallet
                      ? "GCash"
                      : "BDO Bank Transfer"
                }
                required
              />
            </FormField>

            <FormField label="Method Type" htmlFor="paymentMethodType" required>
              <Select
                id="paymentMethodType"
                value={form?.type}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="w-full ">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Method Type</SelectLabel>
                    {TYPE_OPTIONS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          {/* Images */}
          <div
            className={`grid gap-3 ${
              isCash ? "sm:grid-cols-1" : "sm:grid-cols-2"
            }`}
          >
            <ImageUpload
              id="payment-method-logo"
              title="Method Logo"
              description="Optional logo shown to customers"
              browseLabel="Upload"
              changeLabel="Change logo"
              image={form.methodImgId}
              onChange={(url) =>
                setForm((prev) => ({ ...prev, methodImgId: url }))
              }
              onRemove={() => setForm((prev) => ({ ...prev, methodImgId: "" }))}
            />

            {!isCash && (
              <ImageUpload
                id="payment-method-qr"
                title="QR Code"
                description="Optional QR code customers can scan"
                browseLabel="Upload"
                changeLabel="Change QR"
                image={form.qrImgId}
                onChange={(url) =>
                  setForm((prev) => ({ ...prev, qrImgId: url }))
                }
                onRemove={() => setForm((prev) => ({ ...prev, qrImgId: "" }))}
              />
            )}
          </div>

          {/* Account Information */}
          {!isCash && (
            <div className="grid gap-3 sm:grid-cols-2">
              <FormField
                label="Account Name"
                htmlFor="paymentAccountName"
                required
              >
                <Input
                  id="paymentAccountName"
                  value={form.accountName || ""}
                  onChange={(event) =>
                    handleChange("accountName", event.target.value)
                  }
                  placeholder="Sandy Dela Cruz"
                  required
                />
              </FormField>

              <FormField
                label={isEWallet ? "Mobile / Account Number" : "Account Number"}
                htmlFor="paymentAccountNumber"
                required
              >
                <Input
                  id="paymentAccountNumber"
                  value={form.accountNumber || ""}
                  onChange={(event) =>
                    handleChange("accountNumber", event.target.value)
                  }
                  placeholder={isEWallet ? "0917 245 8891" : "0045 8200 1189"}
                  required
                />
              </FormField>
            </div>
          )}

          {/* Instructions */}
          <FormField
            label="Customer Instructions"
            htmlFor="paymentInstructions"
          >
            <Textarea
              id="paymentInstructions"
              value={form.instructions || ""}
              onChange={(event) =>
                handleChange("instructions", event.target.value)
              }
              placeholder={
                isCash
                  ? "Tell customers where and how to pay in cash."
                  : isEWallet
                    ? "Tell customers how to send and verify their payment."
                    : "Tell customers how to complete the bank transfer."
              }
              className="min-h-20 resize-none"
            />
          </FormField>

          {/* Active Status */}
          <SwitchField
            label="Active method"
            description={
              isCash
                ? "Allow staff to use this method when recording payments."
                : "Show this option during customer payment."
            }
            checked={form.isActive}
            onCheckedChange={(checked) => handleChange("isActive", checked)}
          />

          {/* Actions */}
          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>

            <Button type="submit" className="gap-2" disabled={isLoading}>
              {isLoading ? (
                <Spinner formSubmitted={isLoading} />
              ) : (
                <Save className="size-4" />
              )}

              {isUpdate ? "Save Changes" : "Create Method"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const FormField = ({ label, htmlFor, required = false, children }) => {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-medium">
        {label}

        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>

      {children}
    </div>
  );
};

const SwitchField = ({ label, description, checked, onCheckedChange }) => {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-background p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>

        <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
          {description}
        </p>
      </div>

      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
};

export default PaymentMethodModal;
