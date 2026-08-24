import Image from "next/image";
import { picsum } from "@/lib/mock-data";

interface AuthShellProps {
  imageSeed: string;
  quoteTitle: string;
  quoteMeta?: string;
  children: React.ReactNode;
}

export function AuthShell({
  imageSeed,
  quoteTitle,
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
