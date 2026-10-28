import { eachMonthOfInterval, endOfDay, format, isSameMonth, isSameYear, startOfDay } from "date-fns";
const packages = ["Classic Celebration Premium Catering Package for Weddings and Grand Events", "Family Favorites", "Grand Feast", "Intimate Gathering", "Custom Package", "Fiesta Buffet"];
const venues = ["Main Hall", "Garden Area", "Function Room", "Private Room", "Outdoor Pavilion", "Poolside"];
const dishes = ["Chicken Adobo", "Pork Caldereta", "Pancit Canton", "Lumpiang Shanghai", "Chicken Teriyaki", "Beef Broccoli", "Leche Flan"];
const categories = ["Main dish", "Main dish", "Noodles", "Appetizer", "Main dish", "Main dish", "Dessert"];
const customers = ["Juan Dela Cruz", "Maria Santos", "ABC Corporation", "Event Masters PH", "Pedro Reyes", "Ana Garcia", "Reyes Family", "Cruz & Co.", "Isabel Mendoza", "Luis Ramos", "Sofia Lim", "Miguel Torres"];
const weights = [0, 0, 0, 1, 1, 2, 2, 3, 4, 5];

// Local deterministic fixtures only; this preview does not request live records.
const bookings = [12, 18, 15, 22, 28, 24, 20, 26, 34, 27].flatMap((count, month) =>
  Array.from({ length: count }, (_, index) => ({
    month,
    date: new Date(2026, month, 1 + index % new Date(2026, month + 1, 0).getDate()),
    packages: packages[weights[(index + month * 3) % 10]],
    venues: venues[weights[(index * 3 + month) % 10]],
    customers: customers[(index * 5 + month * 2) % customers.length],
    value: [18500, 14500, 28000, 9500, 22000, 24000][weights[(index + month * 3) % 10]] + 4500 + index % 4 * 1250,
    dishes: dishes.filter((_, i) => (index + i + month) % (i < 2 ? 3 : 4) !== 0),
  })),
);
export const money = (value) => new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", maximumFractionDigits: 0 }).format(value);
export const compactMoney = (value) => `₱${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

export function getAnalytics(range) {
  const from = startOfDay(range.from);
  const to = endOfDay(range.to);
  const months = eachMonthOfInterval({ start: from, end: to });
  const records = bookings.filter((item) => item.date >= from && item.date <= to);
  const rank = (field) => {
    const groups = new Map();
    records.forEach((record) => {
      (field === "dishes" ? record.dishes : [record[field]]).forEach((name) => {
        const item = groups.get(name) || { name, bookings: 0, value: 0, category: categories[dishes.indexOf(name)] };
        item.bookings += 1;
        item.value += record.value;
        groups.set(name, item);
      });
    });
    return [...groups.values()].sort((a, b) => b.bookings - a.bookings || b.value - a.value).map((item) => ({ ...item, percentage: item.bookings / records.length * 100 }));
  };
  return {
    total: records.length,
    value: records.reduce((sum, item) => sum + item.value, 0),
    monthly: months.map((month) => ({ month: format(month, isSameYear(from, to) ? "MMM" : "MMM yyyy"), year: month.getFullYear(), bookings: records.filter((item) => isSameMonth(item.date, month)).length, value: records.filter((item) => isSameMonth(item.date, month)).reduce((sum, item) => sum + item.value, 0) })),
    packages: rank("packages"), venues: rank("venues"), dishes: rank("dishes"), customers: rank("customers"),
  };
}
