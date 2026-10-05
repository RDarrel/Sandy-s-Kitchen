// hooks/useVenueDraft.js

import { useEffect, useRef, useState } from "react";

const VENUE_DRAFT_KEY = "venueDraft";

const useVenueDraft = ({
  form,
  setForm,
  menuSelections,
  setMenuSelections,
  currentStep,
  setCurrentStep,
}) => {
  const [selected, setSelected] = useState({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [reason, setReason] = useState("");

  const isRestoringRef = useRef(true);

  // RESTORE VENUE DRAFT
  useEffect(() => {
    try {
      const storedDraft = sessionStorage.getItem(VENUE_DRAFT_KEY);

      if (storedDraft) {
        const draft = JSON.parse(storedDraft);

        if (draft?.form) {
          setForm(draft.form);
        }

        if (draft?.selected?._id) {
          setSelected(draft.selected);
        }

        if (draft?.menuSelections) {
          setMenuSelections(draft.menuSelections);
        }

        if (draft?.currentStep != null) {
          setCurrentStep(draft.currentStep);
        }

        if (draft?.form?._id) {
          setIsUpdating(true);
        }

        if (draft?.reason) {
          setReason(draft.reason);
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

    // Skip the first persistence cycle after restoring the draft.
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    try {
      sessionStorage.setItem(
        VENUE_DRAFT_KEY,
        JSON.stringify({
          form,
          menuSelections,
          currentStep,
          selected,
          reason,
        }),
      );
    } catch (error) {
      console.error("Failed to save venue draft:", error);
    }
  }, [form, menuSelections, currentStep, selected, reason, isDraftLoaded]);

  const clearVenueDraft = () => {
    setReason("");
    setIsUpdating(false);
    setSelected({});
    sessionStorage.removeItem(VENUE_DRAFT_KEY);
  };

  return {
    isDraftLoaded,
    selected,
    isUpdating,
    reason,
    clearVenueDraft,
  };
};

export default useVenueDraft;
