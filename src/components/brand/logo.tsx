export function LogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center bg-primary text-sm font-bold text-primary-foreground">
      E
    </div>
  );
}

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <LogoMark />
      <div className="leading-tight">
        <p className="text-sm font-bold text-foreground">Eclesio</p>
        <p className="text-xs text-muted">Gestao de igrejas</p>
      </div>
    </div>
  );
}