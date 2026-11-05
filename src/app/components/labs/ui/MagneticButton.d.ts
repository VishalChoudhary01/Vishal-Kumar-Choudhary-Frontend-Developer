import type {
  MouseEventHandler,
  ReactNode,
  RefObject,
} from "react";

export interface MagneticButtonProps {
  children?: ReactNode;
  /**
   * Optional larger interaction surface. When omitted, the button itself is
   * used as the magnetic field boundary.
   */
  fieldRef?: RefObject<HTMLElement | null> | null;
  /** Maximum pointer displacement in CSS pixels. Defaults to 28; clamps to 0–42. */
  strength?: number;
  /** Magnetic field radius in CSS pixels. Defaults to 180; clamps to 80–300. */
  radius?: number;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  onEngagementChange?: (engaged: boolean) => void;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
}

export declare function MagneticButton(
  props: MagneticButtonProps,
): ReactNode;

export declare const DEFAULT_MAGNETIC_RADIUS: number;
export declare const DEFAULT_MAGNETIC_STRENGTH: number;
export declare const MAX_MAGNETIC_RADIUS: number;
export declare const MAX_MAGNETIC_STRENGTH: number;
export declare const MIN_MAGNETIC_RADIUS: number;

export default MagneticButton;
