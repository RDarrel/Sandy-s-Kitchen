import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fullName } from "@/services/utilities";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { SERVICE_BADGES } from "../../constant";
import {
  buildInclusions,
  getConflictingVenues,
  getEquipmentAllocations,
  getIngredientIds,
  getPaymentSummary,
  getServiceRows,
  hasCateringVenueOverlap,
  hasIngredientShortage,
} from "./utils";
import Service from "./service";
import { DIALOG_CONTENT_CLASSNAME } from "./constant";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  APPROVE,
  EQUIPMENT_AVAILABILITY,
  UPDATE,
} from "@/services/redux/slices/events/bookings";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import Spinner from "@/components/shared/spinner";
import ConflictPanel from "./service/conflictPanel";
import Inclusions from "./inclusions";
import Estimate from "./estimate";
import CustomerDetails from "./customerDetails";
import BookingSummary from "./bookingSummary";
import RequestChanges from "./requestChanges";
import WarningMsg from "./warningMsg";
import FinancialDetails from "./financialDetails";
import { STOCKS } from "@/services/redux/slices/inventory/inventoryItems";

const Approval = ({ isOpen, setIsOpen, selected = {}, mode = "approval" }) => {
  const { auth } = useSelector(({ auth }) => auth);
  const {
    formSubmitted,
    schedule,
    equipmentAvailability: availability,
    isLoadingEquipAvailability,
  } = useSelector(({ bookings }) => bookings);
  const { collections: ingredientStocks } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const [booking, setBooking] = useState({});
  const [equipAvailability, setEquipAvailability] = useState({});
  // const [equipmentAllocations, setEquipmentAllocations] = useState([]);
  const [isEquipmentSufficient, setHasSufficientEquipment] = useState(false);
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState("");
  const [changeRequestError, setChangeRequestError] = useState("");
  const dispatch = useDispatch();

  const isViewOnly = mode === "view";

  useEffect(() => {
    if (isOpen) {
      const { bookingType } = selected;
      setBooking(selected);
      dispatch(EQUIPMENT_AVAILABILITY({ bookingID: selected?._id }));
      if (bookingType !== "venue") {
        dispatch(STOCKS({ inventoryIds: getIngredientIds(selected) }));
      }
    }
  }, [isOpen, selected, dispatch]);

  const equipmentAllocations = useMemo(() => {
    if (!isOpen) return [];
    return getEquipmentAllocations(booking);
  }, [booking, isOpen]);

  useEffect(() => {
    if (!isLoadingEquipAvailability && isOpen && selected?._id) {
      setEquipAvailability(availability);
    }
  }, [availability, isLoadingEquipAvailability, isOpen, selected]);

  useEffect(() => {
    if (isOpen && !isLoadingEquipAvailability) {
      const isEquipmentSufficient = Object.values(equipAvailability)?.every(
        ({ available, cateringAllocation = 0, venueAllocation = 0 }) => {
          return cateringAllocation + venueAllocation <= available && available;
        },
      );
      setHasSufficientEquipment(isEquipmentSufficient);
    }
  }, [equipAvailability, isOpen, isLoadingEquipAvailability]);

  const service = SERVICE_BADGES[booking?.bookingType] || {
    label: "Booking",
    className: "border-border bg-muted/40 text-foreground",
  };

  const services = useMemo(() => {
    return getServiceRows(booking);
  }, [booking]);

  const isCateringVenueOverlapping = useMemo(() => {
    return hasCateringVenueOverlap(booking);
  }, [booking]);

  const hasShortage = useMemo(() => {
    if (isOpen) {
      return hasIngredientShortage(booking, ingredientStocks);
    }
  }, [booking, isOpen, ingredientStocks]);

  console.log("hasShortage", hasShortage);

  const { hasConflicts, conflicts, totalConflicts } = useMemo(() => {
    const { approved = [], confirmed = [], setup = [] } = schedule;
    return getConflictingVenues(
      booking,
      [...approved, ...confirmed, ...setup],
      mode,
    );
  }, [booking, schedule, mode]);

  const payment = getPaymentSummary(booking);

  const customerName = fullName(booking?.customer?.fullName);

  const isCombinedBooking = booking?.bookingType === "both";

  const conflictService = services.find(({ type }) => type === "venue");

  const handleSubmit = (e) => {
    e.preventDefault();
    const { catering = {}, venue = {} } = booking;
    if (hasConflicts) return;

    const eInclusions = buildInclusions(venue?.inclusions || []);
    const cInclusions = buildInclusions(catering?.inclusions || []);
    const alreadyPaidAmount = selected?.payments
      ?.filter(({ status }) => status === "verified")
      ?.reduce((acc, curr) => acc + curr.amount, 0);

    const hasPayment = alreadyPaidAmount > 0;

    dispatch(
      APPROVE({
        _id: booking?._id,
        eInclusions,
        cInclusions,
        userId: auth?._id,
        totalValueChange: selected?.pricing?.total,
        statusTransaction: {
          old: "pending",
          new: hasPayment ? "confirmed" : "approved",
        },
        amountReceived: hasPayment ? alreadyPaidAmount : 0,
        ...(hasPayment && { status: "confirmed" }),
      }),
    )
      .unwrap()
      .then((payload) => {
        toast.success(payload?.success);
        setIsOpen(false);
        setBooking({});
      })
      .catch((error) => {
        console.error("APPROVE ERROR:", error);

        toast.error("Failed to approve booking. Please try again.");
      });
  };
  const handleRequestChanges = () => {
    const reason = changeRequestReason.trim();

    if (!reason) {
      setChangeRequestError("Reason is required.");
      return;
    }

    const statusHistory = [...(selected?.statusHistory ?? [])];

    statusHistory.push({
      status: "changes_requested",
      changedBy: auth?._id,
      reason,
    });

    dispatch(
      UPDATE({
        _id: booking?._id,
        status: "changes_requested",
        statusHistory,
        statusTransaction: {
          new: "changes_requested",
          old: "pending",
        },
      }),
    )
      .unwrap()
      .then(() => {
        toast.success("Changes requested successfully.");
        setIsOpen(false);
        setBooking({});
      })
      .catch((error) => {
        console.error("error:", error);
        toast.error("Failed to request changes. Please try again.");
      });

    setChangeRequestOpen(false);
    setChangeRequestReason("");
    setChangeRequestError("");
  };

  const handleInclusionAmountChange = useCallback(
    (serviceType, itemID, amount) => {
      setBooking((prev) => {
        const inclusions = [...(prev[serviceType]?.inclusions || [])];

        const index = inclusions.findIndex(({ item }) => item?._id === itemID);

        if (index === -1) {
          return prev;
        }

        inclusions[index] = {
          ...inclusions[index],
          amount,
        };

        return {
          ...prev,

          [serviceType]: {
            ...prev[serviceType],
            inclusions,
          },
        };
      });

      setEquipAvailability((prev) => {
        let updatedAvailability = { catering: 0, venue: 0 };
        const bothAmount = availability?.[itemID]?.available;

        const remainingAvailability = Math.max(0, bothAmount - amount);

        updatedAvailability = {
          catering: remainingAvailability,
          venue: remainingAvailability,
          [`${serviceType}Allocation`]: amount,
        };

        return {
          ...prev,
          [itemID]: {
            ...prev[itemID],
            ...updatedAvailability,
          },
        };
      });
    },
    [availability, isCateringVenueOverlapping],
  );

  const handleDishPreparationChange = useCallback(
    (
      isServings = true,
      dishType = "mainDishes",
      identifier = {
        menuId: "",
        ingredientId: "",
      },
      value = {
        servings: 0,
        ingredientQty: 0,
        unit: "",
      },
    ) => {
      setBooking((prev) => {
        const { catering } = prev;
        const dishes = [...(catering[dishType] ?? [])];

        const index = dishes.findIndex(
          ({ menu }) => menu?._id === identifier?.menuId,
        );

        if (index === -1) {
          return prev;
        }

        if (isServings) {
          dishes[index] = {
            ...dishes[index],
            servings: Number(value?.servings),
          };
        } else {
          const ingredients = [...(dishes[index]?.ingredients ?? [])];
          const ingredientIdx = ingredients?.findIndex(
            ({ inventory }) => inventory === identifier?.ingredientId,
          );
          const updatedIngredient = {
            requiredQty: Number(value?.ingredientQty),
            unit: value?.unit,
          };
          if (ingredientIdx > -1) {
            ingredients[ingredientIdx] = {
              ...ingredients[ingredientIdx],
              ...updatedIngredient,
            };
          } else {
            ingredients.unshift({
              inventory: identifier?.ingredientId,
              ...updatedIngredient,
            });
          }

          dishes[index] = {
            ...dishes[index],
            ingredients,
          };
        }

        return {
          ...prev,
          catering: {
            ...prev.catering,
            [dishType]: dishes,
          },
        };
      });
    },
    [],
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          DIALOG_CONTENT_CLASSNAME,
          isViewOnly
            ? "xl:w-[1080px] xl:max-w-[1080px]"
            : hasConflicts
              ? "xl:grid xl:w-fit xl:max-w-none xl:grid-cols-[790px_310px] xl:gap-6 [&>button]:xl:right-[320px]"
              : "xl:w-[820px] xl:max-w-[820px]",
        )}
      >
        <div
          className={cn(
            "w-full overflow-visible rounded-lg border bg-background shadow-lg",
            isViewOnly ? "xl:w-[1080px]" : "xl:w-[820px]",
          )}
        >
          <DialogHeader className="border-b px-4 py-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <DialogTitle className="truncate text-base">
                    {isViewOnly ? "Booking Details" : "Approve Booking"}
                  </DialogTitle>

                  {hasConflicts && (
                    <Badge
                      variant="outline"
                      className="gap-1 border-destructive/30 bg-destructive/5 text-destructive"
                    >
                      <AlertTriangle className="size-3" />
                      {totalConflicts}{" "}
                      {totalConflicts === 1 ? "conflict" : "conflicts"}
                    </Badge>
                  )}
                </div>

                <DialogDescription>
                  {isViewOnly
                    ? "View booking information, inclusions, and equipment allocations."
                    : hasConflicts
                      ? "Review the detected schedule conflicts before approval."
                      : "Review request details and allocations before approval."}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="approval-form"
            onSubmit={handleSubmit}
            className="space-y-3 p-4"
          >
            <div
              className={cn(
                "grid gap-3",
                isViewOnly
                  ? "xl:grid-cols-[minmax(0,1fr)_300px]"
                  : "grid-cols-1",
              )}
            >
              <div className="space-y-3">
                <BookingSummary
                  booking={booking}
                  isViewOnly={isViewOnly}
                  customerName={customerName}
                  isCombinedBooking={isCombinedBooking}
                  payment={payment}
                  service={service}
                />

                {/* Customer Details */}
                <CustomerDetails
                  booking={booking}
                  customerName={customerName}
                />

                {/* Services */}
                <section className="relative overflow-visible">
                  <div className="grid gap-3">
                    {services.map((item) => (
                      <Service
                        key={item.type}
                        item={item}
                        catering={
                          item?.type === "catering" ? booking?.catering : null
                        }
                        conflicts={conflicts}
                        isBoth={isCombinedBooking}
                        handleDishPreparationChange={
                          handleDishPreparationChange
                        }
                      />
                    ))}
                  </div>

                  {hasConflicts && conflictService && (
                    <ConflictPanel
                      service={conflictService}
                      conflicts={conflicts}
                    />
                  )}
                </section>

                <Inclusions
                  items={equipmentAllocations}
                  booking={booking}
                  equipAvailability={equipAvailability}
                  isViewOnly={isViewOnly}
                  handleInclusionAmountChange={handleInclusionAmountChange}
                />

                {!isViewOnly && <Estimate booking={booking} />}
              </div>

              {isViewOnly && (
                <div className="self-start xl:sticky xl:top-3">
                  <FinancialDetails booking={booking} payment={payment} />
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <DialogFooter className="border-t bg-muted/10 px-4 py-3">
            <WarningMsg
              hasConflicts={hasConflicts}
              isEquipmentSufficient={isEquipmentSufficient}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {isViewOnly ? "Close" : "Cancel"}
            </Button>
            {!isViewOnly && (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:text-amber-800"
                  onClick={() => {
                    setChangeRequestReason("");
                    setChangeRequestError("");
                    setChangeRequestOpen(true);
                  }}
                  disabled={formSubmitted}
                >
                  Request Changes
                </Button>
                <Button
                  type="submit"
                  form="approval-form"
                  disabled={
                    hasConflicts ||
                    formSubmitted ||
                    isLoadingEquipAvailability ||
                    !isEquipmentSufficient
                  }
                >
                  <CheckCircle2 className="size-4" />
                  Approve Booking <Spinner formSubmitted={formSubmitted} />
                </Button>
              </>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
      <RequestChanges
        hasConflicts={hasConflicts}
        changeRequestOpen={changeRequestOpen}
        changeRequestError={changeRequestError}
        changeRequestReason={changeRequestReason}
        setChangeRequestOpen={setChangeRequestOpen}
        setChangeRequestReason={setChangeRequestReason}
        setChangeRequestError={setChangeRequestError}
        handleRequestChanges={handleRequestChanges}
      />
    </Dialog>
  );
};

export default Approval;
