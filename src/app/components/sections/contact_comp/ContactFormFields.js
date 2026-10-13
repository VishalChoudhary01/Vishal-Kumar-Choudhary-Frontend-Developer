"use client";

import ContactField from "./contact_form/ContactField";
import ContactProjectType from "./contact_form/ContactProjectType";
import ContactRevealRow from "./ContactRevealRow";
import ContactMessageCounter from "./ContactMessageCounter";
import ActionButton from "../../common/buttons/ActionButton";
import { Send } from "lucide-react";

import { CONTACT_STAGGER } from "./contact.motion";
import { MESSAGE_MAX_LENGTH } from "./contactForm.validation";

export default function ContactFormFields({
    active,
    values,
    errors,
    isSubmitting,
    isValid,
    submitError,
    onChange,
    onBlur,
    onProjectTypeChange,
}) {
    return (
        <>
            <ContactRevealRow active={active} delay={CONTACT_STAGGER.name}>
                <div className="grid gap-6 md:grid-cols-2 md:gap-8">
                    <ContactField
                        id="name"
                        name="name"
                        label="Your name"
                        value={values.name}
                        onChange={onChange("name")}
                        onBlur={onBlur("name")}
                        error={errors.name}
                        required
                        disabled={isSubmitting}
                        autoComplete="name"
                        placeholder="Tell me your name"
                        maxLength={80}
                        description="How should I address you?"
                    />

                    <ContactField
                        id="email"
                        name="email"
                        label="Email address"
                        type="email"
                        value={values.email}
                        onChange={onChange("email")}
                        onBlur={onBlur("email")}
                        error={errors.email}
                        required
                        disabled={isSubmitting}
                        autoComplete="email"
                        placeholder="you@example.com"
                        maxLength={120}
                        description="Where should I reply?"
                    />
                </div>
            </ContactRevealRow>

            <ContactRevealRow active={active} delay={CONTACT_STAGGER.projectType} className="mt-10 sm:mt-12">
                <ContactProjectType
                    name="projectType"
                    id="projectType"
                    label="What are you building?"
                    value={values.projectType}
                    onChange={onProjectTypeChange}
                    error={errors.projectType}
                    required
                    disabled={isSubmitting}
                />
            </ContactRevealRow>

            <ContactRevealRow active={active} delay={CONTACT_STAGGER.message} className="mt-10 sm:mt-12">
                <ContactField
                    id="message"
                    name="message"
                    label="Message"
                    as="textarea"
                    value={values.message}
                    onChange={onChange("message")}
                    onBlur={onBlur("message")}
                    error={errors.message}
                    required
                    disabled={isSubmitting}
                    placeholder="Tell me a little about the project…"
                    maxLength={MESSAGE_MAX_LENGTH}
                    rows={5}
                    minHeight="180px"
                />

                <ContactMessageCounter
                    value={values.message}
                    maxLength={MESSAGE_MAX_LENGTH}
                />
            </ContactRevealRow>

            <ContactRevealRow active={active} delay={CONTACT_STAGGER.submit} className="mt-10 sm:mt-12 "> 
                <ActionButton
                    type="submit"
                    label="Send Message"
                    submittingLabel="Sending…"
                    successLabel="Message sent ✓"
                    status={isSubmitting ? "submitting" : "idle"}
                    disabled={!isValid}
                    icon={<Send size={18} strokeWidth={1.8} />}
                    iconPosition="right"
                    iconSize={16}
                    ripple
                    rippleClassName="bg-foreground"
                    width="sm:w-[180px]"
                    height="h-[50px]"
                />
            </ContactRevealRow>

            {submitError && (
                <ContactRevealRow active={active} delay={0} className="mt-4">
                    <p className="max-w-[36ch] font-body text-xs text-error" role="alert">
                        {submitError}
                    </p>
                </ContactRevealRow>
            )}
        </>
    );
}