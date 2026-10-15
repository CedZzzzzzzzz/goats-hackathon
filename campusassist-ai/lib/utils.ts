import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates an enrollment number from a numeric row id and student type.
 * Format: ENR-{5-digit zero-padded sequence}-MN-{type}
 *   type: 0 = regular, 1 = irregular
 * Example: ENR-00042-MN-0  (regular)
 *          ENR-00042-MN-1  (irregular)
 */
export function generateEnrNumber(id: number, studentType: "regular" | "irregular"): string {
  const seq  = String(id).padStart(5, "0")
  const flag = studentType === "regular" ? "0" : "1"
  return `ENR-${seq}-MN-${flag}`
}
