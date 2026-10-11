function SurfaceSVG() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* =========================
          MOBILE
          ========================= */}
            <svg
                viewBox="0 0 390 844"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full sm:hidden"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient
                        id="surfaceGradMobile"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--surface-2)"
                        />

                        <stop
                            offset="100%"
                            stopColor="var(--surface-3)"
                        />
                    </linearGradient>
                </defs>

                {/* Main surface */}
                <path
                    d="M0,0 H390 V650 C300,760 90,760 0,650 Z"
                    fill="url(#surfaceGradMobile)"
                />

                {/* Physical edge */}
                <path
                    d="M0,650 C90,760 300,760 390,650"
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    opacity="0.55"
                />

                {/* Very subtle underside */}
                <path
                    d="M0,650 C90,760 300,760 390,650"
                    fill="none"
                    stroke="var(--surface-3)"
                    strokeWidth="3"
                    opacity="0.16"
                />
            </svg>

            {/* =========================
          TABLET
          ========================= */}
            <svg
                viewBox="0 0 768 1024"
                preserveAspectRatio="none"
                className="absolute inset-0 hidden h-full w-full sm:block lg:hidden"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient
                        id="surfaceGradTablet"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--surface-2)"
                        />

                        <stop
                            offset="100%"
                            stopColor="var(--surface-3)"
                        />
                    </linearGradient>
                </defs>

                {/* Main surface */}
                <path
                    d="M0,0 H768 V690 C600,830 168,830 0,690 Z"
                    fill="url(#surfaceGradTablet)"
                />

                {/* Physical edge */}
                <path
                    d="M0,690 C168,830 600,830 768,690"
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    opacity="0.55"
                />

                {/* Very subtle underside */}
                <path
                    d="M0,690 C168,830 600,830 768,690"
                    fill="none"
                    stroke="var(--surface-3)"
                    strokeWidth="3"
                    opacity="0.16"
                />
            </svg>

            {/* =========================
          DESKTOP
          ========================= */}
            <svg
                viewBox="0 0 1440 900"
                preserveAspectRatio="none"
                className="absolute inset-0 hidden h-full w-full lg:block"
                aria-hidden="true"
            >
                <defs>
                    <linearGradient
                        id="surfaceGradDesktop"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                    >
                        <stop
                            offset="0%"
                            stopColor="var(--surface-2)"
                        />

                        <stop
                            offset="100%"
                            stopColor="var(--surface-3)"
                        />
                    </linearGradient>
                </defs>

                {/* Main surface */}
                <path
                    d="M0,0 H1440 V650 C1080,850 360,850 0,650 Z"
                    fill="url(#surfaceGradDesktop)"
                />

                {/* Physical edge */}
                <path
                    d="M0,650 C360,850 1080,850 1440,650"
                    fill="none"
                    stroke="var(--border-subtle)"
                    strokeWidth="1"
                    opacity="0.55"
                />

                {/* Very subtle underside */}
                <path
                    d="M0,650 C360,850 1080,850 1440,650"
                    fill="none"
                    stroke="var(--surface-3)"
                    strokeWidth="3"
                    opacity="0.16"
                />
            </svg>
        </div>
    );
}

export default SurfaceSVG;