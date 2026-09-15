// hooks/useVenueDraft.js

import { useEffect, useState } from "react";

const VENUE_DRAFT_KEY = "venueDraft";

const useVenueDraft = ({
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
      const venueDraft = sessionStorage.getItem(VENUE_DRAFT_KEY);
      const cateringReview = sessionStorage.getItem("catering-review");

      if (venueDraft) {
        const draft = JSON.parse(venueDraft);

        if (draft?.form) {
          setForm({
            ...draft.form,
            catering: {
              ...draft.form.catering,
              ...(cateringReview && { item: JSON.parse(cateringReview)?._id }),
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
      console.error("Failed to restore venue draft:", error);

      sessionStorage.removeItem(VENUE_DRAFT_KEY);
    } finally {
      setIsDraftLoaded(true);
    }
  }, [setForm, setMenuSelections, setCurrentStep]);

  // PERSIST VENUE DRAFT
  useEffect(() => {
    if (!isDraftLoaded) return;

    try {
      sessionStorage.setItem(
        VENUE_DRAFT_KEY,
        JSON.stringify({
          form,
          menuSelections,
          currentStep,
          selected,
        }),
      );
    } catch (error) {
      console.error("Failed to save venue draft:", error);
    }
  }, [form, menuSelections, currentStep, isDraftLoaded, selected]);

  const clearVenueDraft = () => {
    sessionStorage.removeItem(VENUE_DRAFT_KEY);
  };

  return {
    isDraftLoaded,
    clearVenueDraft,
  };
};

export default useVenueDraft;
