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
const currencyFormat = '"₱"#,##0.00';

const addBanner = async (workbook, worksheet) => {
  try {
    const response = await fetch(banner);
    if (!response.ok) throw new Error("Unable to load report banner");
    const buffer = await response.arrayBuffer();
    const imageId = workbook.addImage({ buffer, extension: "png" });
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 0.05 },
      br: { col: 12, row: 4 },
    });
  } catch (error) {
    console.error("Failed to add booking transactions report banner:", error);
  }
};

const bookingTransactionsToExcel = async ({
  array = [],
  options = {},
} = {}) => {
  if (!array.some((group) => group.items?.length)) return;

  const { date, frequency = "daily", createdBy = "" } = options;
  if (!isValid(date?.from) || !isValid(date?.to) || date.from > date.to) {
    throw new Error("Please select a valid report period.");
  }

  const payments = array.flatMap((group) => group.items || []);
  const reportTitle = `${frequency.charAt(0).toUpperCase()}${frequency.slice(1)} Booking Transactions Report`;
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Booking Transactions", {
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
    },
  });
  worksheet.views = [{ showGridLines: false }];
  await addBanner(workbook, worksheet);

  // Align the report header with the table's last column (L).
  worksheet.mergeCells("A5:L5");
  const title = worksheet.getCell("A5");
  title.value = reportTitle;
  title.font = { bold: true, size: 25 };
  title.border = border;
  title.alignment = { horizontal: "center", vertical: "middle" };

  worksheet.mergeCells("A6:L6");
  const subtitle = worksheet.getCell("A6");
  subtitle.value = `${formattedDate(date.from)} to ${formattedDate(date.to)}`;
  subtitle.font = { size: 14 };
  subtitle.border = border;
  subtitle.alignment = { horizontal: "center", vertical: "middle" };
  worksheet.getRow(5).height = 40;
  worksheet.getRow(6).height = 24;

  const collected = payments.reduce(
    (sum, payment) =>
      sum +
      (payment.transactionType !== "refund" && payment.status === "verified"
        ? Number(payment.amount ?? 0)
        : 0),
    0,
  );
  const refunded = payments.reduce(
    (sum, payment) =>
      sum +
      (payment.transactionType === "refund" && payment.status === "completed"
        ? Number(payment.amount ?? 0)
        : 0),
    0,
  );
  [
    ["A7:D7", "Collected", collected],
    ["E7:H7", "Refunds", refunded],
    ["I7:L7", "Net", collected - refunded],
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
  worksheet.getRow(7).height = 30;

  const columns = [
    { start: "A", end: "C", label: "Booking / Customer" },
    { start: "D", end: "F", label: "Transaction Type" },
    { start: "G", end: "H", label: "Method" },
    { start: "I", end: "J", label: "Status" },
    { start: "K", end: "L", label: "Amount", numeric: true },
  ];
  let rowNumber = 8;

  const addTableHeader = () => {
    columns.forEach(({ start, end, label }) => {
      worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
      const cell = worksheet.getCell(`${start}${rowNumber}`);
      cell.value = label;
      cell.font = { size: 13, bold: true };
      cell.alignment = {
        horizontal: "left",
        vertical: "middle",
        wrapText: true,
      };
      cell.border = border;
    });
    worksheet.getRow(rowNumber).height = 32;
    rowNumber++;
  };

  const addPayment = (payment) => {
    const customerName = payment.booking?.customer?.fullName;
    const nameLabel = (name) =>
      name ? (typeof name === "string" ? name : fullName(name)) : "Unavailable";
    const isRefund = payment.transactionType === "refund";
    const amount = Number(payment.amount ?? 0);
    const amountFormat = isRefund && payment.status === "completed"
      ? '"- ₱"#,##0.00;"- ₱"#,##0.00;"- ₱"0.00'
      : !isRefund && payment.status === "verified"
        ? '"+ ₱"#,##0.00;"- ₱"#,##0.00;"+ ₱"0.00'
        : currencyFormat;
    const values = [
      `${payment.booking?.reference || "Unavailable"}\n${nameLabel(customerName)}`,
      isRefund ? "Refund" : "Payment",
      payment.method?.name || "Unavailable",
      String(payment.status || "Unknown").replace(/^./, (letter) =>
        letter.toUpperCase(),
      ),
      isRefund && payment.status === "completed" ? -amount : amount,
    ];
    let maxLines = 1;
    values.forEach((value, columnIndex) => {
      const { start, end, numeric } = columns[columnIndex];
      worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
      const cell = worksheet.getCell(`${start}${rowNumber}`);
      if (columnIndex === 0) {
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
      if (numeric) cell.numFmt = amountFormat;
      const charsPerLine = (end.charCodeAt(0) - start.charCodeAt(0) + 1) * 8;
      const lines = (numeric ? format.peso(value) : String(value))
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
  };

  array.forEach((group) => {
    if (!group.items?.length) return;
    const total = group.items.reduce((sum, payment) => {
      const amount = Number(payment.amount ?? 0);
      return sum + (payment.transactionType === "refund" && payment.status === "completed" ? -amount : amount);
    }, 0);
    [
      ["A", "H", group.label || "Unknown date"],
      ["I", "L", total],
    ].forEach(([start, end, value]) => {
      worksheet.mergeCells(`${start}${rowNumber}:${end}${rowNumber}`);
      const cell = worksheet.getCell(`${start}${rowNumber}`);
      cell.value = value;
      cell.font = { size: 13, bold: true, color: { argb: "FFFFFDF8" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC62828" } };
      cell.border = border;
      cell.alignment = { horizontal: start === "I" ? "right" : "left", vertical: "middle", wrapText: true };
      if (start === "I") cell.numFmt = currencyFormat;
    });
    const lines = Math.max(1, Math.ceil(String(group.label || "Unknown date").length / 48));
    worksheet.getRow(rowNumber++).height = Math.max(24, lines * 18 + 4);
    addTableHeader();
    group.items.forEach(addPayment);
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
    worksheet.mergeCells(`A${position}:L${position}`);
    const cell = worksheet.getCell(`A${position}`);
    cell.value = {
      richText: [
        { text: label, font: { bold: true, size: 13 } },
        { text: value, font: { size: 13 } },
      ],
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });

  worksheet.pageSetup.printArea = `A1:L${footerRow + 1}`;

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${reportTitle} - ${formattedDate(date.from)} to ${formattedDate(date.to)}.xlsx`,
  );
};

export default bookingTransactionsToExcel;
