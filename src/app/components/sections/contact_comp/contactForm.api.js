const DEFAULT_ERROR = "Unable to send right now. Please try again.";

export async function submitContactForm(data) {
    const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const message = (result.errors && Object.values(result.errors).find(Boolean)) || result.error || DEFAULT_ERROR;

        throw new Error(message);
    }

    return result;
}