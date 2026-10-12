export default function SectionNumber({
    number = "01",
    align = "left",
}) {
    const position =
        align === "center"
            ? "left-1/2 -translate-x-1/2"
            : "left-[-2%] md:left-[-10%]";

    return (
        <span
            aria-hidden="true"
            className={` pointer-events-none absolute z-0 whitespace-nowrap font-display font-normal text-brand opacity-[0.08] dark:opacity-[0.10] ${position} -top-[0.25em] text-[clamp(2rem,7vw,3rem)] leading-none `} >
            {number}
        </span>
    );
}