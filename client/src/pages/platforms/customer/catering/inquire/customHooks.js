import { useEffect } from "react";

const useVenueInitialization = ({ form, setForm }) => {
  useEffect(() => {
    if (!form?.venue?.pax) {
      setForm((prev) => ({
        ...prev,
        venue: {
          ...prev.venue,
          pax: prev.catering?.pax,
        },
      }));
    }
    if (!form?.venue?.time?.start) {
      setForm((prev) => ({
        ...prev,
        venue: {
          ...prev.venue,
          time: {
            ...prev.venue?.time,
            start: prev.catering?.time?.start,
          },
        },
      }));
    }
    if (!form?.venue?.time?.end) {
      setForm((prev) => ({
        ...prev,
        venue: {
          ...prev.venue,
          time: {
            ...prev.venue?.time,
            end: prev.catering?.time?.end,
          },
        },
      }));
    }
  }, [
    form.catering?.pax,
    form.catering?.time?.start,
    form.catering?.time?.end,
    form.venue?.pax,
    form.venue?.time?.start,
    form.venue?.time?.end,
  ]);
};

export default useVenueInitialization;
