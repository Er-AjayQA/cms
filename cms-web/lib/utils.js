import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatAmount(value, options = {}) {
  const { decimalPlaces = 2, fallback = "" } = options;

  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const amount = Number(String(value).replace(/,/g, "").trim());

  if (!Number.isFinite(amount)) {
    return fallback;
  }

  return amount.toFixed(decimalPlaces);
}

export function getApiErrorMessage(error, fallback = "Something went wrong") {
  const responseData = error?.response?.data;

  if (responseData?.message) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors
      .map((item) => item?.message || item)
      .filter(Boolean)
      .join(", ");
  }

  return error?.message || fallback;
}
