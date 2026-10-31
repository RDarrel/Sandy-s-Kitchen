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
  buildBookingToUpdate,
  getEquipmentAllocations,
  getIngredientIds,
  getIngredientShortages,
  getPaymentSummary,
  getServiceRows,
} from "./utils";
import Service from "./service";
import {
  ACTION_LABEL,
  DESCRIPTION,
  DIALOG_CONTENT_CLASSNAME,
  TITLE,
} from "./constant";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  EQUIPMENT_AVAILABILITY,
  RESET_VENUE_CONFLICTS,
  UPDATE,
  VENUE_CONFLICTS,
} from "@/services/redux/slices/events/bookings";
import { STOCKS } from "@/services/redux/slices/inventory/inventoryItems";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getPrecalculatedIngredient } from "./service/dishes/utils";
import Spinner from "@/components/shared/spinner";
import ConflictPanel from "./service/conflictPanel";
import ShortagePanel from "./service/shortagePanel";
import Inclusions from "./inclusions";
import Estimate from "./estimate";
import CustomerDetails from "./customerDetails";
import RequestChanges from "./requestChanges";
import WarningMsg from "./warningMsg";
import FinancialDetails from "./financialDetails";
import Summary from "./summary";

const Approval = ({
  isOpen,
  setIsOpen,
  selected = {},
  mode = "approval",
  isReport = false,
}) => {
  const { auth } = useSelector(({ auth }) => auth);
  const {
    formSubmitted,
    venueConflicts,
    equipmentAvailability: availability,
    isLoadingEquipAvailability,
    isLoadingVenueConflicts,
  } = useSelector(({ bookings }) => bookings);
  const { collections: ingredientStocks } = useSelector(
    ({ inventoryItems }) => inventoryItems,
  );
  const [booking, setBooking] = useState({});
  const [equipAvailability, setEquipAvailability] = useState({});
  const [isEquipmentSufficient, setHasSufficientEquipment] = useState(false);
  const [changeRequestOpen, setChangeRequestOpen] = useState(false);
  const [changeRequestReason, setChangeRequestReason] = useState("");
  const [changeRequestError, setChangeRequestError] = useState("");
  const [invalidDishTarget, setInvalidDishTarget] = useState(null);
  const [sidePanelTop, setSidePanelTop] = useState(0);
  const servicePanelRefs = useRef({});
  const dispatch = useDispatch();

  const isViewOnly = mode === "view";

  useEffect(() => {
    if (isOpen) {
      const { bookingType } = selected;
      setBooking(selected);
      if (mode !== "view") {
        dispatch(EQUIPMENT_AVAILABILITY({ bookingID: selected?._id }));

        if (bookingType !== "venue") {
          dispatch(STOCKS({ inventoryIds: getIngredientIds(selected) }));
        }
      }
      if (mode === "approved" && bookingType !== "catering") {
        dispatch(VENUE_CONFLICTS(selected?.reference));
      }
    }
  }, [isOpen, selected, dispatch, mode]);

  const equipmentAllocations = useMemo(() => {
    if (!isOpen) return [];
    return getEquipmentAllocations(booking);
  }, [booking, isOpen]);

  useEffect(() => {
    if (!isLoadingEquipAvailability && isOpen && selected?._id) {
      let _availability = { ...availability };
      if (mode === "update") {
        //ATTACH AMOUNT OF EQUIPMENT
        const { catering, venue } = selected;
        const attachAmount = (source, items) => {
          const equipments = items?.filter(
            ({ amount, model }) => model === "Equipment" && amount,
          );

          equipments?.forEach((element) => {
            const itemId = element?.item?._id;
            _availability = {
              ..._availability,
              [itemId]: {
                ..._availability[itemId],
                [source]: Math.max(
                  0,
                  Number(_availability[itemId]?.[source] ?? 0) -
                    element?.amount,
                ),
                [`${source}Allocation`]: element?.amount,
              },
            };
          });
        };
        attachAmount("catering", catering?.inclusions);
        attachAmount("venue", venue?.inclusions);
      }
      setEquipAvailability(_availability);
    }
  }, [availability, isLoadingEquipAvailability, isOpen, selected, mode]);

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
    if (!isOpen) return [];
    return getServiceRows(selected);
  }, [selected, isOpen]);

  const { hasIngredientShortage = false, shortages = [] } = useMemo(() => {
    if (isOpen) {
      return getIngredientShortages(booking, ingredientStocks);
    }
    return {};
  }, [booking, isOpen, ingredientStocks]);

  const {
    hasConflicts = false,
    conflicts = [],
    totalConflicts = 0,
  } = useMemo(() => {
    const totalConflicts = venueConflicts?.length;
    return {
      conflicts: isViewOnly ? [] : venueConflicts,
      totalConflicts: isViewOnly ? 0 : totalConflicts,
      hasConflicts: isViewOnly ? false : totalConflicts > 0,
    };
  }, [venueConflicts, isViewOnly]);

  const payment = getPaymentSummary(booking);

  const customerName = fullName(booking?.customer?.fullName);

  const isCombinedBooking = booking?.bookingType === "both";
  const conflictService = services.find(({ type }) => type === "venue");
  const shortageService = services.find(({ type }) => type === "catering");
  const hasSidePanel = hasConflicts || hasIngredientShortage;
  const hasStackedSidePanel = hasConflicts && hasIngredientShortage;
  const sidePanelTarget = hasStackedSidePanel
    ? "stacked"
    : hasConflicts
      ? "venue"
      : hasIngredientShortage
        ? "catering"
        : "";

  useEffect(() => {
    if (!isOpen || !sidePanelTarget || sidePanelTarget === "stacked") {
      setSidePanelTop(0);
      return undefined;
    }

    const updateSidePanelTop = () => {
      setSidePanelTop(
        servicePanelRefs.current[sidePanelTarget]?.offsetTop || 0,
      );
    };

    const frame = requestAnimationFrame(updateSidePanelTop);
    window.addEventListener("resize", updateSidePanelTop);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateSidePanelTop);
    };
  }, [isOpen, sidePanelTarget, services]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const willUpdate = mode === "update";
    const isApproval = mode === "approved";
    const form = e.currentTarget;
    const invalidDish = getFirstInvalidDishPreparation(booking);

    if (invalidDish) {
      setInvalidDishTarget(invalidDish);

      requestAnimationFrame(() => {
        form.reportValidity();
      });

      return;
    }
    if (!form.reportValidity()) {
      return;
    }
    if (hasConflicts) return;

    const alreadyPaidAmount = selected?.payments
      ?.filter(({ status }) => status === "verified")
      ?.reduce((acc, curr) => acc + curr.amount, 0);

    // const bookingToUpdate = prepareToUpdate;

    const hasPayment = alreadyPaidAmount > 0;

    const data = {
      ...(["approved", "update"].includes(mode)
        ? buildBookingToUpdate(booking)
        : { _id: booking?._id }),
      status: !willUpdate ? mode : "update",
      userId: auth?._id,
      totalValueChange: isApproval ? selected?.pricing?.total : 0,
      statusTransaction: {
        old: booking?.status,
        new:
          hasPayment && isApproval ? "confirmed" : willUpdate ? "update" : mode,
      },
      amountReceived: hasPayment && isApproval ? alreadyPaidAmount : 0,
      ...(hasPayment && isApproval && { status: "confirmed" }),
    };

    dispatch(UPDATE(data))
      .unwrap()
      .then(() => {
        const messageMap = {
          approved: "Booking approved successfully",
          setup: "Booking setup confirmed successfully.",
        };
        toast.success(
          willUpdate ? "Booking updated successfully." : messageMap[mode],
        );
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
    [availability],
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
          const dish = dishes[index];
          const preCalculatedIngredients = dish?.menu?.ingredients?.map(
            (ing) => {
              const consumed = getPrecalculatedIngredient(
                ing,
                value?.servings,
                dish?.menu?.recipeYield || 1,
              );
              return {
                inventory: ing?.inventory?._id,
                requiredQty: consumed?.qty,
                unit: consumed?.unit,
              };
            },
          );

          dishes[index] = {
            ...dishes[index],
            servings: Number(value?.servings),
            ingredients: preCalculatedIngredients,
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

  const handleClose = () => {
    setIsOpen(false);
    dispatch(RESET_VENUE_CONFLICTS());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          DIALOG_CONTENT_CLASSNAME,
          isViewOnly
            ? "xl:w-[1080px] xl:max-w-[1080px]"
            : hasSidePanel
              ? "xl:grid xl:w-fit xl:max-w-none xl:grid-cols-[820px_310px] xl:gap-6 [&>button]:xl:right-[320px]"
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
                    {TITLE[mode]}
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
                  {DESCRIPTION[hasConflicts ? "conflict" : mode]}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form
            id="approval-form"
            onSubmit={handleSubmit}
            noValidate
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
                <Summary
                  booking={booking}
                  isViewOnly={["view", "update"].includes(mode)}
                  customerName={customerName}
                  isCombinedBooking={isCombinedBooking}
                  payment={payment}
                  service={service}
                />

                {/* Customer Details */}
                {mode !== "update" && (
                  <CustomerDetails
                    booking={booking}
                    customerName={customerName}
                  />
                )}
                <div className="relative space-y-3 overflow-visible">
                  {/* Services */}
                  <section className="overflow-visible">
                    <div className="grid gap-3">
                      {services.map((item) => (
                        <div
                          key={item.type}
                          ref={(node) => {
                            servicePanelRefs.current[item.type] = node;
                          }}
                        >
                          <Service
                            item={item}
                            catering={
                              item?.type === "catering"
                                ? booking?.catering
                                : null
                            }
                            isReport={isReport}
                            mode={mode}
                            isViewOnly={["view", "setup"].includes(mode)}
                            isPending={booking?.status === "pending"}
                            conflicts={conflicts}
                            isBoth={isCombinedBooking}
                            invalidDishTarget={invalidDishTarget}
                            handleDishPreparationChange={
                              handleDishPreparationChange
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </section>

                  {!isViewOnly && hasSidePanel && (
                    <aside
                      className="mt-2 w-full xl:absolute xl:left-[calc(100%+1.5rem)] xl:z-50 xl:mt-0 xl:w-[310px]"
                      style={{
                        top: sidePanelTop,
                        height: `calc(100% - ${sidePanelTop}px)`,
                      }}
                    >
                      <div className="grid gap-3 xl:sticky xl:top-4">
                        {hasConflicts && conflictService && (
                          <ConflictPanel
                            service={conflictService}
                            conflicts={conflicts}
                          />
                        )}

                        {hasIngredientShortage && shortageService && (
                          <ShortagePanel
                            service={shortageService}
                            shortages={shortages}
                            mode={mode}
                          />
                        )}
                      </div>
                    </aside>
                  )}

                  <Inclusions
                    items={equipmentAllocations}
                    booking={booking}
                    equipAvailability={equipAvailability}
                    isViewOnly={["view", "setup"].includes(mode)}
                    handleInclusionAmountChange={handleInclusionAmountChange}
                    isLoadingEquipAvailability={isLoadingEquipAvailability}
                  />

                  {mode === "approved" && <Estimate booking={booking} />}
                </div>
              </div>

              {isViewOnly && (
                <div className="self-start xl:sticky xl:top-3">
                  <FinancialDetails booking={booking} />
                </div>
              )}
            </div>
          </form>

          {/* Footer */}
          <DialogFooter className="border-t bg-muted/10 px-4 py-3">
            {["update", "approved", "setup"].includes(mode) && (
              <WarningMsg
                hasConflicts={hasConflicts}
                isEquipmentSufficient={isEquipmentSufficient}
                hasIngredientShortage={
                  hasIngredientShortage && mode === "setup"
                }
              />
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              {isViewOnly ? "Close" : "Cancel"}
            </Button>
            {["update", "approved", "setup"].includes(mode) && (
              <>
                {mode === "approved" && (
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
                )}
                <Button
                  type="submit"
                  form="approval-form"
                  disabled={
                    hasConflicts ||
                    formSubmitted ||
                    isLoadingEquipAvailability ||
                    isLoadingVenueConflicts ||
                    !isEquipmentSufficient ||
                    (hasIngredientShortage && mode === "setup")
                  }
                >
                  <CheckCircle2 className="size-4" />
                  {ACTION_LABEL[mode]}
                  <Spinner formSubmitted={formSubmitted} />
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

const getFirstInvalidDishPreparation = (booking = {}) => {
  if (!["catering", "both"].includes(booking?.bookingType)) return null;

  const catering = booking?.catering || {};
  const dishTypes = ["mainDishes", "sideDishes"];

  for (const dishType of dishTypes) {
    const dishes = catering?.[dishType] || [];

    for (const dish of dishes) {
      const menuId = dish?.menu?._id;
      const servings = Number(dish?.servings ?? catering?.pax ?? 0);

      if (!servings || servings < 1) {
        return {
          serviceType: "catering",
          dishType,
          menuId,
          field: "servings",
        };
      }

      for (const ingredient of dish?.ingredients || []) {
        const qty = Number(ingredient?.requiredQty ?? 0);
        const unit = String(ingredient?.unit || "").trim();

        if (!qty || qty <= 0 || !unit) {
          return {
            serviceType: "catering",
            dishType,
            menuId,
            ingredientId:
              ingredient?.inventory?._id || ingredient?.inventory || "",
            field: !unit ? "unit" : "ingredient",
          };
        }
      }
    }
  }

  return null;
};
