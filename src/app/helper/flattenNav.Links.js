export const flattenNavLinks = (links) =>
    links.flatMap((link) => [
        {
            href: link.href,
            activeHref: link.href,
        },
        ...(link.children ?? []).map((child) => ({
            href: child.href,
            activeHref: link.href,
        })),
    ]);

    