import { Blob, Buffer } from "node:buffer";
import ExcelJS from "exceljs";
import { afterEach, expect, it, vi } from "vitest";
import { saveAs } from "file-saver";
import posSalesToExcel from "./posSalesToExcel";

vi.mock("file-saver", () => ({ saveAs: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); });

it.each(["daily", "weekly", "monthly", "yearly"])("limits the %s export to L and outlines both ends of date rows", async (frequency) => {
  vi.stubGlobal("Blob", Blob);
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, arrayBuffer: async () => Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jC1sAAAAASUVORK5CYII=", "base64") }));
  await posSalesToExcel({
    array: [
      { label: "First period", items: [{ menu: { name: "Adobo" }, quantity: 2, amount: 300, totalCost: 100 }] },
      { label: "Second period", items: [{ menu: { name: "Pancit" }, quantity: 1, amount: 200, totalCost: 80 }] },
    ],
    options: { frequency, date: { from: new Date(2026, 9, 1), to: new Date(2026, 9, 31) } },
  });
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(Buffer.from(await saveAs.mock.calls[0][0].arrayBuffer()));
  const sheet = workbook.getWorksheet("POS Sales");
  expect(sheet.getCell("A8").value).toBe("First period");
  expect(sheet.getCell("A11").value).toBe("Second period");
  for (const row of [8, 11]) {
    expect(sheet.getCell(`A${row}`).border.left.style).toBe("thin");
    expect(sheet.getCell(`L${row}`).border.right.style).toBe("thin");
    expect(sheet.getCell(`H${row}`).border.right?.style).toBeUndefined();
    expect(sheet.getCell(`I${row}`).border.left?.style).toBeUndefined();
  }
  expect(sheet.getCell("G10").value).toBe(300);
  expect(sheet.getCell("K10").value).toBe(200);
  expect(sheet.getColumn("L").hidden).not.toBe(true);
  expect(sheet.getColumn("M").width).toBe(0.5);
  expect(sheet.getColumn("N").hidden).toBe(true);
  expect(sheet.pageSetup.printArea).toMatch(/^A1:M\d+$/);
  expect(sheet.getImages()[0].range.br.nativeCol).toBe(12);
});
