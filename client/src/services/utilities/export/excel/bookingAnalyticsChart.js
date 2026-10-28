import JSZip from "jszip";

const chartNS = "http://schemas.openxmlformats.org/drawingml/2006/chart";
const drawingNS = "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing";
const mainNS = "http://schemas.openxmlformats.org/drawingml/2006/main";
const relNS = "http://schemas.openxmlformats.org/package/2006/relationships";
const officeRelNS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const contentNS = "http://schemas.openxmlformats.org/package/2006/content-types";
const escapeXML = (value) => String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[char]);
const parseXML = (text) => {
  const document = new DOMParser().parseFromString(text, "application/xml");
  if (document.getElementsByTagName("parsererror").length) throw new Error("Unable to create the Excel chart.");
  return document;
};
const serialize = (document) => new XMLSerializer().serializeToString(document);
const append = (document, namespace, tag, attributes) => {
  const element = document.createElementNS(namespace, tag);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  document.documentElement.appendChild(element);
  return element;
};

function chartXML(months, metric) {
  const isValue = metric === "value";
  const label = isValue ? "Booking Value (PHP)" : "Bookings";
  const format = isValue ? '"₱"#,##0' : "#,##0";
  const end = 7 + months.length;
  const series = months.length ? `<c:ser>
    <c:idx val="0"/><c:order val="0"/><c:tx><c:v>${label}</c:v></c:tx>
    <c:spPr><a:solidFill><a:srgbClr val="${isValue ? "C99733" : "C62828"}"/></a:solidFill><a:ln><a:noFill/></a:ln></c:spPr>
    <c:invertIfNegative val="0"/>
    <c:cat><c:strRef><c:f>'Booking Trends'!$A$8:$A$${end}</c:f><c:strCache><c:ptCount val="${months.length}"/>${months.map((month, index) => `<c:pt idx="${index}"><c:v>${escapeXML(month.tooltipLabel || month.month)}</c:v></c:pt>`).join("")}</c:strCache></c:strRef></c:cat>
    <c:val><c:numRef><c:f>'Booking Trends'!$${isValue ? "K" : "G"}$8:$${isValue ? "K" : "G"}$${end}</c:f><c:numCache><c:formatCode>${escapeXML(format)}</c:formatCode><c:ptCount val="${months.length}"/>${months.map((month, index) => `<c:pt idx="${index}"><c:v>${Number(month[metric]) || 0}</c:v></c:pt>`).join("")}</c:numCache></c:numRef></c:val>
  </c:ser>` : "";
  const countStep = Math.max(1, Math.ceil(Math.max(0, ...months.map((month) => Number(month.bookings) || 0)) / 5));
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <c:chartSpace xmlns:c="${chartNS}" xmlns:a="${mainNS}" xmlns:r="${officeRelNS}">
    <c:date1904 val="0"/><c:lang val="en-US"/><c:roundedCorners val="0"/>
    <c:chart><c:autoTitleDeleted val="1"/><c:plotArea><c:layout/>
      <c:barChart><c:barDir val="col"/><c:grouping val="clustered"/><c:varyColors val="0"/>${series}<c:gapWidth val="75"/><c:overlap val="0"/><c:axId val="100"/><c:axId val="200"/></c:barChart>
      <c:catAx><c:axId val="100"/><c:scaling><c:orientation val="minMax"/></c:scaling><c:delete val="0"/><c:axPos val="b"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="nextTo"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr><c:crossAx val="200"/><c:crosses val="autoZero"/><c:auto val="1"/><c:lblAlgn val="ctr"/><c:lblOffset val="100"/></c:catAx>
      <c:valAx><c:axId val="200"/><c:scaling><c:orientation val="minMax"/><c:min val="0"/></c:scaling><c:delete val="0"/><c:axPos val="l"/><c:majorGridlines><c:spPr><a:ln><a:solidFill><a:srgbClr val="E5E0DA"/></a:solidFill></a:ln></c:spPr></c:majorGridlines><c:numFmt formatCode="${escapeXML(format)}" sourceLinked="0"/><c:majorTickMark val="none"/><c:minorTickMark val="none"/><c:tickLblPos val="none"/><c:spPr><a:ln><a:noFill/></a:ln></c:spPr><c:crossAx val="100"/><c:crosses val="autoZero"/><c:crossBetween val="between"/>${isValue ? "" : `<c:majorUnit val="${countStep}"/>`}</c:valAx>
    </c:plotArea><c:plotVisOnly val="1"/><c:dispBlanksAs val="gap"/><c:showDLblsOverMax val="0"/></c:chart>
    <c:spPr><a:solidFill><a:srgbClr val="FFFFFF"/></a:solidFill><a:ln w="9525"><a:solidFill><a:srgbClr val="D9D4CE"/></a:solidFill></a:ln></c:spPr>
  </c:chartSpace>`;
}

// ExcelJS writes the styled sheets; add the native DrawingML chart to that XLSX package.
// The series references real worksheet cells, so Excel can edit/recalculate the chart.
export default async function addBookingAnalyticsChart(buffer, months, metric) {
  const zip = await JSZip.loadAsync(buffer);
  const sheetPath = "xl/worksheets/sheet1.xml";
  const sheetRelPath = "xl/worksheets/_rels/sheet1.xml.rels";
  const emptyRelationships = `<Relationships xmlns="${relNS}"/>`;
  const sheetRels = parseXML(await zip.file(sheetRelPath)?.async("string") || emptyRelationships);
  const existingDrawing = [...sheetRels.getElementsByTagNameNS(relNS, "Relationship")].find((rel) => rel.getAttribute("Type") === `${officeRelNS}/drawing`);
  const drawingPath = existingDrawing
    ? `xl/${existingDrawing.getAttribute("Target").replace(/^\.\.\//, "")}`
    : "xl/drawings/bookingAnalytics.xml";
  const drawing = parseXML(await zip.file(drawingPath)?.async("string") || `<xdr:wsDr xmlns:xdr="${drawingNS}" xmlns:a="${mainNS}"/>`);
  const drawingRelPath = drawingPath.replace(/\/([^/]+)$/, "/_rels/$1.rels");
  const drawingRels = parseXML(await zip.file(drawingRelPath)?.async("string") || emptyRelationships);
  const chartPath = "xl/charts/bookingAnalytics.xml";
  append(drawingRels, relNS, "Relationship", { Id: "rIdBookingTrends", Type: `${officeRelNS}/chart`, Target: "../charts/bookingAnalytics.xml" });

  const objectId = Math.max(0, ...[...drawing.getElementsByTagNameNS(drawingNS, "cNvPr")].map((node) => Number(node.getAttribute("id")))) + 1;
  const anchor = parseXML(`<xdr:twoCellAnchor xmlns:xdr="${drawingNS}" xmlns:a="${mainNS}">
    <xdr:from><xdr:col>0</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>14</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:from>
    <xdr:to><xdr:col>13</xdr:col><xdr:colOff>0</xdr:colOff><xdr:row>32</xdr:row><xdr:rowOff>0</xdr:rowOff></xdr:to>
    <xdr:graphicFrame macro=""><xdr:nvGraphicFramePr><xdr:cNvPr id="${objectId}" name="Booking Trends"/><xdr:cNvGraphicFramePr/></xdr:nvGraphicFramePr><xdr:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/></xdr:xfrm><a:graphic><a:graphicData uri="${chartNS}"><c:chart xmlns:c="${chartNS}" xmlns:r="${officeRelNS}" r:id="rIdBookingTrends"/></a:graphicData></a:graphic></xdr:graphicFrame>
    <xdr:clientData/>
  </xdr:twoCellAnchor>`);
  drawing.documentElement.appendChild(drawing.importNode(anchor.documentElement, true));

  const content = parseXML(await zip.file("[Content_Types].xml").async("string"));
  append(content, contentNS, "Override", { PartName: `/${chartPath}`, ContentType: "application/vnd.openxmlformats-officedocument.drawingml.chart+xml" });
  if (!existingDrawing) {
    append(sheetRels, relNS, "Relationship", { Id: "rIdBookingDrawing", Type: `${officeRelNS}/drawing`, Target: "../drawings/bookingAnalytics.xml" });
    const sheet = parseXML(await zip.file(sheetPath).async("string"));
    const node = sheet.createElementNS(sheet.documentElement.namespaceURI, "drawing");
    node.setAttributeNS(officeRelNS, "r:id", "rIdBookingDrawing");
    const afterDrawing = ["legacyDrawing", "legacyDrawingHF", "picture", "oleObjects", "controls", "webPublishItems", "tableParts", "extLst"];
    const next = [...sheet.documentElement.children].find((child) => afterDrawing.includes(child.localName));
    sheet.documentElement.insertBefore(node, next || null);
    zip.file(sheetPath, serialize(sheet));
    append(content, contentNS, "Override", { PartName: `/${drawingPath}`, ContentType: "application/vnd.openxmlformats-officedocument.drawing+xml" });
  }
  zip.file(sheetRelPath, serialize(sheetRels));
  zip.file(drawingPath, serialize(drawing));
  zip.file(drawingRelPath, serialize(drawingRels));
  zip.file(chartPath, chartXML(months, metric));
  zip.file("[Content_Types].xml", serialize(content));
  // Content ends at M; N is a narrow print gutter, and O onward stays hidden.
  for (const path of Object.keys(zip.files).filter((name) => /^xl\/worksheets\/sheet\d+\.xml$/.test(name))) {
    const sheet = parseXML(await zip.file(path).async("string"));
    const namespace = sheet.documentElement.namespaceURI;
    let columns = sheet.getElementsByTagNameNS(namespace, "cols")[0];
    if (!columns) {
      columns = sheet.createElementNS(namespace, "cols");
      sheet.documentElement.insertBefore(columns, sheet.getElementsByTagNameNS(namespace, "sheetData")[0]);
      const visibleColumns = sheet.createElementNS(namespace, "col");
      Object.entries({ min: 1, max: 13, width: 9, customWidth: 1 }).forEach(([key, value]) => visibleColumns.setAttribute(key, value));
      columns.appendChild(visibleColumns);
    }
    const hiddenColumns = sheet.createElementNS(namespace, "col");
    Object.entries({ min: 15, max: 16384, hidden: 1, width: 9, customWidth: 1 }).forEach(([key, value]) => hiddenColumns.setAttribute(key, value));
    columns.appendChild(hiddenColumns);
    zip.file(path, serialize(sheet));
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}
