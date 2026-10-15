export { cn } from "cn"

export function generateEnrNumber(id: number): string {
  const year = new Date().getFullYear()
  const seq  = String(id).padStart(4, "0")
  return `ENR-${year}-${seq}`
}
