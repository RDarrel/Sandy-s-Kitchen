import { Badge } from "@/components/ui/badge";
import {
  Banknote,
  Building2,
  CheckCircle2,
  CircleOff,
  QrCode,
  Smartphone,
} from "lucide-react";
import { createElement } from "react";
import Actions from "./actions";
import Details from "./details";
import Logo from "./logo";
const TYPE_META = {
  cash: {
    label: "Cash",
    icon: Banknote,
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },

  e_wallet: {
    label: "E-Wallet",
    icon: Smartphone,
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },

  bank_transfer: {
    label: "Bank Transfer",
    icon: Building2,
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
};
const Method = ({ method, onEdit, onStatusChange }) => {
  const typeMeta = TYPE_META[method.type] || TYPE_META.cash;

  const TypeIcon = typeMeta.icon;

  const updatedAt = new Date(method.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const getMethodSubtitle = (method) => {
    if (method.type === "cash") {
      return "Pay directly at the counter";
    }

    if (method.accountName) {
      return method.accountName;
    }

    if (method.type === "bank_transfer") {
      return method.bankName || "Bank transfer";
    }

    return "Payment account";
  };
  return (
    <div className="rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-muted/20">
      <div className="flex items-start gap-3">
        {/* Logo / Fallback Icon */}
        <Logo method={method} fallbackIcon={TypeIcon} />

        <div className="min-w-0 flex-1">
          {/* Title */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-sm font-semibold leading-5 text-foreground">
                {method.name}
              </h3>

              <p className="truncate text-xs text-muted-foreground">
                {getMethodSubtitle(method)}
              </p>
            </div>

            <Actions
              method={method}
              onEdit={onEdit}
              onStatusChange={onStatusChange}
            />
          </div>

          {/* Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge variant="outline" className={typeMeta.className}>
              {typeMeta.label}
            </Badge>

            <StatusBadge isActive={method.isActive} />

            {method.qrImgId && (
              <FeatureBadge icon={QrCode} label="QR Available" />
            )}
          </div>

          {/* Details */}
          <div className="mt-3 border-t pt-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0 flex-1">
                <Details method={method} />

                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {method.instructions || "No payment instructions provided."}
                </p>
              </div>

              <span className="shrink-0 text-[11px] text-muted-foreground">
                Updated {updatedAt}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Method;

const StatusBadge = ({ isActive }) => {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-muted bg-muted/50 text-muted-foreground"
      }
    >
      {isActive ? (
        <CheckCircle2 className="mr-1 size-3" />
      ) : (
        <CircleOff className="mr-1 size-3" />
      )}

      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};

const FeatureBadge = ({ icon, label }) => {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-foreground">
      {createElement(icon, { className: "mr-1 size-3" })}
      {label}
    </span>
  );
};
