"use client";

export function NavLinks() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        height: 56,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 4,
        paddingRight: 16,
        pointerEvents: "auto",
      }}
    >
      <a
        href="https://console.limrun.com/docs/support"
        target="_blank"
        rel="noreferrer"
        className="nav-link-item"
      >
        Support
      </a>
      <a
        href="https://console.limrun.com"
        target="_blank"
        rel="noreferrer"
        className="nav-link-item nav-link-dashboard"
      >
        Dashboard
      </a>
    </div>
  );
}
