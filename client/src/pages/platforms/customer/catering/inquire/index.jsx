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
  Gift,
  Home,
  MapPin,
  Package,
  Phone,
  Salad,
  Send,
  Utensils,
  UserRound,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { BROWSE as BROWSE_VENUES } from "@/services/redux/slices/events/venues";
import { Formatter } from "@/services/utilities";
import Cloudinary from "@/services/utilities/cloudinary";
import { cn } from "@/lib/utils";

const eventTypes = [
  "Wedding",
  "Birthday Party",
  "Debut",
  "Christening / Baptism",
  "Corporate Event",
  "Family Gathering",
  "Graduation Party",
  "Other",
];

const steps = [
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
    const extraGuests = Math.max(0, guests - packageInfo.minimumGuests);
    const extraGuestFee = extraGuests * packageInfo.addPricePerGuest;
    const venueFee = Number(selectedVenue?.basePrice) || 0;

    return {
      base: packageInfo.basePrice,
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

  const handleMenuToggle = (type, category, menu) => {
    const categoryId = getCategoryId(category);
    const menuId = getMenuId(menu);
    const categoryLimit = getCategoryLimit(category);

    setMenuSelections((prev) => {
      const group = prev[type] || {};
      const current = group[categoryId] || [];
      const isSelected = current.includes(menuId);
      const nextCategorySelections = isSelected
        ? current.filter((id) => id !== menuId)
        : [...current, menuId];

      if (!isSelected && nextCategorySelections.length > categoryLimit) {
        toast.warning(
          `${getCategoryName(category)} allows ${categoryLimit} selection${
            categoryLimit > 1 ? "s" : ""
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
      if (Number(form.guestCount) < packageInfo.minimumGuests) {
        return warn(
          `This package requires at least ${packageInfo.minimumGuests} guests.`,
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

        <div className=" rounded-lg border bg-card shadow-sm">
          <PackageHeader packageInfo={packageInfo} estimate={estimate} />

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
              <StepperContent value={1} className="p-3 sm:p-5">
                <StepHeader
                  title="Event Details"
                  description="Give us the schedule, guest count, and place so we can check availability."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Event Type" required>
                    <select
                      value={form.eventType}
                      onChange={(e) => updateField("eventType", e.target.value)}
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option value="">Select event type</option>
                      {eventTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Number of Guests" required>
                    <Input
                      type="number"
                      min={packageInfo.minimumGuests}
                      value={form.guestCount}
                      onChange={(e) =>
                        updateField("guestCount", e.target.value)
                      }
                      placeholder={`${packageInfo.minimumGuests} or more`}
                    />
                    {/* <FieldHint>
                      Minimum {packageInfo.minimumGuests}; extra guests add{" "}
                      {Formatter.amount(packageInfo.addPricePerGuest)} each.
                    </FieldHint> */}
                  </Field>

                  <Field label="Preferred Date" required>
                    <Input
                      type="date"
                      value={form.eventDate}
                      onChange={(e) => updateField("eventDate", e.target.value)}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Time" required>
                      <Input
                        type="time"
                        value={form.eventTime}
                        onChange={(e) =>
                          updateField("eventTime", e.target.value)
                        }
                      />
                    </Field>

                    <Field label="Hours">
                      <Input
                        type="number"
                        min="1"
                        value={form.duration}
                        onChange={(e) =>
                          updateField("duration", e.target.value)
                        }
                        placeholder="4"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Event Location" required>
                      <Input
                        value={form.location}
                        onChange={(e) =>
                          updateField("location", e.target.value)
                        }
                        placeholder="Barangay, city, province"
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
                    <Field label="Setup Notes">
                      <Textarea
                        value={form.setupNotes}
                        onChange={(e) =>
                          updateField("setupNotes", e.target.value)
                        }
                        className="min-h-16 resize-none"
                        placeholder="Buffet, plated, food trays, theme, access notes..."
                      />
                    </Field>
                  </div>
                </div>

                <StepActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onBack={goBack}
                  onNext={goNext}
                />
              </StepperContent>

              <StepperContent value={2} className="p-3 sm:p-5">
                <StepHeader
                  title="Menu Choices"
                  description="Choose the food lineup included in this catering package."
                  badge={`${selectedMainCount + selectedSideCount}/${
                    packageInfo.mainCourseLimit + packageInfo.sideMenuLimit
                  } selected`}
                />

                <div className="grid gap-4">
                  <MenuSectionHeader
                    icon={Utensils}
                    title="Main Courses"
                    count={selectedMainCount}
                    limit={packageInfo.mainCourseLimit}
                  />

                  <MenuSelection
                    type="main"
                    categories={packageInfo.mainCourseCategories}
                    selections={menuSelections.main}
                    onToggle={handleMenuToggle}
                  />

                  <MenuSectionHeader
                    icon={Salad}
                    title="Side Menus"
                    count={selectedSideCount}
                    limit={packageInfo.sideMenuLimit}
                  />

                  <MenuSelection
                    type="side"
                    categories={packageInfo.sideMenuCategories}
                    selections={menuSelections.side}
                    onToggle={handleMenuToggle}
                  />
                </div>

                <StepActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onBack={goBack}
                  onNext={goNext}
                />
              </StepperContent>

              <StepperContent value={3} className="p-3 sm:p-5">
                <StepHeader
                  title="Venue"
                  description="Use your own location or request one of Sandy's Kitchen venues."
                />

                <RadioGroup
                  value={selectedVenueId}
                  onValueChange={setSelectedVenueId}
                  className="grid gap-2"
                >
                  {venues.map((venue) => (
                    <VenueOption key={venue._id} venue={venue} />
                  ))}
                </RadioGroup>

                <StepActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onBack={goBack}
                  onNext={goNext}
                />
              </StepperContent>

              <StepperContent value={4} className="p-3 sm:p-5">
                <StepHeader
                  title="Contact Details"
                  description="We will use these details to call back and finalize the quote."
                />

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field label="Full Name" required>
                      <Input
                        value={form.fullName}
                        onChange={(e) =>
                          updateField("fullName", e.target.value)
                        }
                        placeholder="Juan Dela Cruz"
                      />
                    </Field>
                  </div>

                  <Field label="Email Address" required>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      placeholder="juan@email.com"
                    />
                  </Field>

                  <Field label="Phone Number" required>
                    <Input
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="09XXXXXXXXX"
                    />
                  </Field>

                  <Field label="Preferred Contact">
                    <select
                      value={form.preferredContact}
                      onChange={(e) =>
                        updateField("preferredContact", e.target.value)
                      }
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    >
                      <option>Phone call</option>
                      <option>SMS</option>
                      <option>Email</option>
                    </select>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field label="Special Requests">
                      <Textarea
                        value={form.specialRequests}
                        onChange={(e) =>
                          updateField("specialRequests", e.target.value)
                        }
                        className="min-h-16 resize-none"
                        placeholder="Allergies, dietary needs, delivery timing, payment questions..."
                      />
                    </Field>
                  </div>
                </div>

                <StepActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onBack={goBack}
                  onNext={goNext}
                />
              </StepperContent>

              <StepperContent value={5} className="p-3 sm:p-5">
                <StepHeader
                  title="Review Inquiry"
                  description="Check the details before sending your catering request."
                />

                <div className="grid gap-3 lg:grid-cols-[1fr_18rem]">
                  <div className="space-y-3">
                    <ReviewCard
                      title="Package"
                      icon={Package}
                      items={[
                        ["Package", packageInfo.name],
                        [
                          "Inclusions",
                          packageInfo.inclusions
                            .map((inclusion) => formatInclusion(inclusion))
                            .join(", "),
                        ],
                      ]}
                    />

                    <ReviewCard
                      title="Event"
                      icon={CalendarDays}
                      items={[
                        ["Type", form.eventType],
                        ["Guests", form.guestCount],
                        ["Date", formatDate(form.eventDate)],
                        ["Time", formatTime(form.eventTime)],
                        ["Location", form.location],
                      ]}
                    />

                    <ReviewCard
                      title="Menu"
                      icon={Utensils}
                      items={[
                        ["Main Courses", joinMenuNames(selectedMenus.main)],
                        ["Side Menus", joinMenuNames(selectedMenus.side)],
                        ["Venue", selectedVenue?.name],
                      ]}
                    />

                    <ReviewCard
                      title="Contact"
                      icon={Phone}
                      items={[
                        ["Name", form.fullName],
                        ["Phone", form.phone],
                        ["Email", form.email],
                        ["Preferred", form.preferredContact],
                      ]}
                    />
                  </div>

                  <div className="h-fit rounded-lg border bg-muted/15 p-3">
                    <div className="mb-3 flex items-center gap-2">
                      <Package className="size-4 text-primary" />
                      <h3 className="text-sm font-semibold">Estimate</h3>
                    </div>

                    <div className="space-y-2 text-xs">
                      <AmountRow label="Package" value={estimate.base} />
                      <AmountRow
                        label="Extra guests"
                        value={estimate.extraGuestFee}
                      />
                      <AmountRow label="Venue" value={estimate.venueFee} />
                    </div>

                    <div className="mt-3 border-t pt-3">
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] font-medium text-muted-foreground">
                            Estimated Total
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            Subject to final confirmation.
                          </p>
                        </div>
                        <p className="text-xl font-bold text-primary">
                          {Formatter.amount(estimate.total)}
                        </p>
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="mt-4 h-9 w-full gap-1.5 text-xs"
                      onClick={handleSubmit}
                    >
                      Send Inquiry
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <StepActions
                  currentStep={currentStep}
                  totalSteps={steps.length}
                  onBack={goBack}
                  onNext={goNext}
                />
              </StepperContent>
            </StepperPanel>
          </Stepper>
        </div>
      </div>
    </div>
  );
};

export default Inquire;

const PackageHeader = ({ packageInfo, estimate }) => {
  return (
    <div className="border-b bg-background px-2.5 py-2.5 sm:px-4 sm:py-3">
      <div className="grid gap-2.5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid min-w-0 grid-cols-[3.5rem_minmax(0,1fr)] gap-2.5 sm:grid-cols-[5rem_minmax(0,1fr)] sm:gap-3">
          <div className="relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted sm:size-20">
            <img
              src={Cloudinary.getPackageImg(packageInfo.imgId, packageInfo._id)}
              alt={`${packageInfo.name} catering package`}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-1.5 pb-0.5 pt-3" />
          </div>

          <div className="min-w-0 self-center grid gap-2 ">
            <div>
              <h1 className="truncate text-base font-bold leading-tight tracking-tight sm:text-xl">
                {packageInfo.name}
              </h1>

              <p className="mt-1 line-clamp-2 text-[11px] leading-tight text-muted-foreground sm:text-xs">
                {packageInfo.description ||
                  "Customize this package for your event."}
              </p>
            </div>
          </div>
        </div>
        <div>
          <div className="catering-package__price">
            <strong>{Formatter.amount(estimate.base)}</strong>
            <small>Starting Rate</small>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1 mt-3">
        <HeaderMetric
          icon={Users}
          label="Guests"
          value={`${packageInfo.minimumGuests}+`}
        />
        <HeaderMetric
          icon={Utensils}
          label="Main Courses"
          value={packageInfo.mainCourseLimit}
        />
        <HeaderMetric
          icon={Salad}
          label="Side Menus"
          value={packageInfo.sideMenuLimit}
        />
        <HeaderMetric
          icon={Gift}
          label="Inclusions"
          value={packageInfo.inclusions.length}
        />
      </div>
    </div>
  );
};

const HeaderMetric = ({ icon, value, label, accent = false }) => {
  const IconComponent = icon;

  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-2 text-[10px] sm:h-9 sm:px-2.5 sm:text-[11px]",
        accent
          ? "border-primary/20 bg-primary/5 text-primary"
          : "bg-muted/15 text-foreground",
      )}
    >
      {IconComponent && (
        <IconComponent className="size-3.5 shrink-0 text-primary" />
      )}
      <span className="font-bold leading-none text-[15px]">{value}</span>
      <span
        className={cn(
          "whitespace-nowrap leading-none",
          accent ? "font-medium text-primary" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
};

const StepHeader = ({ title, description, badge }) => {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-base font-bold tracking-tight">{title}</h2>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {badge && (
        <Badge className="shrink-0 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary shadow-none">
          {badge}
        </Badge>
      )}
    </div>
  );
};

const Field = ({ label, required, children }) => {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
};

const FieldHint = ({ children }) => {
  return <p className="text-[10px] text-muted-foreground">{children}</p>;
};

const PackageOverview = ({ packageInfo, estimate }) => {
  return (
    <div className="grid gap-3 lg:grid-cols-[1fr_16rem]">
      <div className="rounded-lg border bg-background">
        <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold">
              {packageInfo.name}
            </h3>
            <p className="text-[10px] text-muted-foreground">
              {packageInfo.inclusions.length} inclusions included
            </p>
          </div>

          <Badge
            variant="outline"
            className="rounded-full px-2 py-0.5 text-[10px]"
          >
            {packageInfo.level || "Package"}
          </Badge>
        </div>

        <PackageInclusions inclusions={packageInfo.inclusions} />
      </div>

      <div className="rounded-lg border bg-muted/15 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Package className="size-4 text-primary" />
          <h3 className="text-sm font-semibold">Starting Quote</h3>
        </div>

        <div className="space-y-2 text-xs">
          <AmountRow label="Base package" value={estimate.base} />
          <AmountRow
            label="Per extra guest"
            value={packageInfo.addPricePerGuest}
          />
        </div>

        <p className="mt-3 rounded-md border border-primary/15 bg-primary/5 px-2 py-1.5 text-[10px] text-muted-foreground">
          Final pricing will be confirmed after date, guests, menu choices, and
          venue availability are checked.
        </p>
      </div>
    </div>
  );
};

const PackageInclusions = ({ inclusions }) => {
  const visibleInclusions = inclusions.slice(0, 6);
  const hiddenCount = Math.max(0, inclusions.length - visibleInclusions.length);

  if (inclusions.length === 0) {
    return (
      <div className="p-3 text-xs text-muted-foreground">
        No inclusions are listed for this package yet.
      </div>
    );
  }

  return (
    <div className="grid gap-1.5 p-2 sm:grid-cols-2">
      {visibleInclusions.map((inclusion, idx) => (
        <div
          key={`${getInclusionName(inclusion)}-${idx}`}
          className="flex min-h-9 items-center gap-2 rounded-md border border-primary/10 bg-primary/5 px-2.5 py-2 text-xs"
        >
          <Check className="size-3.5 shrink-0 text-primary" />
          <span className="leading-4">{formatInclusion(inclusion)}</span>
        </div>
      ))}

      {hiddenCount > 0 && (
        <div className="flex min-h-9 items-center rounded-md border border-dashed px-2.5 py-2 text-xs font-medium text-muted-foreground">
          +{hiddenCount} more
        </div>
      )}
    </div>
  );
};

const MenuSectionHeader = ({ icon, title, count, limit }) => {
  const IconComponent = icon;

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <IconComponent className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      <Badge variant="outline" className="rounded-full px-2 py-0.5 text-[10px]">
        {count}/{limit}
      </Badge>
    </div>
  );
};

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

const MenuSelection = ({ type, categories, selections, onToggle }) => {
  if (categories.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        No menu choices are available for this package yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {categories.map((category) => {
        const categoryId = getCategoryId(category);
        const selectedIds = selections[categoryId] || [];
        const categoryLimit = getCategoryLimit(category);
        const choices = category?.choices || [];

        return (
          <div
            key={categoryId}
            className="overflow-hidden rounded-lg border bg-background"
          >
            <div className="flex items-center justify-between gap-3 border-b bg-muted/20 px-3 py-2">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold">
                  {getCategoryName(category)}
                </h3>
                <p className="text-[10px] text-muted-foreground">
                  {selectedIds.length}/{categoryLimit} selected
                </p>
              </div>

              <Badge
                variant="outline"
                className="rounded-full px-2 py-0.5 text-[10px]"
              >
                {categoryLimit === 1 ? "Choose 1" : `Choose ${categoryLimit}`}
              </Badge>
            </div>

            <div className="grid gap-1 p-2 sm:grid-cols-2">
              {choices.map((menu) => {
                const menuId = getMenuId(menu);
                const checked = selectedIds.includes(menuId);

                return (
                  <label
                    key={menuId}
                    className={cn(
                      "flex min-h-9 cursor-pointer items-center gap-2 rounded-md border px-2.5 py-2 text-xs transition-colors",
                      checked
                        ? "border-primary/30 bg-primary/5 text-foreground"
                        : "border-transparent hover:border-primary/15 hover:bg-primary/5",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggle(type, category, menu)}
                      className="size-3.5 shrink-0 accent-primary"
                    />
                    <span className="leading-4">{menu?.name}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VenueOption = ({ venue }) => {
  const isOwnVenue = venue._id === "own-venue";

  return (
    <label htmlFor={venue._id} className="block cursor-pointer">
      <div className="flex items-start gap-3 rounded-lg border px-3 py-3 transition-all hover:border-primary/30 hover:bg-primary/[0.02] has-[:checked]:border-primary has-[:checked]:bg-primary/5">
        <RadioGroupItem
          id={venue._id}
          value={venue._id}
          className="mt-0.5 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{venue.name}</h3>
            {isOwnVenue && (
              <Badge
                variant="secondary"
                className="rounded-full px-1.5 py-0 text-[9px]"
              >
                No venue fee
              </Badge>
            )}
          </div>

          <p className="mt-0.5 text-[10px] text-muted-foreground">
            {venue.address}
          </p>

          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px]">
            {!isOwnVenue && (
              <>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Users className="size-3" />
                  Up to {venue.capacity} guests
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Home className="size-3" />
                  {venue.setting}
                </span>
              </>
            )}
            <span className="font-semibold text-foreground">
              {Formatter.amount(venue.basePrice)}
            </span>
          </div>
        </div>
      </div>
    </label>
  );
};

const ReviewCard = ({ title, icon, items }) => {
  const IconComponent = icon;

  return (
    <div className="overflow-hidden rounded-lg border">
      <div className="flex items-center gap-2 border-b bg-muted/20 px-3 py-2">
        <IconComponent className="size-3.5 text-primary" />
        <h3 className="text-xs font-semibold">{title}</h3>
      </div>

      <div className="divide-y">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[86px_minmax(0,1fr)] gap-3 px-3 py-2 text-xs sm:grid-cols-[110px_minmax(0,1fr)]"
          >
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium">{value || "Not provided"}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const AmountRow = ({ label, value }) => {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{Formatter.amount(value)}</span>
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
    minimumGuests: Number(item?.minimumGuests) || 1,
    basePrice: Number(item?.basePrice) || 0,
    addPricePerGuest: Number(item?.addPricePerGuest) || 0,
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

const joinMenuNames = (menus = []) => {
  if (menus.length === 0) return "";
  return menus.map(({ name }) => name).join(", ");
};

const getInclusionName = (inclusion = {}) => {
  return inclusion?.item?.name || inclusion?.name || "Included item";
};

const formatInclusion = (inclusion = {}) => {
  const name = getInclusionName(inclusion);
  const amount = Number(inclusion?.amount) || 0;
  const unit = inclusion?.unit;

  if (!amount || !unit) return name;
  if (unit === "hrs") return `${name} (${amount} hr${amount > 1 ? "s" : ""})`;
  if (unit === "qty") return `${name} (${amount})`;

  return name;
};

const formatDate = (value) => {
  if (!value) return "";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatTime = (value) => {
  if (!value) return "";
  const [hours, minutes] = value.split(":");
  const date = new Date();
  date.setHours(Number(hours), Number(minutes));
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const warn = (message) => {
  toast.warning(message);
  return false;
};
