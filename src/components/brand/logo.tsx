import Image from "next/image";

interface ThemeLogoImageProps {
  className?: string;
}

function ThemeLogoImage({ className = "h-12 w-12" }: ThemeLogoImageProps) {
  return (
    <>
      <Image
        src="/logo_eclesio_tema_light.png"
        alt="Logo Eclesio"
        width={512}
        height={512}
        sizes="48px"
        className={`${className} object-contain dark:hidden`}
        priority
      />
      <Image
        src="/logo_eclesio_tema_dark.png"
        alt="Logo Eclesio"
        width={512}
        height={512}
        sizes="48px"
        className={`${className} hidden object-contain dark:block`}
        priority
      />
    </>
  );
}

export function LogoMark() {
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center">
      <ThemeLogoImage />
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Eclesio</p>
        <p className="text-xs text-muted">Gestão de igrejas</p>
      </div>
    </div>
  );
}