export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const REQUIRED_ERROR = "This field is required";

export const NAME_MIN_LENGTH = 2;
export const MESSAGE_MIN_LENGTH = 10;
export const MESSAGE_MAX_LENGTH = 1200;

export const INITIAL_FORM_VALUES = {
    name: "",
    email: "",
    projectType: "",
    message: "",
};

export const INITIAL_FORM_ERRORS = {
    name: "",
    email: "",
    projectType: "",
    message: "",
};

export function validateField(name, value) {
    const normalizedValue = String(value || "").trim();

    switch (name) {
        case "name":
            if (!normalizedValue) {
                return REQUIRED_ERROR;
            }

            if (normalizedValue.length < NAME_MIN_LENGTH) {
                return `Name must be at least ${NAME_MIN_LENGTH} characters`;
            }

            return "";

        case "email":
            if (!normalizedValue) {
                return REQUIRED_ERROR;
            }

            if (!EMAIL_REGEX.test(normalizedValue)) {
                return "Please enter a valid email address";
            }

            return "";

        case "projectType":
            if (!normalizedValue) {
                return REQUIRED_ERROR;
            }

            return "";

        case "message":
            if (!normalizedValue) {
                return REQUIRED_ERROR;
            }

            if (normalizedValue.length < MESSAGE_MIN_LENGTH) {
                return `Message must be at least ${MESSAGE_MIN_LENGTH} characters`;
            }

            if (normalizedValue.length > MESSAGE_MAX_LENGTH) {
                return `Message must be under ${MESSAGE_MAX_LENGTH} characters`;
            }

            return "";

        default:
            return "";
    }
}

export function validateForm(values) {
    return {
        name: validateField("name", values.name),
        email: validateField("email", values.email),
        projectType: validateField("projectType", values.projectType),
        message: validateField("message", values.message),
    };
}

export function hasValidationErrors(errors) {
    return Object.values(errors).some(Boolean);
}

export function isFormValid(values, errors) {
    return (
        values.name.trim().length >= NAME_MIN_LENGTH &&
        EMAIL_REGEX.test(values.email.trim()) &&
        Boolean(values.projectType) &&
        values.message.trim().length >= MESSAGE_MIN_LENGTH &&
        values.message.trim().length <= MESSAGE_MAX_LENGTH &&
        Object.values(errors).every((error) => !error)
    );
}