import { useEffect, useRef, useState } from "react";
import { axioKit } from "@/services/utilities";

export const isPolicyAvailable = (policy) =>
  ["depositPercent", "reservationHoldHours", "cancellationDeadlineDays", "balanceDueDaysBeforeEvent"]
    .every((field) => typeof policy?.[field] === "number" && Number.isFinite(policy[field])) &&
  typeof policy?.depositRefundable === "boolean";

export default function useBookingPolicy(snapshot) {
  const [result, setResult] = useState({ policy: null, loading: true, error: "" });
  const [attempt, setAttempt] = useState(0);
  const [acceptedVersion, setAcceptedVersion] = useState("");
  const agreementRef = useRef(null);
  const hasSnapshot = isPolicyAvailable(snapshot);

  useEffect(() => {
    if (hasSnapshot) return undefined;
    const controller = new AbortController();
    setResult({ policy: null, loading: true, error: "" });
    axioKit.universal("events/bookingPolicy/browse", "", controller.signal)
      .then(({ data }) => {
        if (!controller.signal.aborted) {
          if (!isPolicyAvailable(data)) throw new Error("Policy unavailable");
          setResult({ policy: data, loading: false, error: "" });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setResult({ policy: null, loading: false, error: "The booking policy could not be loaded. Please try again." });
        }
      });
    return () => controller.abort();
  }, [hasSnapshot, attempt]);

  const policy = hasSnapshot ? snapshot : result.policy;
  const version = policy ? JSON.stringify(policy) : "";
  const ready = hasSnapshot || (!result.loading && isPolicyAvailable(policy));
  const accepted = ready && acceptedVersion === version;

  return {
    policy,
    loading: !hasSnapshot && result.loading,
    error: hasSnapshot ? "" : result.error,
    ready,
    accepted,
    agreementRef,
    validateAgreement: () => agreementRef.current?.reportValidity() === true && accepted,
    setAccepted: (checked) => setAcceptedVersion(checked ? version : ""),
    retry: () => setAttempt((value) => value + 1),
  };
}
