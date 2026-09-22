"use client";

import { createElement, isValidElement } from "react";

export default function DownloadButtonIcon({
    icon,
    size = 18,
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