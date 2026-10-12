"use client";

import EducationHeader from "./EducationHeader";
import EducationCard from "./EducationCard";
import { EducationHandoffLine } from "./EducationHandoff";
import { educationData } from "./education.data";

export default function EducationStatic() {
    const { records } = educationData;

    return (
        <section
            id="education"
            aria-labelledby="education-heading"
            className="relative bg-background pb-24 sm:pb-32 md:pb-40"
        >
            <EducationHeader headingId="education-heading" />

            <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 md:px-10">
                <ol
                    aria-label="Academic archive"
                    className="grid list-none grid-cols-1 gap-7 md:grid-cols-2 lg:gap-8"
                >
                    {records.map((item) => (
                        <li key={item.id}>
                            <EducationCard item={item} />
                        </li>
                    ))}
                </ol>

                <div className="mt-16 flex justify-center md:mt-20">
                    <EducationHandoffLine />
                </div>
            </div>
        </section>
    );
}