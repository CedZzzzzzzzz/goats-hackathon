import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates an ENR number from a numeric row id.
 * Format: ENR-{YYYY}-{4-digit zero-padded sequence}
 * Example: ENR-2025-0042
 */
export function generateEnrNumber(id: number): string {
  const year = new Date().getFullYear()
  const seq  = String(id).padStart(4, "0")
  return `ENR-${year}-${seq}`
}
