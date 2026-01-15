"use client";
import { DigitSlideCounter } from "@/app/components/atoms/animation/index";
import {extractNumericValue,extractUnit,formatKey,getStatIcon,parseComponents,parseDevelopmentTime} from '@/app/lib/utils/performanceStatsConversion'


export default function StatItem({ statKey, value }) {
  const keyLower = statKey.toLowerCase();
  let numericValue;
  let unit = "";
  let useDigitCounter = false;

  if (keyLower === "developmenttime") {
    const parsed = parseDevelopmentTime(value);
    numericValue = parsed.numericValue;
    unit = parsed.unit;
    useDigitCounter = numericValue > 0;
  } else if (keyLower === "components") {
    const parsed = parseComponents(value);
    numericValue = parsed.numericValue;
    unit = parsed.unit;
    useDigitCounter = numericValue > 0;
  } else if (keyLower === "pages") {
    numericValue = extractNumericValue(value);
    unit = extractUnit(value);
    useDigitCounter = numericValue > 0;
  } else {
    numericValue = extractNumericValue(value);
    unit = extractUnit(value);
    useDigitCounter =
      (numericValue > 0 && typeof value !== "string") ||
      (typeof value === "string" && /^\d+/.test(value));
  }

  return (
    <div
      className="md:p-3 sm:p-4 px-2 flex justify-between border border-grad-primary/10 dark:border-darkgrad-primary/10  h-14 md:h-16   bg-linear-to-r from-grad-primary/10  to-grad-primary/5 dark:from-darkgrad-primary/10 dark:to-darkgrad-primary/5 md:block pt-1.5 rounded-lg group hover:scale-[1.02] transition-transform">
      <div className="flex items-center  gap-1.5 md:gap-2  ">
        {getStatIcon(statKey)}
        <p className="md:text-xs text-[0.8rem] sm:text-sm  font-medium text-h1 dark:text-Head3dark font-open-sans text-nowrap">
          {formatKey(statKey)}
        </p>
      </div>
      <div className="flex md:items-baseline items-center   md:pl-8 pl-5">
        {useDigitCounter ? (
          <div className="flex  items-baseline  ">
            <DigitSlideCounter
              value={numericValue}
              duration={1500}
              className={`text-2xl sm:text-3xl font-semibold font-roboto text-grad-primary dark:text-darkgrad-primary ${numericValue?'md:mt-2  ':''} `}
            />
            {unit && (
              <span
                className={`ml-1 text-grad-primary dark:text-darkgrad-primary   ${
                  keyLower === "components"
                    ? "md:text-lg text-[1.1rem]   sm:text-2xl "
                    : "md:text-lg text-[0.85rem]   font-open-sans sm:text-xl"
                } font-semibold `}
              >
                {unit}
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-baseline">
            <span
              className="text-2xl sm:text-3xl text-grad-primary dark:text-darkgrad-primary    font-bold"
            >
              {value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}