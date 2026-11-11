// Capturing the key phrases keeps the same emphasis in the modal and printed PDF.
export const splitPolicyHighlights = (text) => text.split(
  /(\b\d+(?:\.\d+)?%|\b(?:within |at least )?\d+(?:\.\d+)? (?:hour|day)\(s\)(?: before the event)?|on the event date|non-refundable|refundable|subject to the cancellation deadline)/g,
);
