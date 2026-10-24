import { useEffect } from "react";

export default function useHorizontalDrag(ref, enabled, allowButtons = false) {
  useEffect(() => {
    const container = ref.current;
    if (!enabled || !container) return;

    let drag = null;
    let didDrag = false;

    const handlePointerDown = (event) => {
      didDrag = false;
      if (
        event.pointerType !== "mouse" ||
        event.button !== 0 ||
        container.scrollWidth <= container.clientWidth ||
        (!allowButtons && event.target.closest(
          "button, a, input, select, textarea, [role='button'], [contenteditable='true']",
        ))
      ) return;

      drag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        scrollLeft: container.scrollLeft,
      };
    };

    const handlePointerMove = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      const distance = event.clientX - drag.startX;
      if (!didDrag && Math.abs(distance) < 5) return;

      if (!didDrag) container.setPointerCapture(event.pointerId);
      didDrag = true;
      event.preventDefault();
      container.dataset.dragging = "true";
      container.scrollLeft = drag.scrollLeft - distance;
    };

    const handlePointerEnd = (event) => {
      if (!drag || drag.pointerId !== event.pointerId) return;
      drag = null;
      delete container.dataset.dragging;
      if (container.hasPointerCapture(event.pointerId)) {
        container.releasePointerCapture(event.pointerId);
      }
    };

    const handleClick = (event) => {
      if (!didDrag || event.detail === 0) return;
      event.preventDefault();
      event.stopPropagation();
      didDrag = false;
    };

    container.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
    container.addEventListener("lostpointercapture", handlePointerEnd);
    container.addEventListener("click", handleClick, true);
    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      container.removeEventListener("lostpointercapture", handlePointerEnd);
      container.removeEventListener("click", handleClick, true);
      delete container.dataset.dragging;
      if (drag && container.hasPointerCapture(drag.pointerId)) {
        container.releasePointerCapture(drag.pointerId);
      }
    };
  }, [ref, enabled, allowButtons]);
}
