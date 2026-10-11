import { Formatter } from "@/services/utilities";
import { toast } from "sonner";

const step1 = (form) => {
  const { bookingType = "", venue = {}, catering = {} } = form;
  const venueSchedule = venue?.schedule ?? {};
  const cateringSchedule = catering?.schedule ?? {};
  // Validate booking type
  if (!bookingType) {
    toast.error("Catering option is required", {
      description: "Please select whether you want to book a catering package.",
      duration: 6000,
    });
    return false;
  }

  // Validate venue time
  if (venueSchedule?.startAt && venueSchedule?.endAt) {
    if (new Date(venueSchedule.startAt) >= new Date(venueSchedule.endAt)) {
      toast.error("Invalid venue schedule", {
        description: `Venue starts at ${Formatter.date(venueSchedule.startAt, true)} but ends at ${Formatter.date(venueSchedule.endAt, true)}. Please select a later end date and time.`,
        duration: 8000,
      });
      return false;
    }
  }

  // Catering cannot start before venue
  if (
    cateringSchedule?.startAt &&
    venueSchedule?.startAt &&
    new Date(cateringSchedule.startAt) < new Date(venueSchedule.startAt)
  ) {
    toast.error("Catering starts too early", {
      description: `Catering starts at ${Formatter.date(cateringSchedule.startAt, true)}, but the venue starts at ${Formatter.date(venueSchedule.startAt, true)}. Please adjust the catering schedule.`,
      duration: 8000,
    });
    return false;
  }

  // Catering cannot end after venue
  if (
    cateringSchedule?.endAt &&
    venueSchedule?.endAt &&
    new Date(cateringSchedule.endAt) > new Date(venueSchedule.endAt)
  ) {
    toast.error("Catering ends too late", {
      description: `Catering ends at ${Formatter.date(cateringSchedule.endAt, true)}, but the venue ends at ${Formatter.date(venueSchedule.endAt, true)}. Please adjust the catering schedule.`,
      duration: 8000,
    });
    return false;
  }

  // Validate venue guest count
  if (bookingType === "both") {
    if (catering?.pax > venue?.pax) {
      toast.error("Guest count exceeds venue booking", {
        description: `Catering has ${catering.pax} guests, but the venue is booked for ${venue.pax}. Please adjust the guest count.`,
        duration: 8000,
      });
      return false;
    }
  }

  return true;
};

const step2 = (form) => {
  const { catering } = form;
  if (!catering?.item) {
    toast.error("Please select a catering package to continue.");
    return false;
  }
  return true;
};

const step4 = (selected, menuSelections) => {
  const mainDishes = Object.values(menuSelections?.main || {}).flat();

  if (mainDishes?.length < selected?.mainCourseLimit) {
    toast.error(
      `Please select ${selected.mainCourseLimit - mainDishes?.length} main dishes to continue.`,
    );
    return false;
  }

  return true;
};
const step5 = (selected, menuSelections) => {
  const sideDishMax = selected?.sideMenuCategories?.reduce(
    (acc, curr) => curr?.limit + acc,
    0,
  );

  const sideDishSelected = Object.values(menuSelections?.side || {}).flat();
  if (sideDishSelected?.length < sideDishMax) {
    const remaining = sideDishMax - sideDishSelected.length;

    toast.error(
      `Please select ${remaining} more side dish${remaining > 1 ? "es" : ""} to continue.`,
    );

    return false;
  }
  return true;
};

const isValid = (currentStep, form, menuSelections, selected) => {
  if (currentStep === 1) return step1(form);
  if (form?.bookingType === "both") {
    if (currentStep === 2) return step2(form);
    if (currentStep === 3) return step4(selected, menuSelections);
    if (currentStep === 4) return step5(selected, menuSelections);
  }
  // if (form?.bookingType === "both" && currentStep === 4) return step4(form);
  return true;
};

export default isValid;
