import ExcelJS from "exceljs";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { isValid } from "date-fns";
import banner from "@/assets/banner.png";
import formattedDate from "../../formattedDate";
import format from "../../format";

const border = {
  top: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
  bottom: { style: "thin" },
};
const currencyFormat = '"₱"#,##0.00';

const posSalesToExcel = async ({ array = [], options = {} } = {}) => {
  if (!array.some((group) => group.items?.length)) return;
  const { date, frequency = "daily", createdBy = "" } = options;
  if (!isValid(date?.from) || !isValid(date?.to) || date.from > date.to) {
    throw new Error("Please select a valid report period.");
  }
  const title = `${frequency.charAt(0).toUpperCase()}${frequency.slice(1)} POS Sales Report`;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("POS Sales", {
    pageSetup: {
      paperSize: 9,
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
    },
  });
  worksheet.views = [{ showGridLines: false }];
  worksheet.properties.defaultColWidth = 9;
  for (let column = 1; column <= 12; column++) worksheet.getColumn(column).width = 9;
  // Content ends at L; keep a narrow print gutter before hidden columns.
  worksheet.getColumn("M").width = 0.5;
  try {
    const response = await fetch(banner);
    if (!response.ok) throw new Error("Unable to load report banner");
    const imageId = workbook.addImage({
      buffer: await response.arrayBuffer(),
      extension: "png",
    });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0.05 },
      br: { col: 12, row: 4 },
    });
  } catch (error) {
    console.error("Failed to add POS sales report banner:", error);
  }

  const cellAt = (
    row,
    start,
    end,
    value,
    { bold = false, numeric = false, fill = false, size = 13, bordered = true } = {},
  ) => {
    if (start !== end) worksheet.mergeCells(`${start}${row}:${end}${row}`);
    const cell = worksheet.getCell(`${start}${row}`);
    cell.value = value;
    cell.font = {
      size,
      bold,
      ...(fill ? { color: { argb: "FFFFFDF8" } } : {}),
    };
    cell.border = bordered ? border : {};
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    if (numeric) cell.numFmt = currencyFormat;
    if (fill)
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFC62828" },
      };
    // Merged cells need an explicit height; Excel does not auto-fit them.
    const text = value?.richText
      ? value.richText.map((part) => part.text).join("")
      : numeric
        ? format.peso(value)
        : String(value ?? "");
    const fontSize = Math.max(
      size,
      ...(value?.richText || []).map((part) => part.font?.size || size),
    );
    let width = 0;
    for (let col = start.charCodeAt(0); col <= end.charCodeAt(0); col++) {
      width += (worksheet.getColumn(String.fromCharCode(col)).width || 9) * 7;
    }
    const charsPerLine = Math.max(
      1,
      Math.floor((width - 12) / (fontSize * 0.65)),
    );
    const lines = text.split(/\r?\n/).reduce((count, paragraph) => {
      let lineCount = 1;
      let used = 0;
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        if (used && used + 1 + word.length > charsPerLine) {
          lineCount++;
          used = 0;
        }
        const length = (used ? used + 1 : 0) + word.length;
        lineCount += Math.floor((length - 1) / charsPerLine);
        used = ((length - 1) % charsPerLine) + 1;
      }
      return count + lineCount;
    }, 0);
    const worksheetRow = worksheet.getRow(row);
    worksheetRow.height = Math.max(
      worksheetRow.height || 0,
      24,
      lines * fontSize * 1.35 + 8,
    );
    return cell;
  };
  cellAt(5, "A", "L", title, { bold: true, size: 25 }).alignment.horizontal =
    "center";
  cellAt(
    6,
    "A",
    "L",
    `${formattedDate(date.from)} to ${formattedDate(date.to)}`,
    { size: 14 },
  ).alignment.horizontal = "center";
  worksheet.getRow(6).height = 24;

  const totals = array
    .flatMap((group) => group.items || [])
    .reduce(
      (sum, item) => ({
        sales: sum.sales + Number(item.amount ?? 0),
        cost: sum.cost + Number(item.totalCost ?? 0),
      }),
      { sales: 0, cost: 0 },
    );
  [
    ["A", "D", "Sales", totals.sales],
    ["E", "H", "Cost", totals.cost],
    ["I", "L", "Profit", totals.sales - totals.cost],
  ].forEach(([start, end, label, value]) => {
    cellAt(7, start, end, {
      richText: [
        { text: `${label}: `, font: { bold: true, size: 16 } },
        { text: format.peso(value), font: { size: 16 } },
      ],
    });
  });

  const columns = [
    { start: "A", end: "E", label: "Menu" },
    { start: "F", end: "F", label: "Qty" },
    { start: "G", end: "H", label: "Total Sales", numeric: true },
    { start: "I", end: "J", label: "Total Cost", numeric: true },
    { start: "K", end: "L", label: "Gross Profit", numeric: true },
  ];
  let row = 8;
  array.forEach((group) => {
    if (!group.items?.length) return;
    const total = group.items.reduce(
      (sum, item) => sum + Number(item.amount ?? 0),
      0,
    );
    cellAt(row, "A", "H", group.label, { bold: true, fill: true, bordered: false });
    cellAt(row, "I", "L", total, {
      bold: true,
      fill: true,
      numeric: true,
      bordered: false,
    }).alignment.horizontal = "right";
    worksheet.getCell(`A${row}`).border = { left: border.left };
    worksheet.getCell(`I${row}`).border = { right: border.right };
    worksheet.getRow(row).height = Math.max(
      22,
      worksheet.getRow(row).height - 4,
    );
    row++;
    columns.forEach(({ start, end, label }) => {
      cellAt(row, start, end, label, { bold: true });
    });
    row++;
    group.items.forEach((item) => {
      const values = [
        item.menu?.name || "Unknown menu",
        Number(item.quantity ?? 0),
        Number(item.amount ?? 0),
        Number(item.totalCost ?? 0),
        Number(item.amount ?? 0) - Number(item.totalCost ?? 0),
      ];
      values.forEach((value, index) => {
        const { start, end, numeric } = columns[index];
        cellAt(row, start, end, value, { numeric });
      });
      row++;
    });
  });

  row += 2;
  [
    ["Generated by: ", createdBy],
    [
      "Date Created: ",
      new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Manila",
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    ],
  ].forEach(([label, value]) => {
    worksheet.mergeCells(`A${row}:L${row}`);
    const cell = worksheet.getCell(`A${row}`);
    cell.value = {
      richText: [
        { text: label, font: { bold: true, size: 13 } },
        { text: value, font: { size: 13 } },
      ],
    };
    cell.alignment = { horizontal: "left", vertical: "middle" };
    worksheet.getRow(row++).height = 24;
  });
  worksheet.pageSetup.printArea = `A1:M${row - 1}`;
  const zip = await JSZip.loadAsync(await workbook.xlsx.writeBuffer());
  const sheetPath = "xl/worksheets/sheet1.xml";
  const document = new DOMParser().parseFromString(await zip.file(sheetPath).async("string"), "application/xml");
  const namespace = document.documentElement.namespaceURI;
  const columnDefinitions = document.getElementsByTagNameNS(namespace, "cols")[0];
  const hidden = document.createElementNS(namespace, "col");
  Object.entries({ min: 14, max: 16384, hidden: 1, width: 9, customWidth: 1 }).forEach(([key, value]) => hidden.setAttribute(key, value));
  columnDefinitions.appendChild(hidden);
  zip.file(sheetPath, new XMLSerializer().serializeToString(document));
  const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${title} - ${formattedDate(date.from)} to ${formattedDate(date.to)}.xlsx`,
  );
};

export default posSalesToExcel;
