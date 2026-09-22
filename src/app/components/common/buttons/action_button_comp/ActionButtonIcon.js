"use client";

import { createElement, isValidElement } from "react";

export default function ActionButtonIcon({
    icon,
    size = 16,
}) {
    if (!icon) {
        return null;
    }

    if (isValidElement(icon)) {
        return icon;
    }

    return createElement(icon, {
        size,
    });
}