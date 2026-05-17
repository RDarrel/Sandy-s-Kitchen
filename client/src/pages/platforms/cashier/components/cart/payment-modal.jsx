import { Formatter } from "@/services/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CartClear, SAVE } from "@/services/redux/slices/stations/cashier";
import { useEffect, useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import Spinner from "@/components/shared/spinner";
import { toast } from "sonner";
const getBaseTotal = (entry) => {
  const qty = Number(entry?.line?.quantity) || 0;
  const base = Number(entry?.menu?.price) || 0;
  return base * qty;
};

const formatDateTime = (value) => {
  try {
    const date = value instanceof Date ? value : new Date(value || Date.now());
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "";
  }
};

const CashierPaymentModal = ({ open, onOpenChange, totals, entries = [] }) => {
  const { token, auth } = useSelector(({ auth }) => auth);
  const { formSubmitted } = useSelector(({ cashier }) => cashier);
  const nowLabel = formatDateTime(Date.now());
  const safeEntries = Array.isArray(entries) ? entries : [];
  const [tenderedRaw, setTenderedRaw] = useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (open) setTenderedRaw("");
  }, [open]);

  const tendered = useMemo(() => {
    const normalized = String(tenderedRaw || "")
      .replaceAll(",", "")
      .trim();
    if (!normalized) return null;
    const value = Number(normalized);
    if (!Number.isFinite(value)) return null;
    return value;
  }, [tenderedRaw]);

  const totalAmount = Number(totals?.totalAmount) || 0;
  const change = tendered == null ? null : tendered - totalAmount;
  const handleSubmit = (e) => {
    e.preventDefault();
    const items = entries.map(({ line }) => ({ ...line }));
    const order = {
      amount: totalAmount,
      cash: Number(tendered),
      created: {
        by: auth?._id,
        at: Date.now(),
      },
    };
    // dispatch(
    //   SAVE({
    //     token,
    //     data: {
    //       order,
    //       items,
    //     },
    //   }),
    // )
    //   .unwrap()
    //   .then(() => {
    //     onOpenChange(false);
    //     dispatch(CartClear());
    //     setTenderedRaw("");
    //     toast.success("Successfully saved order.");
    //   })
    //   .catch((error) => {
    //     toast.error(error?.message || error || "Failed to save order.");
    //   });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden rounded-2xl bg-white p-0 text-foreground">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-6">
            <div
              className="w-full"
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <div className="text-center">
                <p className="text-[15px] font-extrabold tracking-wider">
                  Sandy&apos;s Kitchenette
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  Brgy. Rio Chico Gen. Tinio, Nueva Ecija
                </p>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {nowLabel}
                </p>
              </div>

              <div className="my-3 border-t border-dashed border-muted-foreground/40" />

              <div className="space-y-2 text-[13px] leading-6">
                {safeEntries.length ? (
                  safeEntries.map((entry) => {
                    const lineId = String(entry?.line?.id || "");
                    const qty = Number(entry?.line?.quantity) || 0;
                    const name = String(entry?.menu?.name || "—");
                    const addOns = Array.isArray(entry?.line?.addOns)
                      ? entry.line.addOns
                      : [];
                    const bundleItems = Array.isArray(entry?.menu?.bundleItems)
                      ? entry.menu.bundleItems
                      : [];
                    const baseTotal = getBaseTotal(entry);

                    return (
                      <div key={lineId} className="space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <p className="min-w-0 break-words">
                            <span className="font-bold">{qty}x</span> {name}
                          </p>
                          <p className="shrink-0 font-bold">
                            {Formatter.amount(baseTotal)}
                          </p>
                        </div>

                        {addOns.length ? (
                          <div className="pl-5">
                            <div className="relative mt-1 pl-5 text-[12px] leading-5 text-foreground/80">
                              <span
                                aria-hidden="true"
                                className="absolute left-1 top-[-7px] bottom-[0.6rem] w-px bg-muted-foreground/35"
                              />
                              {addOns.map((addOn) => (
                                <div
                                  key={String(addOn?._id || addOn?.name || "")}
                                  className="relative flex items-start justify-between gap-3"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="absolute -left-4 top-1/2 h-px w-3 -translate-y-1/2 bg-muted-foreground/35"
                                  />
                                  <p className="min-w-0 break-words">
                                    {String(addOn?.name || "Add-on")}
                                  </p>
                                  <p className="shrink-0 font-semibold text-foreground/90">
                                    +
                                    {Formatter.amount(
                                      (Number(addOn?.price) || 0) * qty,
                                    )}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {bundleItems.length ? (
                          <div className="pl-5">
                            <div className="relative mt-1 pl-5 text-[12px] leading-5 text-foreground/80">
                              <span
                                aria-hidden="true"
                                className="absolute left-1 top-[-7px] bottom-[0.6rem] w-px bg-muted-foreground/35"
                              />
                              {bundleItems.map((bundleItem, bundleIndex) => (
                                <div
                                  key={String(
                                    bundleItem?._id ||
                                      bundleItem?.id ||
                                      `${lineId}-bundle-${bundleIndex}`,
                                  )}
                                  className="relative flex items-start justify-between gap-3"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="absolute -left-4 top-1/2 h-px w-3 -translate-y-1/2 bg-muted-foreground/35"
                                  />
                                  <p className="min-w-0 break-words">
                                    {String(bundleItem?.name || "Bundle item")}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground">
                    No items selected
                  </p>
                )}
              </div>

              <div className="my-3 border-t border-dashed border-muted-foreground/40" />

              <div className="text-[13px]">
                <div className="flex items-center justify-between">
                  <span className="font-bold tracking-wide">Total</span>
                  <span className="text-[15px] font-extrabold">
                    {Formatter.amount(totalAmount)}
                  </span>
                </div>

                <div className="mt-3 border-t border-dashed border-muted-foreground/40 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-bold tracking-wide">Tendered</span>
                    <div className="w-[160px]">
                      <Input
                        inputMode="decimal"
                        type="number"
                        required
                        value={tenderedRaw}
                        min={Number(totalAmount)}
                        onChange={(e) => setTenderedRaw(e.target.value)}
                        placeholder="0.00"
                        className="h-10 rounded-lg bg-white text-right text-[14px] font-semibold"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[13px]">
                    <span className="font-bold tracking-wide">Change</span>
                    <span
                      className={
                        change != null && change < 0
                          ? "font-bold text-[15px] text-destructive"
                          : "font-bold text-[15px]"
                      }
                    >
                      {change == null
                        ? "—"
                        : Formatter.amount(Math.max(0, change))}
                    </span>
                  </div>
                  <div className="mt-3 border-t border-dashed border-muted-foreground/40" />
                </div>
              </div>
            </div>
            <Button
              type="submit"
              disabled={formSubmitted}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-base  font-sans"
            >
              <CreditCard className="h-4 w-4" />
              Complete Payment <Spinner formSubmitted={formSubmitted} />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CashierPaymentModal;
