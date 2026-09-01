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

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  MapPin,
  Salad,
  Utensils,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { BROWSE as BROWSE_VENUES } from "@/services/redux/slices/events/venues";
import { Step1, Step2, Step3, Step4, Step5, Step6 } from "./steps";

import Header from "./header";

const DEFAULT_STEPS = [
  {
    title: "Event",
    description: "Date and guests",
    icon: CalendarDays,
  },
  {
    title: "Menu",
    description: "Food choices",
    icon: Utensils,
  },
  {
    title: "Side Menus",
    description: "Food choices",
    icon: Salad,
  },
  {
    title: "Venue",
    description: "Place setup",
    icon: MapPin,
  },
  {
    title: "Contact",
    description: "Your details",
    icon: UserRound,
  },
  {
    title: "Review",
    description: "Send inquiry",
    icon: ClipboardCheck,
  },
];

const emptyForm = {
  guestCount: "",
  eventType: "",
  eventDate: "",
  eventTime: "",
  duration: "",
  location: "",
  setupNotes: "",
  fullName: "",
  email: "",
  phone: "",
  preferredContact: "Phone call",
  specialRequests: "",
};

const fallbackVenues = [
  {
    _id: "own-venue",
    name: "Use my own venue",
    address: "Customer provided location",
    capacity: 0,
    basePrice: 0,
    setting: "External",
  },
];

const Inquire = ({ selected = {}, onSelect = () => {} }) => {
  const dispatch = useDispatch();
  const { collections: venueCollections = [] } = useSelector(
    ({ venues }) => venues,
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [steps, setSteps] = useState(DEFAULT_STEPS);
  const [form, setForm] = useState(emptyForm);
  const [menuSelections, setMenuSelections] = useState({
    main: {},
    side: {},
  });
  const [selectedVenueId, setSelectedVenueId] = useState("own-venue");

  const packageSelected = Boolean(selected?._id);

  useEffect(() => {
    dispatch(BROWSE_VENUES());
  }, [dispatch]);

  useEffect(() => {
    if (form?.venueOption === "existing") {
      setSteps(DEFAULT_STEPS.filter(({ title }) => title !== "Venue"));
    } else {
      setSteps(DEFAULT_STEPS);
    }
  }, [form?.venueOption]);

  const packageInfo = useMemo(() => buildPackageInfo(selected), [selected]);
  const venues = useMemo(() => {
    const availableVenues = venueCollections.filter(
      (venue) => venue?.isAvailable,
    );

    return [...fallbackVenues, ...availableVenues];
  }, [venueCollections]);

  const selectedVenue = useMemo(
    () =>
      venues.find(({ _id }) => _id === selectedVenueId) || fallbackVenues[0],
    [selectedVenueId, venues],
  );

  const estimate = useMemo(() => {
    const guests = Number(form.guestCount) || 0;
    const extraGuests = Math.max(0, guests - packageInfo.includedGuests);
    const extraGuestFee = extraGuests * packageInfo.addPricePerGuest;
    const venueFee = Number(selectedVenue?.basePrice) || 0;

    return {
      base: packageInfo.basePrice,
      addPricePerGuest: packageInfo?.addPricePerGuest,
      extraGuestFee,
      venueFee,
      total: packageInfo.basePrice + extraGuestFee + venueFee,
    };
  }, [form.guestCount, packageInfo, selectedVenue]);

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
    const categoryId = category?._id;
    const menuId = getMenuId(menu);

    setMenuSelections((prev) => {
      const group = prev[type] || {};
      const current = group[categoryId] || [];
      const isSelected = current.includes(menuId);
      const nextCategorySelections = isSelected
        ? current.filter((id) => id !== menuId)
        : [...current, menuId];

      if (!isSelected && nextCategorySelections.length > limit) {
        toast.warning(
          `${getCategoryName(category)} allows ${limit} selection${
            limit > 1 ? "s" : ""
          }.`,
        );
        return prev;
      }

      if (
        !isSelected &&
        type === "main" &&
        selectedMainCount >= packageInfo.mainCourseLimit
      ) {
        toast.warning(
          `This package allows up to ${packageInfo.mainCourseLimit} main courses.`,
        );
        return prev;
      }

      if (
        !isSelected &&
        type === "side" &&
        selectedSideCount >= packageInfo.sideMenuLimit
      ) {
        toast.warning(
          `This package allows up to ${packageInfo.sideMenuLimit} side menus.`,
        );
        return prev;
      }

      return {
        ...prev,
        [type]: {
          ...group,
          [categoryId]: nextCategorySelections,
        },
      };
    });
  };

  const validateStep = (step = currentStep) => {
    if (step === 2) {
      if (!form.eventType) return warn("Please select the event type.");
      if (!form.eventDate) return warn("Please choose your preferred date.");
      if (!form.eventTime) return warn("Please choose your preferred time.");
      if (Number(form.guestCount) < packageInfo.includedGuests) {
        return warn(
          `This package requires at least ${packageInfo.includedGuests} guests.`,
        );
      }
      if (!form.location.trim())
        return warn("Please enter the event location.");
    }

    if (step === 3 && selectedMainCount !== packageInfo.mainCourseLimit) {
      return warn(
        `Please choose ${packageInfo.mainCourseLimit} main course${
          packageInfo.mainCourseLimit > 1 ? "s" : ""
        }.`,
      );
    }

    if (step === 3 && selectedSideCount !== packageInfo.sideMenuLimit) {
      return warn(
        `Please choose ${packageInfo.sideMenuLimit} side menu${
          packageInfo.sideMenuLimit > 1 ? "s" : ""
        }.`,
      );
    }

    if (step === 5) {
      if (!form.fullName.trim()) return warn("Please enter your full name.");
      if (!form.phone.trim()) return warn("Please enter your phone number.");
      if (!form.email.trim()) return warn("Please enter your email address.");
    }

    return true;
  };

  const goNext = () => {
    if (!validateStep()) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const goBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = () => {
    const stepsValid = [2, 3, 5].every((step) => validateStep(step));
    if (!stepsValid) return;

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
      venue: selectedVenueId === "own-venue" ? null : selectedVenueId,
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

  return (
    <div className="min-h-screen bg-muted/30 p-2 sm:p-4">
      <div className="mx-auto max-w-5xl">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-2 h-8 gap-1.5 px-2 text-xs"
          onClick={() => onSelect({}, "default")}
        >
          <ArrowLeft className="size-3.5" />
          Back to Packages
        </Button>

        <div className="rounded-lg border bg-card shadow-sm">
          <Header packageInfo={packageInfo} estimate={estimate} />

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

            <StepperPanel className="min-w-0">
              {[
                Step1,
                Step2,
                Step3,
                form?.venueOption !== "existing" ? Step4 : undefined,
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
                      packageInfo={packageInfo}
                      selectedMainCount={selectedMainCount}
                      selectedSideCount={selectedSideCount}
                      menuSelections={menuSelections}
                      venues={venues}
                      estimate={estimate}
                      selectedMenus={selectedMenus}
                      selectedVenue={selectedVenue}
                      selectedVenueId={selectedVenueId}
                      setSelectedVenueId={setSelectedVenueId}
                      handleMenuToggle={handleMenuToggle}
                      updateField={updateField}
                    />
                    <StepActions
                      currentStep={currentStep}
                      totalSteps={steps.length}
                      onBack={goBack}
                      onNext={goNext}
                    />
                  </StepperContent>
                ))}
            </StepperPanel>
          </Stepper>
        </div>
      </div>
    </div>
  );
};

export default Inquire;

const StepActions = ({ currentStep, totalSteps, onBack, onNext }) => {
  if (currentStep === totalSteps) {
    return (
      <div className="mt-4 flex items-center justify-start border-t pt-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1 px-2 text-xs"
          onClick={onBack}
        >
          <ChevronLeft className="size-3.5" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex items-center justify-between border-t pt-3">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-xs"
        onClick={onBack}
        disabled={currentStep === 1}
      >
        <ChevronLeft className="size-3.5" />
        Back
      </Button>

      <Button
        type="button"
        size="sm"
        className="h-8 gap-1.5 px-3 text-xs"
        onClick={onNext}
      >
        Continue
        <ChevronRight className="size-3.5" />
      </Button>
    </div>
  );
};

const buildPackageInfo = (item = {}) => {
  const sideMenuLimit = (item?.sideMenuCategories || []).reduce(
    (acc, category) => acc + (Number(category?.limit) || 0),
    0,
  );

  return {
    _id: item?._id,
    imgId: item?.imgId,
    name: item?.name || "Selected Package",
    level: item?.level,
    description: item?.description,
    includedGuests: Number(item?.includedGuests) || 1,
    basePrice: Number(item?.basePrice) || 0,
    addPricePerGuest: Number(item?.addPricePerGuest) || 0,
    addPricePerHour: Number(item?.addPricePerHour) || 0,
    includedHours: Number(item?.includedHours) || 0,
    mainCourseLimit: Number(item?.mainCourseLimit) || 0,
    sideMenuLimit,
    inclusions: item?.inclusions || [],
    mainCourseCategories: item?.mainCourseCategories || [],
    sideMenuCategories: item?.sideMenuCategories || [],
  };
};

const getCategoryId = (category = {}) => {
  return category?.category?._id || category?.category?.name || category?.name;
};

const getCategoryName = (category = {}) => {
  return category?.category?.name || category?.name || "Menu Group";
};

const getCategoryLimit = (category = {}) => {
  return Number(category?.limit) || 1;
};

const getMenuId = (menu = {}) => {
  return menu?._id || menu?.name;
};

const getSelectedMenus = (categories = [], selections = {}) => {
  return categories.flatMap((category) => {
    const selectedIds = selections[getCategoryId(category)] || [];
    return (category?.choices || []).filter((menu) =>
      selectedIds.includes(getMenuId(menu)),
    );
  });
};

const warn = (message) => {
  toast.warning(message);
  return false;
};
