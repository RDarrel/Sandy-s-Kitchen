import { afterEach, describe, expect, it, vi } from "vitest";
import printPolicy from "./printPolicy";

afterEach(() => document.querySelectorAll("iframe").forEach((frame) => frame.remove()));

describe("booking policy PDF", () => {
  it("waits for the banner before printing the branded policy and cleans up after printing", async () => {
    const printing = printPolicy([["Down payment", "40% of the booking total."]], "Subject to approval.");
    const frame = document.querySelector("iframe");
    const doc = frame.contentDocument;
    const focus = vi.spyOn(frame.contentWindow, "focus").mockImplementation(() => {});
    const print = vi.spyOn(frame.contentWindow, "print").mockImplementation(() => {});
    expect(doc.title).toBe("Booking Policy - Sandy's Kitchenette");
    expect(doc.querySelector("h1").textContent).toBe("Booking Policy");
    expect(doc.querySelector(".number").textContent).toBe("01");
    expect(doc.querySelector(".policy-copy").textContent).toContain("40%");
    expect(doc.querySelector(".policy-copy strong").textContent).toBe("40%");
    expect(doc.querySelector(".notice").textContent).toContain("Subject to approval.");
    expect(print).not.toHaveBeenCalled();
    const image = doc.querySelector("img");
    expect(image.getAttribute("src")).toContain("banner.png");
    image.dispatchEvent(new Event("load"));
    await printing;
    expect(focus).toHaveBeenCalledOnce();
    expect(print).toHaveBeenCalledOnce();
    frame.contentWindow.dispatchEvent(new Event("afterprint"));
    expect(document.querySelector("iframe")).toBeNull();
  });

  it("still prints the policy with a text heading if the banner fails", async () => {
    const printing = printPolicy([["Cancellation", "Cancel before the deadline."]], "Subject to approval.");
    const frame = document.querySelector("iframe");
    vi.spyOn(frame.contentWindow, "focus").mockImplementation(() => {});
    const print = vi.spyOn(frame.contentWindow, "print").mockImplementation(() => {});
    frame.contentDocument.querySelector("img").dispatchEvent(new Event("error"));
    await printing;
    expect(frame.contentDocument.querySelector(".brand-fallback").textContent).toBe("Sandy's Kitchenette");
    expect(print).toHaveBeenCalledOnce();
  });
});
