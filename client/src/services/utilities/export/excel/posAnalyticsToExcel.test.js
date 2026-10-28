import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import JSZip from "jszip";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import posAnalyticsToExcel from "./posAnalyticsToExcel";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it.each(["value", "orders"])("exports POS summary, both rankings, and a native %s chart", async (metric) => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=", "base64") }));
  await posAnalyticsToExcel({ data: {
    totalSales: 4909, totalOrders: 14, averageOrderValue: 4909 / 14,
    bestSellingDish: { name: "Crispy Pata", unitsSold: 8 },
    monthly: [{ month: "Oct", tooltipLabel: "Oct 2026", orders: 14, value: 4909 }],
    dishes: [{ name: "Crispy Pata", unitsSold: 8, value: 2400, percentage: 50 }],
    categories: [{ name: "Main Dishes", unitsSold: 12, value: 4909, percentage: 100 }],
  }, options: { date: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) }, metric } });
  const bytes = Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  expect(workbook.worksheets).toHaveLength(4);
  expect(workbook.getWorksheet("Overview").getCell("A8").value).toBe(4909);
  expect(workbook.getWorksheet("Overview").getCell("E8").value).toBe(14);
  expect(workbook.getWorksheet("Best-Selling Dishes").getCell("H9").value).toBe(8);
  expect(workbook.getWorksheet("Sales by Category").getCell("J9").value).toBe(4909);
  const zip = await JSZip.loadAsync(bytes);
  const chart = new DOMParser().parseFromString(await zip.file("xl/charts/posAnalytics.xml").async("string"), "application/xml");
  expect(chart.querySelector("parsererror")).toBeNull();
  const formulas = [...chart.getElementsByTagNameNS("*", "f")].map((node) => node.textContent);
  expect(formulas).toContain(metric === "value" ? "'Sales Trends'!$K$8:$K$8" : "'Sales Trends'!$G$8:$G$8");
});
