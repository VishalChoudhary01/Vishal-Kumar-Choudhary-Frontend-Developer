import { ActivityIcon } from "@animateicons/react/lucide/activity-icon";
import { ChartSplineIcon } from "@animateicons/react/lucide/chart-spline-icon";
import { FolderOpenIcon } from "@animateicons/react/lucide/folder-open-icon";
import { HardDriveIcon } from "@animateicons/react/lucide/hard-drive-icon";

export const LABS_WORKSPACE_DESTINATIONS = [
  {
    href: "/admin/labs/analytics",
    id: "analytics",
    label: "Labs analytics",
    description: "Experiment engagement and activity",
    icon: ChartSplineIcon,
  },
  {
    href: "/admin/portfolio/analytics",
    id: "portfolio-analytics",
    label: "Portfolio analytics",
    description: "Public portfolio visits and traffic",
    icon: ActivityIcon,
  },
  {
    href: "/admin/labs/sources",
    id: "sources",
    label: "Source Library",
    description: "Manage source files and published versions",
    icon: FolderOpenIcon,
  },
  {
    href: "/admin/labs/sources/snapshots",
    id: "snapshots",
    label: "Snapshot storage",
    description: "Monitor and clean up Vercel Sandbox snapshots",
    icon: HardDriveIcon,
  },
];
