import { useEffect, useRef, useState } from "react";

const CATERING_DRAFT_KEY = "cateringDraft";

const useCateringDraft = ({
  form,
  setForm,
  menuSelections,
  setMenuSelections,
  currentStep,
  setCurrentStep,
}) => {
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [selected, setSelected] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [reason, setReason] = useState("");

  const isRestoringRef = useRef(true);

  // RESTORE VENUE DRAFT
  useEffect(() => {
    try {
      const cateringDraft = sessionStorage.getItem(CATERING_DRAFT_KEY);

      if (cateringDraft) {
        const draft = JSON.parse(cateringDraft);

        if (draft?.form) {
          setForm(draft?.form);
        }

        if (draft?.selected) {
          setSelected(draft?.selected);
        }

        if (draft?.menuSelections) {
          setMenuSelections(draft.menuSelections);
        }

        if (draft?.currentStep) {
          setCurrentStep(draft.currentStep);
        }

        if (draft?.form?._id) {
          setIsUpdating(true);
        }

        if (draft?.form?.reason) {
          setReason(draft?.form?.reason);
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

    // Skip the first persistence cycle after restoring the draft.
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

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
    setReason("");
    setIsUpdating(false);
    setSelected({});
  };

  return {
    isDraftLoaded,
    selected,
    isUpdating,
    reason,
    clearCateringDraft,
  };
};

export default useCateringDraft;
