import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
import { BROWSE as BROWSE_CATERING_PACKAGES } from "@/services/redux/slices/events/cateringPackages";
import { Step1, Step2, Step3, Step4, Step5, Step6, Step7 } from "./steps";
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
import useVenueDraft from "./useVenueDraft";

const Inquire = ({ selected = {}, onSelect = () => {} }) => {
  const dispatch = useDispatch();
  const { collections: packages = [] } = useSelector(
    ({ cateringPackages }) => cateringPackages,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [menuSelections, setMenuSelections] = useState(DEFAULT_MENU_SELECTIONS);

  const { clearVenueDraft } = useVenueDraft({
    selected,
    form,
    setForm,
    menuSelections,
    setMenuSelections,
    currentStep,
    setCurrentStep,
  });

  useEffect(() => {
    dispatch(BROWSE_CATERING_PACKAGES());
  }, [dispatch]);

  useEffect(() => {
    if (form?.bookingType === "venue" || !form?.bookingType) {
      setSteps([DEFAULT_STEPS[0], DEFAULT_STEPS[5], DEFAULT_STEPS[6]]);
    } else {
      setSteps(DEFAULT_STEPS);
    }
  }, [form?.bookingType]);

  const selectedCatering = useMemo(
    () =>
      packages.find(({ _id }) => _id === form?.catering?.item) ||
      FALLBACK_VENUES[0],
    [form?.catering?.item, packages],
  );
  const packageInfo = useMemo(
    () => buildPackageInfo(selectedCatering),
    [selectedCatering],
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
  }, [form.catering?.pax, form?.venue?.pax, packageInfo, selectedCatering]);

  const venueEstimate = useMemo(() => {
    return computeEstimated({
      basePrice: selected.basePrice,
      maxHours: selected?.duration?.max,
      time: form?.venue?.time,
      addFee: {
        hour: selected?.additionalCharges?.perHour,
        pax: selected?.additionalCharges?.perPax,
      },
      pax: {
        avail: form?.venue?.pax,
        max: selected?.capacity,
      },
    });
  }, [form?.venue, selected]);

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
    if (!isValid(currentStep, form, menuSelections, selectedCatering)) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const payload = {
      package: selected?._id,
      event: {
        type: form.eventType,
        date: form.eventDate,
        time: form.eventTime,
        duration: form.duration,
        guests: Number(form.guestCount),
        location: form.location,
        setupNotes: form.setupNotes,
      },
      menus: {
        mainCourses: selectedMenus.main.map(({ _id, name }) => ({ _id, name })),
        sideMenus: selectedMenus.side.map(({ _id, name }) => ({ _id, name })),
      },
      customer: {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        preferredContact: form.preferredContact,
      },
      specialRequests: form.specialRequests,
      estimate,
    };

    console.info("Catering inquiry payload", payload);
    toast.success(
      "Inquiry prepared. Sandy's Kitchen will confirm availability.",
    );
  };
  if (!selected?._id) {
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
            Back to Venues
          </Button>

          <h1 className="text-lg font-bold">Select a venue first</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a venue before sending an inquiry.
          </p>
        </div>
      </div>
    );
  }

  const handleBack = () => {
    onSelect({}, "default");
    clearVenueDraft();
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
          Back to Venues
        </Button>

        <div className="rounded-lg border bg-card shadow-sm">
          <Header venue={selected} estimate={venueEstimate} />

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
              <StepperPanel className="min-w-0 flex flex-col  h-full">
                {[
                  Step1,
                  ...(form?.bookingType === "both"
                    ? [Step2, Step3, Step4, Step5]
                    : []),
                  Step6,
                  Step7,
                ]
                  .filter(Boolean)
                  .map((Step, idx) => (
                    <StepperContent
                      value={idx + 1}
                      className={"flex flex-col h-full p-3 sm:p-5 gap-5"}
                      key={idx}
                    >
                      <Step
                        form={form}
                        selected={selected}
                        packageInfo={packageInfo}
                        selectedMainCount={selectedMainCount}
                        selectedSideCount={selectedSideCount}
                        menuSelections={menuSelections}
                        packages={packages}
                        estimate={{
                          venue: venueEstimate,
                          catering: cateringEstimate,
                        }}
                        selectedMenus={selectedMenus}
                        selectedVenue={selected}
                        setForm={setForm}
                        handleMenuToggle={handleMenuToggle}
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
