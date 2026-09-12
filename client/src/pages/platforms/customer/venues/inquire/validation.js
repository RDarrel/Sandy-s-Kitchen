import { toast } from "sonner";

const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const step1 = (form) => {
  const { bookingType = "", catering = {}, venue = {} } = form;

  const { time: venueTime = {} } = venue;
  const { time: cateringTime = {} } = catering;

  // Validate booking type
  if (!bookingType) {
    toast.error("Venue option is required", {
      description: "Please select whether you want to book a venue.",
      duration: 4000,
    });
    return false;
  }

  // Validate catering time
  if (cateringTime?.start && cateringTime?.end) {
    const cateringStart = toMinutes(cateringTime.start);
    const cateringEnd = toMinutes(cateringTime.end);

    if (cateringStart >= cateringEnd) {
      toast.error("Invalid catering time", {
        description: `Catering starts at ${cateringTime.start} and ends at ${cateringTime.end}. The start time must be earlier than the end time.`,
        duration: 6000,
      });
      return false;
    }
  }

  // Catering only
  if (bookingType === "catering") {
    return true;
  }

  // Validate venue time
  if (venueTime?.start && venueTime?.end) {
    const venueStart = toMinutes(venueTime.start);
    const venueEnd = toMinutes(venueTime.end);

    if (venueStart >= venueEnd) {
      toast.error("Invalid venue time", {
        description: `Venue starts at ${venueTime.start} and ends at ${venueTime.end}. The start time must be earlier than the end time.`,
        duration: 6000,
      });
      return false;
    }
  }

  // Validate catering time against venue time
  if (
    venueTime?.start &&
    venueTime?.end &&
    cateringTime?.start &&
    cateringTime?.end
  ) {
    const venueStart = toMinutes(venueTime.start);
    const venueEnd = toMinutes(venueTime.end);

    const cateringStart = toMinutes(cateringTime.start);
    const cateringEnd = toMinutes(cateringTime.end);

    // Catering cannot start before venue
    if (cateringStart < venueStart) {
      toast.error("Catering time conflicts with venue time", {
        description: `Catering starts at ${cateringTime.start}, but the venue is only available from ${venueTime.start}. Please adjust the catering start time.`,
        duration: 6000,
      });
      return false;
    }

    // Catering cannot end after venue
    if (cateringEnd > venueEnd) {
      toast.error("Catering time conflicts with venue time", {
        description: `Catering ends at ${cateringTime.end}, but the venue is only available until ${venueTime.end}. Please adjust the catering end time.`,
        duration: 6000,
      });
      return false;
    }
  }

  // Validate venue capacity
  if (bookingType === "both" && venue?.pax < catering?.pax) {
    toast.error("Guest count exceeds venue capacity", {
      description: `The venue can accommodate up to ${venue.pax} guests, but ${catering.pax} guests are selected for catering. Please adjust the catering guest count.`,
      duration: 6000,
    });
    return false;
  }

  return true;
};

const step2 = (selected, menuSelections) => {
  const mainDishes = Object.values(menuSelections?.main || {}).flat();

  if (mainDishes?.length < selected?.mainCourseLimit) {
    toast.error(
      `Please select ${selected.mainCourseLimit} main dishes to continue.`,
    );
    return false;
  }

  return true;
};
const step3 = (selected, menuSelections) => {
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

const step4 = (form) => {
  const { venue } = form;
  if (!venue?.item) {
    toast.error("Please select a venue to continue.");
    return false;
  }
  return true;
};
const isValid = (currentStep, form, menuSelections, selected) => {
  if (currentStep === 1) return step1(form);
  if (currentStep === 2) return step2(selected, menuSelections);
  if (currentStep === 3) return step3(selected, menuSelections);
  if (form?.bookingType === "both" && currentStep === 4) return step4(form);
  return true;
};

export default isValid;
