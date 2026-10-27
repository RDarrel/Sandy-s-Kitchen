import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { isValid } from "date-fns";
import banner from "@/assets/banner.png";
import fullName from "../../fullName";
import formattedDate from "../../formattedDate";
import format from "../../format";

const border = {
  top: { style: "thin" },
  left: { style: "thin" },
  right: { style: "thin" },
  bottom: { style: "thin" },
};
const orange = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFF7F33" },
};
const currencyFormat = '"₱"#,##0.00';

const dateLabel = (value) =>
  value && isValid(new Date(value)) ? formattedDate(value) : "—";

const addBanner = async (workbook, worksheet) => {
  try {
    const response = await fetch(banner);
    if (!response.ok) throw new Error("Unable to load report banner");
    const buffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ buffer, extension: "png" });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0.05 },
      br: { col: 17, row: 4 },
    });
  } catch (error) {
    console.error("Failed to add booking sales report banner:", error);
  }
};

const bookingSalesToExcel = async ({ array = [], options = {} } = {}) => {
  if (!array.length) return;

  const { date, createdBy = "" } = options;
  if (!isValid(date?.from) || !isValid(date?.to) || date.from > date.to) {
    throw new Error("Please select a valid report period.");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Booking Sales");
  worksheet.views = [{ showGridLines: false }];
  await addBanner(workbook, worksheet);

  // Preserve the sales.js header style across the wider table.
  worksheet.mergeCells("A5:Q5");
  const title = worksheet.getCell("A5");
  title.value = "BOOKING SALES REPORT";
  title.font = { bold: true, size: 25 };
  title.border = border;
  title.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A6:Q6");
  const subtitle = worksheet.getCell("A6");
  subtitle.value = `${formattedDate(date.from)} to ${formattedDate(date.to)}`;
  subtitle.font = { size: 14 };
  subtitle.border = border;
  subtitle.alignment = { horizontal: "center", vertical: "middle" };

  const totals = array.reduce(
    (sum, booking) => [
      sum[0] + Number(booking?.pricing?.total ?? booking?.totalAmount ?? 0),
      sum[1] + Number(booking?.totalPaid ?? 0),
      sum[2] + Number(booking?.outstandingBalance ?? 0),
    ],
    [0, 0, 0],
  );
  [
    ["A7:F7", "Sales", totals[0]],
    ["G7:L7", "Paid", totals[1]],
    ["M7:Q7", "Balance", totals[2]],
  ].forEach(([range, label, value]) => {
    worksheet.mergeCells(range);
    const cell = worksheet.getCell(range.split(":")[0]);
    cell.value = {
      richText: [
        { text: `${label}: `, font: { bold: true, size: 16 } },
        { text: format.peso(value), font: { bold: false, size: 16 } },
      ],
    };
    cell.border = border;
    cell.alignment = { horizontal: "left", vertical: "middle" };
  });

  const columns = [
    { start: "A", end: "C", label: "Booking / Customer" },
    { start: "D", end: "F", label: "Service / Schedule" },
    { start: "G", end: "H", label: "Status" },
    { start: "I", end: "K", label: "Booking Value", numeric: true },
    { start: "L", end: "N", label: "Paid", numeric: true },
    { start: "O", end: "Q", label: "Balance", numeric: true },
  ];
  let rowNumber = 8;

  columns.forEach(({ start, end, label, numeric }) => {
    worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
    const cell = worksheet.getCell(`${start}${rowNumber}`);
    cell.value = label;
    cell.font = { size: 13, bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = orange;
    cell.alignment = {
      horizontal: numeric ? "right" : "left", vertical: "middle", wrapText: true,
    };
    cell.border = border;
  });
  worksheet.getRow(rowNumber).height = 36;
  rowNumber++;

  array.forEach((booking) => {
    const catering = booking?.catering?.schedule?.startAt;
    const venue = booking?.venue?.schedule?.startAt;
    const service = catering && venue ? "Catering + Venue"
      : catering ? "Catering" : venue ? "Venue"
      : (Array.isArray(booking?.type) ? booking.type.join(" + ") : booking?.type) || "—";
    const schedule = catering && venue
      ? "Multiple schedules"
      : dateLabel(catering || venue);
    const customerName = booking?.customer?.fullName;
    const customer = customerName
      ? typeof customerName === "string" ? customerName : fullName(customerName)
      : "Unknown customer";
    const values = [
      `${booking?.reference || "—"}\n${customer}`,
      `${service}\n${schedule}`,
      String(booking?.status || "pending").replace(/^./, (letter) => letter.toUpperCase()),
      Number(booking?.pricing?.total ?? booking?.totalAmount ?? 0),
      Number(booking?.totalPaid ?? 0),
      Number(booking?.outstandingBalance ?? 0),
    ];
    let maxLines = 1;
    values.forEach((value, columnIndex) => {
      const { start, end, numeric } = columns[columnIndex];
      worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
      const cell = worksheet.getCell(`${start}${rowNumber}`);
      cell.value = value;
      cell.font = { size: 13 };
      cell.alignment = {
        horizontal: numeric ? "right" : "left", vertical: "middle", wrapText: true,
      };
      cell.border = border;
      if (numeric) cell.numFmt = currencyFormat;
      const charsPerLine = (end.charCodeAt(0) - start.charCodeAt(0) + 1) * 8;
      const lines = String(value).split("\n").reduce(
        (count, line) => count + Math.max(1, Math.ceil(line.length / charsPerLine)), 0,
      );
      maxLines = Math.max(maxLines, lines);
    });
    worksheet.getRow(rowNumber).height = 30 + (maxLines - 1) * 13;
    rowNumber++;
  });

  // Keep the sales.js footer style aligned with the wider table.
  const footerRow = rowNumber + 2;
  [
    { label: "Generated by: ", value: createdBy || "" },
    {
      label: "Date Created: ",
      value: new Date().toLocaleString("en-US", {
        month: "long", day: "numeric", year: "numeric",
      }),
    },
  ].forEach(({ label, value }, index) => {
    const position = footerRow + index;
    worksheet.mergeCells(`A${position}:Q${position}`);
    const cell = worksheet.getCell(`A${position}`);
    cell.value = {
      richText: [
        { text: label, font: { bold: true, size: 13 } },
        { text: value, font: { size: 13 } },
      ],
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  }), `BOOKING SALES REPORT - ${formattedDate(date.from)} to ${formattedDate(date.to)}.xlsx`);
};

export default bookingSalesToExcel;
