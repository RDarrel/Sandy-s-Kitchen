import banner from "@/assets/banner.png";
import { splitPolicyHighlights } from "./highlights";

const printStyles = `
  @page { size: A4; margin: 14mm 16mm; }
  * { box-sizing: border-box; }
  body { margin: 0; color: #252525; font: 10.5pt/1.65 Arial, sans-serif;
    -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .banner { display: block; width: 100%; height: auto; }
  .brand-fallback { padding: 12pt 0; border-bottom: 2pt solid #ad3531;
    font-size: 20pt; font-weight: 700; }
  .document-heading { margin: 22pt 0 16pt; padding-bottom: 15pt;
    border-bottom: 1pt solid #dedbd7; }
  .eyebrow { margin: 0 0 4pt; color: #a33430; font-size: 8pt;
    font-weight: 700; letter-spacing: 1.6pt; text-transform: uppercase; }
  h1 { margin: 0; font-size: 25pt; line-height: 1.2; letter-spacing: -.6pt; }
  .intro { max-width: 440pt; margin: 7pt 0 0; color: #666; font-size: 10pt; }
  .policy-list { margin: 0; padding: 0; list-style: none; }
  .policy-item { display: flex; gap: 13pt; padding: 12pt 0;
    border-bottom: .6pt solid #e6e2dd; break-inside: avoid; }
  .number { flex: 0 0 25pt; height: 25pt; border: .7pt solid #dfc9c5;
    border-radius: 6pt; background: #fbf4f2; color: #a33430;
    text-align: center; line-height: 25pt; font-size: 9pt; font-weight: 700; }
  .policy-copy { flex: 1; min-width: 0; }
  h2 { margin: 0 0 3pt; font-size: 11pt; line-height: 1.4; }
  .policy-copy p { margin: 0; color: #505050; overflow-wrap: anywhere; }
  .policy-copy strong { font-weight: 700; }
  .notice { margin-top: 18pt; padding: 11pt 13pt;
    border: .6pt solid #e6dcc4; border-left: 3pt solid #c39a42;
    border-radius: 3pt; background: #fbf8f0; break-inside: avoid; }
  .notice h2 { color: #725b29; font-size: 9pt; }
  .notice p { margin: 3pt 0 0; color: #615a4b; font-size: 9pt; }
  footer { display: flex; justify-content: space-between; gap: 12pt;
    margin-top: 19pt; padding-top: 9pt; border-top: .6pt solid #dedbd7;
    color: #777; font-size: 8pt; }
`;

export default async function printPolicy(rows, notice) {
  const frame = document.createElement("iframe");
  frame.title = "Print booking policy";
  frame.style.cssText = "position:fixed;width:0;height:0;border:0";
  document.body.appendChild(frame);
  const doc = frame.contentDocument;
  doc.title = "Booking Policy - Sandy's Kitchenette";
  doc.documentElement.lang = "en";

  const element = (tag, text, className) => {
    const node = doc.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  };
  doc.head.appendChild(element("style", printStyles));

  const header = element("header");
  const bannerImage = element("img", "", "banner");
  bannerImage.alt = "Sandy's Kitchenette - Food & Event Services";
  header.appendChild(bannerImage);
  doc.body.appendChild(header);

  // Printing before the banner loads can leave an empty space in the saved PDF.
  const bannerReady = new Promise((resolve) => {
    bannerImage.onload = resolve;
    bannerImage.onerror = () => {
      bannerImage.replaceWith(element("div", "Sandy's Kitchenette", "brand-fallback"));
      resolve();
    };
    bannerImage.src = banner;
  });

  const heading = element("div", "", "document-heading");
  heading.append(
    element("h1", "Booking Policy"),
    element("p", "Please review the following payment and cancellation policies before submitting your booking inquiry.", "intro"),
  );
  const main = element("main");
  main.appendChild(heading);
  const list = element("ol", "", "policy-list");
  rows.forEach(([label, text], index) => {
    const item = element("li", "", "policy-item");
    const copy = element("div", "", "policy-copy");
    const paragraph = element("p");
    splitPolicyHighlights(text).forEach((part, partIndex) => {
      paragraph.append(partIndex % 2 === 1 ? element("strong", part) : doc.createTextNode(part));
    });
    copy.append(element("h2", label), paragraph);
    item.append(element("span", String(index + 1).padStart(2, "0"), "number"), copy);
    list.appendChild(item);
  });
  const note = element("aside", "", "notice");
  note.append(element("h2", "Booking approval"), element("p", notice));
  main.append(list, note);
  doc.body.appendChild(main);
  const footer = element("footer");
  footer.append(element("span", "Sandy's Kitchenette"), element("span", "Booking Policy | Venue & Catering"));
  doc.body.appendChild(footer);

  const printWindow = frame.contentWindow;
  printWindow.addEventListener("afterprint", () => frame.remove(), { once: true });
  await bannerReady;
  try {
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    frame.remove();
    throw error;
  }
}
