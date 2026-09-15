// hooks/useVenueDraft.js

import { useEffect, useState } from "react";

const CATERING_DRAFT_KEY = "cateringDraft";

const useCateringDraft = ({
  selected,
  form,
  setForm,
  menuSelections,
  setMenuSelections,
  currentStep,
  setCurrentStep,
}) => {
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);

  // RESTORE VENUE DRAFT
  useEffect(() => {
    try {
      const cateringDraft = sessionStorage.getItem(CATERING_DRAFT_KEY);
      const venueReview = sessionStorage.getItem("venue-review");

      if (cateringDraft) {
        const draft = JSON.parse(cateringDraft);

        if (draft?.form) {
          setForm({
            ...draft.form,
            venue: {
              ...draft.form.venue,
              ...(venueReview && { item: JSON.parse(venueReview)?._id }),
            },
          });
        }

        if (draft?.menuSelections) {
          setMenuSelections(draft.menuSelections);
        }

        if (draft?.currentStep) {
          setCurrentStep(draft.currentStep);
        }
      }
    } catch (error) {
      console.error("Failed to restore catering draft:", error);

      sessionStorage.removeItem(CATERING_DRAFT_KEY);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [setForm, setMenuSelections, setCurrentStep]);

  // PERSIST VENUE DRAFT
  useEffect(() => {
    if (!isDraftLoaded) return;

    try {
      sessionStorage.setItem(
        CATERING_DRAFT_KEY,
        JSON.stringify({
          form,
          menuSelections,
          currentStep,
          selected,
        }),
      );
    } catch (error) {
      console.error("Failed to save catering draft:", error);
    }
  }, [form, menuSelections, currentStep, isDraftLoaded, selected]);

  const clearCateringDraft = () => {
    sessionStorage.removeItem(CATERING_DRAFT_KEY);
  };

  return {
    isDraftLoaded,
    clearCateringDraft,
  };
};

export default useCateringDraft;
