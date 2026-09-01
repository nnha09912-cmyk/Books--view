import Image from "next/image";
import { picsum } from "@/lib/mock-data";

interface AuthShellProps {
  imageSeed: string;
  quoteTitle: string;
  /** Second line under the quote — a supporting sentence, not the
   * attribution (that's quoteMeta). Optional: most auth pages only need
   * the one quote line. */
  quoteSubtitle?: string;
  /** Studio's own byline (name | location) — sits between quoteSubtitle
   * and quoteMeta, distinct from quoteMeta's "gift from" dedication. */
  quoteSignature?: string;
  quoteMeta?: string;
  children: React.ReactNode;
}

export function AuthShell({
  imageSeed,
  quoteTitle,
  quoteSubtitle,
  quoteSignature,
  quoteMeta,
  children,
}: AuthShellProps) {
  return (
    <div className="auth-shell">
      <div className="auth-visual">
        <Image
          src={picsum(imageSeed, 1200, 1600)}
          alt=""
          fill
          unoptimized
          style={{ objectFit: "cover", opacity: 0.55 }}
        />
        <div className="quote">
          <h2>{quoteTitle}</h2>
          {quoteSubtitle && (
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,.85)", marginTop: 14 }}
            >
              {quoteSubtitle}
            </p>
          )}
          {quoteSignature && (
            <p
              className="text-sm"
              style={{
                color: "rgba(255,255,255,.85)",
                fontWeight: 600,
                marginTop: quoteSubtitle ? 16 : 10,
              }}
            >
              {quoteSignature}
            </p>
          )}
          {quoteMeta && (
            <p
              className="text-sm"
              style={{ color: "rgba(255,255,255,.7)", marginTop: 10 }}
            >
              {quoteMeta}
            </p>
          )}
        </div>
      </div>
      <div className="auth-form-side">
        <div className="auth-box">{children}</div>
      </div>
    </div>
  );
}
