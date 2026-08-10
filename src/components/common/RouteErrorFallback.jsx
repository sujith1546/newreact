import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RouteErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          width: "100%",
          padding: "32px 24px",
          borderRadius: "16px",
          background: "var(--bg-secondary, #18191d)",
          border: "1px solid var(--border-color, rgba(255, 255, 255, 0.12))",
          boxShadow: "0 16px 40px rgba(0,0,0,0.3)",
          textAlign: "center",
          color: "var(--text-primary, #ffffff)",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            background: "rgba(239, 68, 68, 0.15)",
            color: "#ef4444",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <AlertTriangle size={24} />
        </div>

        <h3
          style={{
            fontSize: "20px",
            fontWeight: "700",
            margin: "0 0 8px",
            letterSpacing: "-0.01em",
          }}
        >
          Something went wrong
        </h3>

        <p
          style={{
            fontSize: "13px",
            color: "var(--text-muted, #94a3b8)",
            margin: "0 0 20px",
            lineHeight: 1.5,
          }}
        >
          {error?.message || "An unexpected rendering error occurred in this component section."}
        </p>

        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          {resetErrorBoundary && (
            <button
              type="button"
              onClick={resetErrorBoundary}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 16px",
                borderRadius: "8px",
                background: "var(--primary-blue, #3b82f6)",
                color: "#ffffff",
                border: "none",
                fontSize: "12.5px",
                fontWeight: "600",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              }}
            >
              <RefreshCw size={14} />
              <span>Try Again</span>
            </button>
          )}

          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "8px",
              background: "var(--bg-primary, #22242a)",
              color: "var(--text-primary, #ffffff)",
              border: "1px solid var(--border-color, rgba(255, 255, 255, 0.12))",
              fontSize: "12.5px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <Home size={14} />
            <span>Go Home</span>
          </a>
        </div>
      </div>
    </div>
  );
}
