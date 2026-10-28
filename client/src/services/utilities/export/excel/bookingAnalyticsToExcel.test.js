import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import bookingAnalyticsToExcel from "./bookingAnalyticsToExcel";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
const png =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=";
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

const setup = () => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue({
        ok: true,
        arrayBuffer: async () => Buffer.from(png, "base64"),
      }),
  );
};
const date = { from: new Date(2026, 0, 1), to: new Date(2026, 1, 28) };
const item = {
  name: "A long catering package name that must remain complete in the exported workbook",
  bookings: 2,
  value: 12000,
  percentage: 25,
  category: "Main dishes",
};
const data = {
  total: 8,
  value: 48000,
  average: 6000,
  monthly: [
    { month: "Jan", tooltipLabel: "Jan 2026", bookings: 3, value: 18000 },
    { month: "Feb", tooltipLabel: "Feb 2026", bookings: 5, value: 30000 },
  ],
  packages: [item],
  venues: [{ ...item, name: "Main Hall" }],
  dishes: [{ ...item, name: "Adobo" }],
  customers: [{ ...item, name: "Ana Cruz" }],
};

it.each(["bookings", "value"])(
  "exports styled sheets, editable numbers, and a native %s Excel chart",
  async (metric) => {
    setup();
    await bookingAnalyticsToExcel({
      data,
      options: { date, createdBy: "Report Administrator", metric },
    });
    const [blob, filename] = saveAs.mock.calls[0];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(await blob.arrayBuffer()));
    expect(filename).toContain("Booking Analytics Report");
    expect(workbook.worksheets).toHaveLength(6);
    const overview = workbook.getWorksheet("Overview");
    expect(overview.getCell("A5").value).toBe("Booking Analytics Report");
    expect(overview.getCell("A7").fill.fgColor.argb).toBe("FFC62828");
    expect(overview.getCell("A8").value).toBe(8);
    expect(overview.getCell("E8").value).toBe(48000);
    expect(overview.getCell("E8").numFmt).toBe('"₱"#,##0.00');
    expect(overview.getCell("I8").value).toBe(6000);
    expect(overview.getCell("A11").value).toBe(item.name);
    expect(overview.getCell("A14").value).toBe("Booking Trends");
    expect(overview.getCell("A14").font.size).toBe(12);
    expect(overview.getCell("A34").value).toBeNull();
    expect(overview.getCell("A36").text).toBe(
      "Prepared By: Report Administrator",
    );
    expect(overview.getImages()).toHaveLength(1);
    const zip = await JSZip.loadAsync(Buffer.from(await blob.arrayBuffer()));
    const styles = new DOMParser().parseFromString(await zip.file("xl/styles.xml").async("string"), "application/xml");
    const savedBorders = [...styles.getElementsByTagNameNS("*", "border")];
    const edgeStyles = savedBorders.flatMap((border) => [...border.children]
      .filter((edge) => edge.hasAttribute("style"))
      .map((edge) => edge.getAttribute("style")));
    expect(new Set(edgeStyles)).toEqual(new Set(["thin"]));
    const chartText = await zip
      .file("xl/charts/bookingAnalytics.xml")
      .async("string");
    const chart = new DOMParser().parseFromString(chartText, "application/xml");
    expect(chart.querySelector("parsererror")).toBeNull();
    for (const axisName of ["catAx", "valAx"]) {
      const axis = chart.getElementsByTagNameNS("*", axisName)[0];
      const style = [...axis.children].find((node) => node.localName === "spPr");
      expect(style.getElementsByTagNameNS("*", "noFill")).toHaveLength(1);
    }
    const chartFrameStyle = [...chart.documentElement.children].find((node) => node.localName === "spPr");
    expect(chartFrameStyle.getElementsByTagNameNS("*", "ln")[0].getAttribute("w")).toBe("9525");
    expect([...chartFrameStyle.getElementsByTagNameNS("*", "srgbClr")].map((node) => node.getAttribute("val"))).toContain("D9D4CE");
    // The chart draws its own outline; the cells underneath must not duplicate it.
    expect(overview.getCell("M32").border || {}).toEqual({});
    expect(
      chart.getElementsByTagNameNS("*", "barDir")[0].getAttribute("val"),
    ).toBe("col");
    const formulas = [...chart.getElementsByTagNameNS("*", "f")].map(
      (node) => node.textContent,
    );
    expect(formulas).toContain("'Booking Trends'!$A$8:$A$9");
    expect(formulas).toContain(
      metric === "value"
        ? "'Booking Trends'!$K$8:$K$9"
        : "'Booking Trends'!$G$8:$G$9",
    );
    const numberCache = chart.getElementsByTagNameNS("*", "numCache")[0];
    expect(
      [...numberCache.getElementsByTagNameNS("*", "v")].map((node) =>
        Number(node.textContent),
      ),
    ).toEqual(metric === "value" ? [18000, 30000] : [3, 5]);
    expect(
      await zip.file("xl/drawings/drawing1.xml").async("string"),
    ).toContain("graphicFrame");
    const drawing = new DOMParser().parseFromString(await zip.file("xl/drawings/drawing1.xml").async("string"), "application/xml");
    const chartAnchor = [...drawing.getElementsByTagNameNS("*", "twoCellAnchor")].find((anchor) => anchor.getElementsByTagNameNS("*", "graphicFrame").length);
    expect(chartAnchor).toBeDefined();
    const startMarker = chartAnchor.getElementsByTagNameNS("*", "from")[0];
    const endMarker = chartAnchor.getElementsByTagNameNS("*", "to")[0];
    expect(startMarker.getElementsByTagNameNS("*", "col")[0].textContent).toBe("0");
    expect(startMarker.getElementsByTagNameNS("*", "row")[0].textContent).toBe("14");
    expect(endMarker.getElementsByTagNameNS("*", "col")[0].textContent).toBe("13");
    expect(endMarker.getElementsByTagNameNS("*", "row")[0].textContent).toBe("32");
    expect(
      await zip.file("xl/drawings/_rels/drawing1.xml.rels").async("string"),
    ).toContain("../charts/bookingAnalytics.xml");
    expect(await zip.file("[Content_Types].xml").async("string")).toContain(
      "drawingml.chart+xml",
    );
    expect(
      Object.keys(zip.files).filter((path) =>
        /^xl\/media\/.*\.png$/.test(path),
      ),
    ).toHaveLength(1);
    for (const path of Object.keys(zip.files).filter((name) =>
      /^xl\/worksheets\/sheet\d+\.xml$/.test(name),
    )) {
      const sheet = new DOMParser().parseFromString(
        await zip.file(path).async("string"),
        "application/xml",
      );
      const columns = [...sheet.getElementsByTagNameNS("*", "col")];
      expect(
        columns.some(
          (column) =>
            column.getAttribute("min") === "15" &&
            column.getAttribute("max") === "16384" &&
            column.getAttribute("hidden") === "1",
        ),
      ).toBe(true);
    }
    for (const sheet of workbook.worksheets) {
      expect(sheet.pageSetup.orientation).toBe("portrait");
      expect(
        sheet.views.every(
          (view) => view.state !== "frozen" && !view.ySplit && !view.xSplit,
        ),
      ).toBe(true);
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          if (cell.fill?.fgColor?.argb !== "FFC62828") {
            expect(cell.fill?.pattern === "solid").not.toBe(true);
          }
          if (row.number > 6 && cell.value !== null) {
            expect(cell.alignment.horizontal).toBe("left");
          }
        });
        if (
          row.getCell(1).value !== null && /^(Prepared By:|Generated By:)/.test(row.getCell(1).text)
        ) {
          expect(row.height).toBe(20);
          expect(row.getCell(1).value.richText[0].font.bold).toBe(true);
          expect(row.getCell(1).value.richText[1].font.bold).not.toBe(true);
          for (let column = 1; column <= 13; column++) {
            expect(row.getCell(column).border || {}).toEqual({});
          }
        }
        if (row.getCell(1).value !== null && row.getCell(1).border?.right?.style) {
          expect(row.getCell("M").border.right.style).toBe("thin");
        }
        expect(row.getCell("N").value).toBeNull();
      });
      expect(sheet.pageSetup.printArea).toMatch(/^A1:N\d+$/);
      expect(sheet.getColumn("M").width ?? sheet.properties.defaultColWidth).toBe(9);
      expect(sheet.getColumn("M").hidden).not.toBe(true);
      expect(sheet.getColumn("N").hidden).not.toBe(true);
      expect(sheet.getColumn("N").width).toBe(0.5);
      expect(sheet.getColumn("O").hidden).toBe(true);
    }
    expect(fetch).toHaveBeenCalledTimes(1);

    const trends = workbook.getWorksheet("Booking Trends");
    expect(trends.getCell("A7").value).toBe("Month");
    expect(trends.getCell("K7").value).toBe("Booking Value");
    for (const [title, key] of [
      ["Most-Booked Packages", "packages"],
      ["Most-Booked Venues", "venues"],
      ["Most-Selected Dishes", "dishes"],
      ["Top Booking Customers", "customers"],
    ]) {
      expect(workbook.getWorksheet(title).getCell("A7").value).toBe(
        `Top 5 ${key} ranked by number of bookings within the selected period.`,
      );
    }
    expect(trends.getCell("A8").value).toBe("Jan 2026");
    expect(trends.getCell("G8").value).toBe(3);
    expect(trends.getCell("K9").value).toBe(30000);
    expect(trends.getCell("G10").value).toBe(8);
    expect(trends.getCell("K10").value).toBe(48000);
    expect(trends.pageSetup.orientation).toBe("portrait");
    expect(trends.pageSetup.printTitlesRow).toBe("7:7");
    expect(trends.views[0].showGridLines).toBe(false);
    const packages = workbook.getWorksheet("Most-Booked Packages");
    expect(packages.getCell("B9").value).toBe(item.name);
    expect(packages.getCell("L9").value).toBe(0.25);
    expect(packages.getCell("L9").numFmt).toBe("0.0%");
    expect(
      workbook.getWorksheet("Most-Selected Dishes").getCell("J9").value,
    ).toBe("Main dishes");
  },
);

it("exports empty periods without inventing rankings or failing the chart", async () => {
  setup();
  await bookingAnalyticsToExcel({
    data: {
      total: 0,
      value: 0,
      average: 0,
      monthly: [],
      packages: [],
      venues: [],
      dishes: [],
      customers: [],
    },
    options: { date },
  });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(
    Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()),
  );
  expect(workbook.getWorksheet("Overview").getCell("A11").value).toBe(
    "No bookings",
  );
  expect(
    workbook.getWorksheet("Most-Booked Packages").getCell("A9").value,
  ).toBe("No bookings in the selected period.");
  const zip = await JSZip.loadAsync(
    Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()),
  );
  const chart = new DOMParser().parseFromString(
    await zip.file("xl/charts/bookingAnalytics.xml").async("string"),
    "application/xml",
  );
  expect(chart.querySelector("parsererror")).toBeNull();
  expect(chart.getElementsByTagNameNS("*", "ser")).toHaveLength(0);
});

it("creates the native chart drawing even when the banner cannot be loaded", async () => {
  setup();
  fetch.mockResolvedValue({ ok: false });
  vi.spyOn(console, "error").mockImplementation(() => {});
  await bookingAnalyticsToExcel({ data, options: { date } });
  const zip = await JSZip.loadAsync(
    Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()),
  );
  const paths = Object.keys(zip.files).filter((path) =>
    /\.(xml|rels)$/.test(path),
  );
  for (const path of paths) {
    const document = new DOMParser().parseFromString(
      await zip.file(path).async("string"),
      "application/xml",
    );
    expect(document.querySelector("parsererror"), path).toBeNull();
  }
  expect(await zip.file("xl/worksheets/sheet1.xml").async("string")).toContain(
    "rIdBookingDrawing",
  );
  expect(
    await zip.file("xl/worksheets/_rels/sheet1.xml.rels").async("string"),
  ).toContain("../drawings/bookingAnalytics.xml");
  expect(
    await zip.file("xl/drawings/bookingAnalytics.xml").async("string"),
  ).toContain("rIdBookingTrends");
  expect(await zip.file("[Content_Types].xml").async("string")).toContain(
    "/xl/drawings/bookingAnalytics.xml",
  );
});

it("rejects invalid report dates before saving", async () => {
  await expect(
    bookingAnalyticsToExcel({
      data,
      options: { date: { from: date.to, to: date.from } },
    }),
  ).rejects.toThrow("valid report period");
  expect(saveAs).not.toHaveBeenCalled();
});
