import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Stepper,
  StepperContent,
  StepperDescription,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTitle,
  StepperTrigger,
} from "@/components/reui/stepper";
import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BROWSE as BROWSE_VENUES } from "@/services/redux/slices/events/venues";
import { Step1, Step2, Step3, Step4, Step5, Step6 } from "./steps";
import {
  DEFAULT_FORM,
  DEFAULT_MENU_SELECTIONS,
  DEFAULT_STEPS,
  FALLBACK_VENUES,
} from "./constant";
import {
  buildPackageInfo,
  computeEstimated,
  getSelectedMenus,
  onMenuToggle,
} from "../../utils";

import isValid from "./validation";
import Header from "./header";
import Actions from "./actions";
import useCateringDraft from "./useCateringDraft";

const Inquire = ({ selected = {}, onSelect = () => {} }) => {
  const dispatch = useDispatch();
  const { collections: venueCollections = [] } = useSelector(
    ({ venues }) => venues,
  );
  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [menuSelections, setMenuSelections] = useState(DEFAULT_MENU_SELECTIONS);
  const packageSelected = Boolean(selected?._id);

  const { clearCateringDraft } = useCateringDraft({
    selected,
    form,
    setForm,
    menuSelections,
    setMenuSelections,
    currentStep,
    setCurrentStep,
  });

  useEffect(() => {
    dispatch(BROWSE_VENUES());
  }, [dispatch]);

  useEffect(() => {
    if (form?.bookingType === "catering") {
      setSteps(DEFAULT_STEPS.filter(({ title }) => title !== "Venue"));
    } else {
      setSteps(DEFAULT_STEPS);
    }
  }, [form?.bookingType]);

  const packageInfo = useMemo(() => buildPackageInfo(selected), [selected]);
  const venues = useMemo(() => {
    const availableVenues = venueCollections.filter(
      (venue) => venue?.isAvailable,
    );

    return [...availableVenues];
  }, [venueCollections]);

  const selectedVenue = useMemo(
    () =>
      venues.find(({ _id }) => _id === form?.venue?.item) || FALLBACK_VENUES[0],
    [form?.venue?.item, venues],
  );

  const cateringEstimate = useMemo(() => {
    return computeEstimated({
      basePrice: packageInfo.basePrice,
      maxHours: packageInfo?.includedHours,
      time: form?.catering?.time,
      addFee: {
        hour: packageInfo?.addPricePerHour,
        pax: packageInfo?.addPricePerGuest,
      },
      pax: {
        avail: form?.catering?.pax,
        max: packageInfo?.includedGuests,
      },
    });
  }, [form.catering?.pax, form?.venue?.pax, packageInfo, selectedVenue]);

  const venueEstimate = useMemo(() => {
    return computeEstimated({
      basePrice: selectedVenue.basePrice,
      maxHours: selectedVenue?.duration?.max,
      time: form?.venue?.time,
      addFee: {
        hour: selectedVenue?.additionalCharges?.perHour,
        pax: selectedVenue?.additionalCharges?.perPax,
      },
      pax: {
        avail: form?.venue?.pax,
        max: selectedVenue?.capacity,
      },
    });
  }, [form?.venue, selectedVenue]);

  const selectedMenus = useMemo(
    () => ({
      main: getSelectedMenus(
        packageInfo.mainCourseCategories,
        menuSelections.main,
      ),
      side: getSelectedMenus(
        packageInfo.sideMenuCategories,
        menuSelections.side,
      ),
    }),
    [menuSelections, packageInfo],
  );

  const selectedMainCount = selectedMenus.main.length;
  const selectedSideCount = selectedMenus.side.length;

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMenuToggle = (type, category, menu, limit) => {
    onMenuToggle(
      type,
      category,
      menu,
      limit,
      setMenuSelections,
      selectedMainCount,
      selectedSideCount,
      packageInfo,
    );
  };

  const goNext = (e) => {
    e.preventDefault();
    if (!isValid(currentStep, form, menuSelections, selected)) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const isBoth = form?.bookingType === "both";
    const payload = {
      catering: {
        ...form?.catering,
        item: selected?._id,
        mainDishes: Object.values(menuSelections?.main).flat(),
        sideDishes: Object.values(menuSelections?.side).flat(),
      },
      ...(isBoth && { venue: form?.venue }),
      contact: form?.contact,
      date: form?.date,
      eventType: form?.eventType,
      notes: form?.notes,
      bookingType: form?.bookingType,
      pricing: {
        catering: cateringEstimate,
        venue: venueEstimate,
        total: (cateringEstimate?.total || 0) + (venueEstimate?.total || 0),
      },
    };

    console.log("payload", payload);

    // console.info("Catering inquiry payload", payload);
    // toast.success(
    //   "Inquiry prepared. Sandy's Kitchen will confirm availability.",
    // );
  };

  if (!packageSelected) {
    return (
      <div className="min-h-screen bg-muted/30 p-3 sm:p-5">
        <div className="mx-auto max-w-3xl rounded-lg border bg-card p-5 shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            className="mb-3 h-8 gap-1 px-2 text-xs"
            onClick={() => onSelect({}, "default")}
          >
            <ArrowLeft className="size-3.5" />
            Back to Packages
          </Button>

          <h1 className="text-lg font-bold">Select a package first</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a catering package before sending an inquiry.
          </p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onSelect({}, "default");
    clearCateringDraft();
  };
  return (
    <div className="min-h-screen bg-muted/30 p-2 sm:p-4">
      <div className="mx-auto max-w-5xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 h-8 gap-1.5 px-2 text-xs"
          onClick={handleBack}
        >
          <ArrowLeft className="size-3.5" />
          Back to Packages
        </Button>

        <div className="rounded-lg border bg-card shadow-sm">
          <Header packageInfo={packageInfo} estimate={cateringEstimate} />

          <Stepper
            value={currentStep}
            onValueChange={(step) => {
              if (step <= currentStep) setCurrentStep(step);
            }}
            orientation="vertical"
            className="grid grid-cols-[48px_minmax(0,1fr)] sm:grid-cols-[150px_minmax(0,1fr)]"
            indicators={{
              completed: <Check className="size-3.5" />,
            }}
          >
            <div className="border-r bg-muted/10 px-1 py-4 sm:px-3">
              <StepperNav className={"sticky top-4"}>
                {steps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <StepperItem
                      key={step.title}
                      step={index + 1}
                      className="relative items-start not-last:flex-1"
                    >
                      <StepperTrigger
                        type="button"
                        className="w-full items-start gap-2 pb-8 last:pb-0"
                      >
                        <StepperIndicator className="size-7 border bg-background data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=completed]:border-primary data-[state=completed]:bg-primary data-[state=completed]:text-white">
                          <Icon className="size-3.5 sm:hidden" />
                          <span className="hidden text-xs sm:inline">
                            {index + 1}
                          </span>
                        </StepperIndicator>

                        <div className="hidden min-w-0 pt-0.5 text-left sm:block">
                          <StepperTitle className="truncate text-xs font-semibold">
                            {step.title}
                          </StepperTitle>

                          <StepperDescription className="mt-0.5 truncate text-[10px]">
                            {step.description}
                          </StepperDescription>
                        </div>
                      </StepperTrigger>

                      {index < steps.length - 1 && (
                        <StepperSeparator className="absolute left-3.5 top-8 -order-1 m-0 h-[calc(100%-2rem)] -translate-x-1/2 bg-border group-data-[state=completed]/step:bg-primary" />
                      )}
                    </StepperItem>
                  );
                })}
              </StepperNav>
            </div>

            <form onSubmit={goNext}>
              <StepperPanel className="min-w-0">
                {[
                  Step1,
                  Step2,
                  Step3,
                  form?.bookingType !== "catering" ? Step4 : undefined,
                  Step5,
                  Step6,
                ]
                  .filter(Boolean)
                  .map((Step, idx) => (
                    <StepperContent
                      value={idx + 1}
                      className={"p-3 sm:p-5"}
                      key={idx}
                    >
                      <Step
                        form={form}
                        selected={selected}
                        packageInfo={packageInfo}
                        selectedMainCount={selectedMainCount}
                        selectedSideCount={selectedSideCount}
                        menuSelections={menuSelections}
                        venues={venues}
                        estimate={{
                          venue: venueEstimate,
                          catering: cateringEstimate,
                        }}
                        selectedMenus={selectedMenus}
                        selectedVenue={selectedVenue}
                        setForm={setForm}
                        handleMenuToggle={handleMenuToggle}
                        handleSubmit={handleSubmit}
                        updateField={updateField}
                      />
                      <Actions
                        currentStep={currentStep}
                        totalSteps={steps.length}
                        onBack={goBack}
                      />
                    </StepperContent>
                  ))}
              </StepperPanel>
            </form>
          </Stepper>
        </div>
      </div>
    </div>
  );
};

export default Inquire;
