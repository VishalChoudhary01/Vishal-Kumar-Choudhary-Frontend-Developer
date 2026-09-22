"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";

import useReducedMotion from "@/app/hooks/useReducedMotion";
import SuccessModal from "@/app/components/ui/SuccessModal";
import ContactFormFields from "./ContactFormFields";
import { cn } from "@/app/lib/utils";
import { EASE_STANDARD } from "./contact.motion";
import { submitContactForm } from "./contactForm.api";
import {
    INITIAL_FORM_ERRORS,
    INITIAL_FORM_VALUES,
    isFormValid,
    validateField,
    validateForm,
    hasValidationErrors,
} from "./contactForm.validation";

export default function ContactForm({ className = "" }) {
    const reduced = useReducedMotion();
    const formRef = useRef(null);

    const entered = useInView(formRef, {
        once: true,
        margin: "-60px 0px",
    });

    const active = reduced || entered;

    const [values, setValues] = useState(INITIAL_FORM_VALUES);
    const [errors, setErrors] = useState(INITIAL_FORM_ERRORS);
    const [status, setStatus] = useState("idle");
    const [submitError, setSubmitError] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    const setFieldValue = useCallback((name, value) => {
        setValues((previous) => ({
            ...previous,
            [name]: value,
        }));
    }, []);

    const handleChange = useCallback(
        (name) => (event) => {
            setFieldValue(name, event.target.value);
        },
        [setFieldValue],
    );

    const handleBlur = useCallback((name) => (event) => {
        const error = validateField(name, event.target.value);

        setErrors((previous) => ({
            ...previous,
            [name]: error,
        }));
    }, []);

    const handleProjectTypeChange = useCallback(
        (value) => {
            setFieldValue("projectType", value);

            setErrors((previous) => ({
                ...previous,
                projectType: "",
            }));
        },
        [setFieldValue],
    );

    const validateAll = useCallback(() => {
        const newErrors = validateForm(values);

        setErrors(newErrors);

        const hasErrors = hasValidationErrors(newErrors);

        if (hasErrors && typeof document !== "undefined") {
            const firstInvalidName = Object.entries(newErrors).find(([, error]) => error)?.[0];

            const firstInvalid = firstInvalidName
                ? document.getElementsByName(firstInvalidName)[0]
                : null;

            firstInvalid?.focus();
        }

        return !hasErrors;
    }, [values]);

    const isValid = isFormValid(values, errors);
    const isSubmitting = status === "submitting";

    const handleSubmit = useCallback(
        async (event) => {
            event.preventDefault();

            if (!validateAll()) {
                return;
            }

            setStatus("submitting");
            setSubmitError("");

            try {
                await submitContactForm({
                    name: values.name.trim(),
                    email: values.email.trim(),
                    projectType: values.projectType,
                    message: values.message.trim(),
                });

                setStatus("success");
                setModalOpen(true);
            } catch (error) {
                setStatus("error");
                setSubmitError(error?.message || "Unable to send right now. Please try again.");
            }
        },
        [values, validateAll],
    );

    const handleReset = useCallback(() => {
        setValues(INITIAL_FORM_VALUES);
        setErrors(INITIAL_FORM_ERRORS);
        setSubmitError("");
        setModalOpen(false);
        setStatus("idle");
    }, []);

    return (
        <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className={cn("relative w-full", className)}
            aria-label="Contact form"
        >
            <AnimatePresence mode="wait" initial={false}>
                {status !== "success" && (
                    <motion.div
                        key="fields"
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.3, ease: EASE_STANDARD }}
                    >
                        <ContactFormFields
                            active={active}
                            values={values}
                            errors={errors}
                            status={status}
                            isValid={isValid}
                            isSubmitting={isSubmitting}
                            submitError={submitError}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            onProjectTypeChange={handleProjectTypeChange}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <SuccessModal
                open={modalOpen}
                onClose={handleReset}
                title="Message received"
                message="Thanks for reaching out. I'll get back to you soon."
                ctaLabel="Send another message"
            />
        </form>
    );
}