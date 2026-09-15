import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0e1113", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 110, height: 110, borderRadius: 28, background: "#2dd4bf", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#0e1113" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </div>
      </div>
    ),
    size,
  );
}
