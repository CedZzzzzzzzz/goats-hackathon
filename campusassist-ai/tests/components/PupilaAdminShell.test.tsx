/**
 * PupilaAdminShell — layout and navigation tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { PupilaAdminShell } from "@/components/PupilaAdminShell"

// ── Mocks ─────────────────────────────────────────────────────────────

const mockUsePathname = vi.fn(() => "/admin")

vi.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}))

vi.mock("@/components/ChatWindow", () => ({
  ChatWindow: () => <div data-testid="chat-window">Chat</div>,
}))

vi.mock("@/components/RoleToggle", () => ({
  RoleToggle:   () => <button data-testid="role-toggle">Toggle Role</button>,
  RoleProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useRole:      () => ({ isStaff: true, toggleRole: vi.fn() }),
}))

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string
    children: React.ReactNode
    [k: string]: unknown
  }) => <a href={href} {...props}>{children}</a>,
}))

// ── Helpers ───────────────────────────────────────────────────────────

function renderShell(
  children: React.ReactNode = <div data-testid="page-content">Page content</div>
) {
  return render(<PupilaAdminShell>{children}</PupilaAdminShell>)
}

// ── Tests ─────────────────────────────────────────────────────────────

describe("PupilaAdminShell — /admin", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin")
  })

  it("renders PUPILA wordmark in the header", () => {
    renderShell()
    expect(screen.getByText("PUPILA")).toBeInTheDocument()
  })

  it("renders at least two nav links pointing to /admin", () => {
    renderShell()
    const links = screen.getAllByRole("link")
    const adminLinks = links.filter(l => l.getAttribute("href") === "/admin")
    expect(adminLinks.length).toBeGreaterThanOrEqual(2)
  })

  it("renders the RoleToggle in the header", () => {
    renderShell()
    expect(screen.getByTestId("role-toggle")).toBeInTheDocument()
  })

  it("renders page children inside the content area", () => {
    renderShell()
    expect(screen.getByTestId("page-content")).toBeInTheDocument()
  })

  it("renders the AI chat window panel on /admin", () => {
    renderShell()
    expect(screen.getByTestId("chat-window")).toBeInTheDocument()
  })

  it("renders PUPILA AI Assistant label in the AI panel", () => {
    renderShell()
    expect(screen.getByText("PUPILA AI Assistant")).toBeInTheDocument()
  })

  it("renders Online badge in the AI panel", () => {
    renderShell()
    expect(screen.getByText("Online")).toBeInTheDocument()
  })

  it("renders the semester context in the sidebar", () => {
    renderShell()
    expect(screen.getByText(/1ST SEMESTER/i)).toBeInTheDocument()
  })

  it("renders Enrollment Portal footer in the sidebar", () => {
    renderShell()
    expect(screen.getByText("Enrollment Portal")).toBeInTheDocument()
  })

  it("renders a hamburger toggle button for mobile", () => {
    renderShell()
    expect(screen.getByLabelText("Toggle navigation")).toBeInTheDocument()
  })

  it("toggles the sidebar on hamburger click without crashing", () => {
    renderShell()
    const hamburger = screen.getByLabelText("Toggle navigation")
    fireEvent.click(hamburger)
    expect(screen.getByLabelText("Toggle navigation")).toBeInTheDocument()
  })

  it("does NOT render a Reports nav link on /admin", () => {
    renderShell()
    expect(screen.queryByText("Reports")).not.toBeInTheDocument()
  })

  it("renders Powered by CampusAssist disclaimer in AI panel", () => {
    renderShell()
    expect(screen.getByText("Powered by CampusAssist")).toBeInTheDocument()
  })
})

describe("PupilaAdminShell — /admin/reports", () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/admin/reports")
  })

  it("does NOT render the AI chat panel on /admin/reports", () => {
    renderShell(<div>Reports page</div>)
    expect(screen.queryByTestId("chat-window")).not.toBeInTheDocument()
  })

  it("renders a Reports nav link when on /admin/reports", () => {
    renderShell(<div>Reports page</div>)
    expect(screen.getByText("Reports")).toBeInTheDocument()
  })
})
