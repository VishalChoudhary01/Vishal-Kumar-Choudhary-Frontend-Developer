"use client";
import {
  FaChartLine,
  FaClock,
  FaMobile,
  FaLayerGroup,
  FaCog,
} from "react-icons/fa";

// Helper functions for stats processing
export const extractNumericValue = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const match = value.match(/(\d+(\.\d+)?)/);
    return match ? parseFloat(match[1]) : 0;
  }
  return 0;
};

export const extractUnit = (value) => {
  if (typeof value === "string") {
    const match = value.match(/[^\d\.]+/);
    return match ? match[0].trim() : "";
  }
  return "";
};

export const parseDevelopmentTime = (value) => {
  const numericValue = extractNumericValue(value);
  let unit = extractUnit(value);

  if (unit.toLowerCase().includes("day")) unit = "Days";
  else if (unit.toLowerCase().includes("month")) unit = "Months";
  else if (unit.toLowerCase().includes("year")) unit = "Years";
  else if (unit && numericValue > 1) unit = " " + unit;

  return { numericValue, unit };
};

export const parseComponents = (value) => {
  let numericValue = extractNumericValue(value);
  let unit = "";

  if (typeof value === "string") {
    unit = value.includes("+") ? "+" : "+";
  } else if (typeof value === "number") {
    unit = "+";
  }

  return { numericValue, unit };
};

export const getStatIcon = (key) => {
  switch (key.toLowerCase()) {
    case "developmenttime":
      return <FaClock  className="text-grad-primary dark:text-darkgrad-primary"  />;
    case "pages":
      return <FaLayerGroup  className="text-grad-primary dark:text-darkgrad-primary" />;
    case "components":
      return <FaCog  className="text-grad-primary dark:text-darkgrad-primary" />;
    case "responsivebreakpoints":
      return <FaMobile className="text-grad-primary dark:text-darkgrad-primary"  />;
    default:
      return <FaChartLine  className="text-grad-primary dark:text-darkgrad-primary" />;
  }
};

export const formatKey = (key) => {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/lighthouse/gi, "")
    .trim()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};