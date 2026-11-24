import Image from "next/image";

export function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      width={2146}
      height={733}
      alt="Aayojan AI CRM"
      priority
      className={`h-auto w-full bg-black object-contain ${className}`}
    />
  );
}
