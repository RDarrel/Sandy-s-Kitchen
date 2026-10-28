import ExcelJS from "exceljs";
import JSZip from "jszip";
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
      br: { col: 14, row: 4 },
    });
  } catch (error) {
    console.error("Failed to add booking sales report banner:", error);
  }
};

const bookingSalesToExcel = async ({ array = [], options = {} } = {}) => {
  if (!array.length) return;

  const { date, createdBy = "", summary = {} } = options;
  if (!isValid(date?.from) || !isValid(date?.to) || date.from > date.to) {
    throw new Error("Please select a valid report period.");
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Booking Sales", {
    pageSetup: {
      paperSize: 9, // A4
      orientation: "portrait",
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0, // Allow more pages vertically for longer reports.
      margins: {
        left: 0.25,
        right: 0.25,
        top: 0.4,
        bottom: 0.4,
        header: 0.2,
        footer: 0.2,
      },
      printTitlesRow: "8:8",
    },
  });
  worksheet.views = [{ showGridLines: false }];
  worksheet.properties.defaultColWidth = 9;
  for (let column = 1; column <= 14; column++) worksheet.getColumn(column).width = 9;
  // Content ends at N; keep a small print gutter before the hidden columns.
  worksheet.getColumn("O").width = 0.5;
  await addBanner(workbook, worksheet);

  // Align the report header with the table's last column (N).
  worksheet.mergeCells("A5:N5");
  const title = worksheet.getCell("A5");
  title.value = "Booking Sales Report";
  title.font = { bold: true, size: 25 };
  title.border = border;
  title.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A6:N6");
  const subtitle = worksheet.getCell("A6");
  subtitle.value = `${formattedDate(date.from)} to ${formattedDate(date.to)}`;
  subtitle.font = { size: 14 };
  subtitle.border = border;
  subtitle.alignment = { horizontal: "center", vertical: "middle" };

  // Use the same period-wide summary as the UI; status/search only filter rows.
  const totals = [
    Number(summary.totalBookingValue ?? 0),
    Number(summary.totalPaidAmount ?? 0),
    Number(summary.outstandingBalance ?? 0),
  ];
  [
    ["A7:E7", "Sales", totals[0]],
    ["F7:J7", "Paid", totals[1]],
    ["K7:N7", "Balance", totals[2]],
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
    { start: "I", end: "J", label: "Booking Value", numeric: true },
    { start: "K", end: "L", label: "Paid", numeric: true },
    { start: "M", end: "N", label: "Balance", numeric: true },
  ];
  let rowNumber = 8;

  columns.forEach(({ start, end, label }) => {
    worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
    const cell = worksheet.getCell(`${start}${rowNumber}`);
    cell.value = label;
    // Match the app's primary and primary-foreground brand colors.
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFC62828" },
    };

    cell.font = { size: 13, bold: true, color: { argb: "FFFFFDF8" } };
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
    cell.border = border;
  });
  worksheet.getRow(rowNumber).height = 24;
  rowNumber++;

  array.forEach((booking) => {
    const catering = booking?.catering?.schedule?.startAt;
    const venue = booking?.venue?.schedule?.startAt;
    const service =
      catering && venue
        ? "Catering + Venue"
        : catering
          ? "Catering"
          : venue
            ? "Venue"
            : (Array.isArray(booking?.type)
                ? booking.type.join(" + ")
                : booking?.type) || "—";
    const schedule =
      catering && venue ? "Multiple schedules" : dateLabel(catering || venue);
    const customerName = booking?.customer?.fullName;
    const customer = customerName
      ? typeof customerName === "string"
        ? customerName
        : fullName(customerName)
      : "Unknown customer";
    const values = [
      `${booking?.reference || "—"}\n${customer}`,
      `${service}\n${schedule}`,
      String(booking?.status || "pending").replace(/^./, (letter) =>
        letter.toUpperCase(),
      ),
      Number(booking?.pricing?.total ?? booking?.totalAmount ?? 0),
      Number(booking?.totalPaid ?? 0),
      Number(booking?.outstandingBalance ?? 0),
    ];
    let maxLines = 1;
    values.forEach((value, columnIndex) => {
      const { start, end, numeric } = columns[columnIndex];
      worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
      const cell = worksheet.getCell(`${start}${rowNumber}`);
      if (columnIndex < 2) {
        const [heading, ...details] = String(value).split("\n");
        cell.value = {
          richText: [
            { text: heading, font: { bold: true, size: 13 } },
            {
              text: `\n${details.join("\n")}`,
              font: { bold: false, size: 13 },
            },
          ],
        };
      } else {
        cell.value = value;
      }
      cell.font = { size: 13 };
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = border;
      if (numeric) cell.numFmt = currencyFormat;
      const charsPerLine = (end.charCodeAt(0) - start.charCodeAt(0) + 1) * 8;
      const lines = String(value)
        .split("\n")
        .reduce(
          (count, line) =>
            count + Math.max(1, Math.ceil(line.length / charsPerLine)),
          0,
        );
      maxLines = Math.max(maxLines, lines);
    });
    worksheet.getRow(rowNumber).height = 30 + (maxLines - 1) * 13;
    rowNumber++;
  });

  // Keep the footer aligned with the table.
  const footerRow = rowNumber + 2;
  [
    { label: "Generated by: ", value: createdBy || "" },
    {
      label: "Date Created: ",
      value: new Date().toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    },
  ].forEach(({ label, value }, index) => {
    const position = footerRow + index;
    worksheet.mergeCells(`A${position}:N${position}`);
    const cell = worksheet.getCell(`A${position}`);
    cell.value = {
      richText: [
        { text: label, font: { bold: true, size: 13 } },
        { text: value, font: { size: 13 } },
      ],
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  worksheet.pageSetup.printArea = `A1:O${footerRow + 1}`;

  const zip = await JSZip.loadAsync(await workbook.xlsx.writeBuffer());
  const sheetPath = "xl/worksheets/sheet1.xml";
  const document = new DOMParser().parseFromString(await zip.file(sheetPath).async("string"), "application/xml");
  const namespace = document.documentElement.namespaceURI;
  const columnDefinitions = document.getElementsByTagNameNS(namespace, "cols")[0];
  const hidden = document.createElementNS(namespace, "col");
  Object.entries({ min: 16, max: 16384, hidden: 1, width: 9, customWidth: 1 }).forEach(([key, value]) => hidden.setAttribute(key, value));
  columnDefinitions.appendChild(hidden);
  zip.file(sheetPath, new XMLSerializer().serializeToString(document));
  const buffer = await zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `Booking Sales Report - ${formattedDate(date.from)} to ${formattedDate(date.to)}.xlsx`,
  );
};

export default bookingSalesToExcel;
