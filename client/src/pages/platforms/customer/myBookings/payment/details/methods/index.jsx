import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { TYPE_META } from "../../constant";
import MethodLogo from "./logo";

const PaymentMethods = ({ methods, selectedMethodId, setSelectedMethodId }) => {
  const scrollRef = useRef(null);

  const pointerState = useRef({
    isDown: false,
    startX: 0,
    startScrollLeft: 0,
    dragged: false,
  });

  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) {
      return;
    }

    const container = scrollRef.current;

    if (!container) return;

    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    if (maxScrollLeft <= 0) return;

    pointerState.current = {
      isDown: true,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      dragged: false,
    };
  };

  const handlePointerMove = (event) => {
    const container = scrollRef.current;
    const state = pointerState.current;

    if (!container || !state.isDown) return;

    const distance = event.clientX - state.startX;

    if (Math.abs(distance) >= 5) {
      if (!state.dragged) {
        state.dragged = true;
        setIsDragging(true);
      }

      container.scrollLeft = state.startScrollLeft - distance;
    }
  };

  const handlePointerUp = () => {
    if (!pointerState.current.isDown) return;

    pointerState.current.isDown = false;
    setIsDragging(false);
  };

  const handlePointerCancel = () => {
    pointerState.current = {
      isDown: false,
      startX: 0,
      startScrollLeft: 0,
      dragged: false,
    };

    setIsDragging(false);
  };

  const scrollMethodIntoView = (button, methodId) => {
    const container = scrollRef.current;

    if (!container || !button) return;

    const methodIndex = methods.findIndex(({ _id }) => _id === methodId);

    const hasPreviousMethod = methodIndex > 0;
    const hasNextMethod = methodIndex < methods.length - 1;

    const containerRect = container.getBoundingClientRect();
    const buttonRect = button.getBoundingClientRect();

    const previousMethodPreview = hasPreviousMethod ? 80 : 0;
    const nextMethodPreview = hasNextMethod ? 80 : 0;

    let targetScrollLeft = container.scrollLeft;

    const desiredLeftEdge = containerRect.left + previousMethodPreview;

    if (buttonRect.left < desiredLeftEdge) {
      targetScrollLeft -= desiredLeftEdge - buttonRect.left;
    }

    const desiredRightEdge = containerRect.right - nextMethodPreview;

    if (buttonRect.right > desiredRightEdge) {
      targetScrollLeft += buttonRect.right - desiredRightEdge;
    }

    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    targetScrollLeft = Math.min(Math.max(targetScrollLeft, 0), maxScrollLeft);

    container.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  };

  const handleMethodClick = (event, methodId) => {
    if (pointerState.current.dragged) {
      pointerState.current.dragged = false;
      return;
    }

    setSelectedMethodId(methodId);

    scrollMethodIntoView(event.currentTarget, methodId);
  };

  return (
    <div
      ref={scrollRef}
      className={`-mx-1 min-w-0 overflow-x-auto overflow-y-hidden px-1 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        isDragging ? "cursor-grabbing select-none" : ""
      }`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div className="flex w-max min-w-full gap-1.5">
        {methods.map((method) => {
          const selected = method._id === selectedMethodId;

          const methodType = TYPE_META[method.type]?.label || "Payment method";

          return (
            <button
              key={method._id}
              type="button"
              onClick={(event) => handleMethodClick(event, method._id)}
              draggable={false}
              className={`flex h-14 w-[13.5rem] shrink-0 items-center gap-2 rounded-md border px-2.5 text-left transition sm:w-48 ${
                selected
                  ? "border-foreground/20 bg-muted/40 shadow-xs"
                  : "bg-background hover:border-foreground/20 hover:bg-muted/20"
              }`}
            >
              <MethodLogo method={method} className="size-9 p-1.5" />

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-foreground">
                  {method.name}
                </span>

                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {method.accountName || methodType}
                </span>
              </span>

              <span
                className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-transparent text-transparent"
                }`}
              >
                <Check className="size-2.5" />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentMethods;
