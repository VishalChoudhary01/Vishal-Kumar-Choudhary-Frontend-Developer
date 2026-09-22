export const TILE_SPANS = {
    "12x1": "col-span-2 md:col-span-12",
    "12x2": "col-span-2 row-span-2 md:col-span-12 md:row-span-2",
    "8x1": "col-span-2 md:col-span-8",
    "8x2": "col-span-2 row-span-2 md:col-span-8 md:row-span-2",
    "6x1": "col-span-1 md:col-span-6",
    "6x2": "col-span-1 row-span-2 md:col-span-6 md:row-span-2",
    "4x1": "col-span-1 md:col-span-4",
    "4x2": "col-span-1 row-span-2 md:col-span-4 md:row-span-2",
};

export const LAYOUT_SHAPES = {
    feature: "8x2",
    wide: "6x1",
    tall: "4x2",
    standard: "4x1",
    full: "12x1",
};

export const MOSAIC_PLANS = {
    2: ["8x2", "4x2"],
    3: ["8x2", "4x1", "4x1"],
    4: ["8x2", "4x2", "6x1", "6x1"],
    5: ["8x2", "4x2", "4x1", "4x1", "4x1"],
    6: ["8x2", "4x2", "6x1", "6x1", "6x1", "6x1"],
    7: ["8x2", "4x2", "6x1", "6x1", "4x1", "4x1", "4x1"],
};

export function buildShowcaseLayout(items) {
    const count = items.length;
    const plan = MOSAIC_PLANS[count];

    if (plan) {
        return items.map((item, index) => ({
            ...item,
            shape:
                LAYOUT_SHAPES[item.layout] ||
                plan[index],
        }));
    }

    if (count === 1) {
        return [
            {
                ...items[0],
                shape:
                    LAYOUT_SHAPES[items[0].layout] ||
                    "12x2",
            },
        ];
    }

    return items.map((item, index) => ({
        ...item,
        shape: item.layout
            ? LAYOUT_SHAPES[item.layout]
            : index === count - 1 && count % 2 === 1
                ? "12x1"
                : "6x1",
    }));
}