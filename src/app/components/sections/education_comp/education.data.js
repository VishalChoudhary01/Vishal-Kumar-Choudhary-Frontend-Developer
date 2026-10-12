import { portfolio } from "@/app/data/portfolio";

const records = portfolio.education.map(
  (item, index) => ({
    ...item,
    record: String(index + 1).padStart(2, "0"),
    total: portfolio.education.length,
  })
);

const years = records
  .map((record) => Number(record.year))
  .filter((year) => !Number.isNaN(year))
  .sort((a, b) => a - b);

export const educationData = {
  records,
  total: records.length,
  totalLabel: String(records.length).padStart(2, "0"),
  period: {
    start: years[0] ?? null,
    end: years[years.length - 1] ?? null,
  },
  eyebrow: "EDUCATION",
  heading: "Where I built the foundation.",
};