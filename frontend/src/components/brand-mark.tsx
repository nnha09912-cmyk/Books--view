import Image from "next/image";

export function BrandMark({ size = 36 }: { size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="Books View"
      width={size}
      height={size}
      style={{ width: size, height: size, borderRadius: "28%" }}
      priority
    />
  );
}
