import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import posTransactionsToExcel from "./posTransactionsToExcel";
import format from "../../format";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });
const transactions = [
  { _id: "transaction-0001", amount: 300, created: { by: { fullName: "Ana" }, at: "2026-10-01T02:00:00Z" }, items: [{}, {}] },
  { _id: "transaction-0002", amount: 700, created: { by: { fullName: "Luis" }, at: "2026-10-02T02:00:00Z" }, items: [{}] },
];

it.each([transactions, [transactions[0]], [transactions[1]]])("keeps period totals while exporting filtered transaction rows %#", async (...rows) => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=", "base64") }));
  await posTransactionsToExcel({ array: rows, options: {
    summary: { totalAmount: 5000, totalCount: 20 },
    date: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) },
  } });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()));
  const sheet = workbook.getWorksheet("POS Transactions");
  expect(sheet.getCell("A7").value.richText[1].text).toBe("20");
  expect(sheet.getCell("G7").value.richText[1].text).toBe(format.peso(5000));
  rows.forEach((transaction, index) => {
    expect(sheet.getCell(`K${9 + index}`).value).toBe(transaction.amount);
    expect(sheet.getCell(`E${9 + index}`).value).toBe(transaction.created.by.fullName);
  });
  expect(sheet.getCell(`A${9 + rows.length}`).value).toBeNull();
  expect(sheet.getRow(6).height).toBe(24);
  expect(sheet.getColumn("L").hidden).not.toBe(true);
  expect(sheet.getColumn("M").width).toBe(0.5);
  expect(sheet.getColumn("N").hidden).toBe(true);
  expect(sheet.pageSetup.printArea).toMatch(/^A1:M\d+$/);
  expect(sheet.getImages()[0].range.br.nativeCol).toBe(12);
});
