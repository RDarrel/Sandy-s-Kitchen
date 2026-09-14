import { Formatter } from "@/services/utilities";
import { toast } from "sonner";

const toMinutes = (time) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const step1 = (form) => {
  const { bookingType = "", venue = {} } = form;

  const { time: venueTime = {} } = venue;

  // Validate booking type
  if (!bookingType) {
    toast.error("Catering option is required", {
      description: "Please select whether you want to book a catering package.",
      duration: 4000,
    });
    return false;
  }

  // Validate venue time
  if (venueTime?.start && venueTime?.end) {
    const venueStart = toMinutes(venueTime.start);
    const venueEnd = toMinutes(venueTime.end);

    if (venueStart >= venueEnd) {
      toast.error("Invalid venue time", {
        description: `Venue starts at ${Formatter.time(venueTime.start)} and ends at ${Formatter.time(venueTime.end)}. The start time must be earlier than the end time.`,
        duration: 6000,
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

const step3 = (form) => {
  const { bookingType = "", catering = {}, venue = {} } = form;
  const { time: venueTime = {} } = venue;
  const { time: cateringTime = {} } = catering;

  // Validate catering time
  if (cateringTime?.start && cateringTime?.end) {
    const cateringStart = toMinutes(cateringTime.start);
    const cateringEnd = toMinutes(cateringTime.end);

    if (cateringStart >= cateringEnd) {
      toast.error("Invalid catering time", {
        description: `Catering starts at ${Formatter?.time(cateringTime.start)} and ends at ${Formatter?.time(cateringTime.end)}. The start time must be earlier than the end time.`,
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
        description: `Catering starts at ${Formatter?.time(cateringTime.start)}, but the venue is only available from ${Formatter?.time(venueTime.start)}. Please adjust the catering start time.`,
        duration: 6000,
      });
      return false;
    }

    // Catering cannot end after venue
    if (cateringEnd > venueEnd) {
      toast.error("Catering time conflicts with venue time", {
        description: `Catering ends at ${Formatter.time(cateringTime.end)}, but the venue is only available until ${Formatter.time(venueTime.end)}. Please adjust the catering end time.`,
        duration: 6000,
      });
      return false;
    }
  }
  // Validate venue capacity
  if (bookingType === "both") {
    if (venue?.pax < catering?.pax) {
      toast.error("Guest count exceeds venue capacity", {
        description: `The venue can accommodate up to ${venue.pax} guests, but ${catering.pax} guests are selected for catering. Please adjust the catering guest count.`,
        duration: 6000,
      });
      return false;
    } else if (catering?.pax > venue?.px) {
      toast.error("Catering guests exceed venue capacity", {
        description: `You selected ${catering.pax} catering guests, but your venue booking is for up to ${venue.pax} guests. Please reduce the catering guest count.`,
        duration: 6000,
      });
      return false;
    }
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
  if (currentStep === 2) return step2(form);
  if (currentStep === 3) return step3(form);
  if (currentStep === 4) return step4(selected, menuSelections);
  if (currentStep === 5) return step5(selected, menuSelections);
  // if (form?.bookingType === "both" && currentStep === 4) return step4(form);
  return true;
};

export default isValid;
