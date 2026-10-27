import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import bookingTransactionsToExcel from "./bookingTransactionsToExcel";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it.each(["daily", "weekly", "monthly", "yearly"])("exports %s periods with signed totals and transaction details", async (frequency) => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    arrayBuffer: async () => Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=", "base64",
    ),
  }));
  const payment = {
    booking: { reference: "BK-001", customer: { fullName: "Sample Customer" } },
    method: { name: "Cash" }, amount: 1000, status: "verified",
  };
  await bookingTransactionsToExcel({
    array: [
      { label: "Period One", items: [payment, { ...payment, transactionType: "refund", status: "completed", amount: 200 }] },
      { label: "Period Two", items: [{ ...payment, status: "pending", amount: 300 }] },
    ],
    options: { frequency, createdBy: "Administrator", date: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) } },
  });
  const [blob, filename] = saveAs.mock.calls[0];
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await blob.arrayBuffer()));
  const sheet = workbook.getWorksheet("Booking Transactions");
  const title = `${frequency[0].toUpperCase()}${frequency.slice(1)} Booking Transactions Report`;
  expect(sheet.getCell("A5").value).toBe(title);
  expect(filename).toContain(title);
  expect(sheet.getCell("A8").value).toBe("Period One");
  expect(sheet.getCell("I8").value).toBe(800);
  expect(sheet.getCell("I8").alignment.horizontal).toBe("right");
  expect(sheet.getCell("A8").fill.fgColor.argb).toBe("FFC62828");
  expect(sheet.getCell("A9").value).toBe("Booking / Customer");
  expect(sheet.getCell("A10").value.richText[0].font.bold).toBe(true);
  expect(sheet.getCell("G10").value).toBe("Cash");
  expect(sheet.getCell("G10").font.bold).not.toBe(true);
  expect(sheet.getCell("K10").value).toBe(1000);
  expect(sheet.getCell("K10").numFmt).toBe('"+ ₱"#,##0.00;"- ₱"#,##0.00;"+ ₱"0.00');
  expect(sheet.getCell("K11").value).toBe(-200);
  expect(sheet.getCell("K11").numFmt).toBe('"- ₱"#,##0.00;"- ₱"#,##0.00;"- ₱"0.00');
  expect(sheet.getCell("K11").alignment.horizontal).toBe("left");
  expect(sheet.getCell("A12").value).toBe("Period Two");
  expect(sheet.getCell("I12").value).toBe(300);
  expect(sheet.getCell("A13").value).toBe("Booking / Customer");
  expect(sheet.getCell("K14").value).toBe(300);
  expect(sheet.getCell("K14").numFmt).toBe('"₱"#,##0.00');
  expect(sheet.getCell("A17").value.richText[1].text).toBe("Administrator");
  expect(sheet.pageSetup.printArea).toBe("A1:L18");
  expect(sheet.pageSetup.orientation).toBe("portrait");
  expect(sheet.pageSetup.printTitlesRow).toBeUndefined();
  expect(sheet.getImages()).toHaveLength(1);
});
