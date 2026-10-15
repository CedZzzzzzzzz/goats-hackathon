import { describe, it, expect } from "vitest"
import { generateEnrNumber } from "@/lib/utils"

describe("generateEnrNumber", () => {
  const year = new Date().getFullYear()

  it("pads id=1 to 4 digits", () => {
    expect(generateEnrNumber(1)).toBe(`ENR-${year}-0001`)
  })

  it("pads id=42 to 4 digits", () => {
    expect(generateEnrNumber(42)).toBe(`ENR-${year}-0042`)
  })

  it("pads id=9999 to 4 digits", () => {
    expect(generateEnrNumber(9999)).toBe(`ENR-${year}-9999`)
  })

  it("does not truncate ids above 9999", () => {
    expect(generateEnrNumber(10000)).toBe(`ENR-${year}-10000`)
  })
})
