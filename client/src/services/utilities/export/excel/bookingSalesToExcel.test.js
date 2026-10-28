import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import bookingSalesToExcel from "./bookingSalesToExcel";
import format from "../../format";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
const bookings = [
  { reference: "BK-confirmed", status: "confirmed", pricing: { total: 10000 }, totalPaid: 3000, outstandingBalance: 7000 },
  { reference: "BK-setup", status: "setup", pricing: { total: 20000 }, totalPaid: 15000, outstandingBalance: 5000 },
  { reference: "BK-completed", status: "completed", pricing: { total: 30000 }, totalPaid: 30000, outstandingBalance: 0 },
];
const summary = { totalBookingValue: 60000, totalPaidAmount: 48000, outstandingBalance: 12000, totalBookings: 3 };
const date = { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) };
const setup = () => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=", "base64") }));
};

it.each(["all", "confirmed", "setup", "completed"])("keeps the report-period summary when exporting %s rows", async (status) => {
  setup();
  const rows = status === "all" ? bookings : bookings.filter((booking) => booking.status === status);
  await bookingSalesToExcel({ array: rows, options: { date, summary, status } });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()));
  const sheet = workbook.getWorksheet("Booking Sales");
  expect(sheet.getColumn("N").hidden).not.toBe(true);
  expect(sheet.getColumn("O").width).toBe(0.5);
  expect(sheet.getColumn("P").hidden).toBe(true);
  expect(sheet.pageSetup.printArea).toMatch(/^A1:O\d+$/);
  expect(sheet.getImages()[0].range.br.nativeCol).toBe(14);
  expect(sheet.getCell("A7").value.richText[1].text).toBe(format.peso(60000));
  expect(sheet.getCell("F7").value.richText[1].text).toBe(format.peso(48000));
  expect(sheet.getCell("K7").value.richText[1].text).toBe(format.peso(12000));
  rows.forEach((booking, index) => {
    expect(sheet.getCell(`A${9 + index}`).value.richText[0].text).toBe(booking.reference);
    expect(sheet.getCell(`I${9 + index}`).value).toBe(booking.pricing.total);
  });
  expect(sheet.getCell(`A${9 + rows.length}`).value).toBeNull();
});

it("honors zero period-summary values instead of calculating from exported rows", async () => {
  setup();
  await bookingSalesToExcel({ array: bookings, options: { date, summary: { totalBookingValue: 0, totalPaidAmount: 0, outstandingBalance: 0 } } });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()));
  for (const address of ["A7", "F7", "K7"]) {
    expect(workbook.getWorksheet("Booking Sales").getCell(address).value.richText[1].text).toBe(format.peso(0));
  }
});
