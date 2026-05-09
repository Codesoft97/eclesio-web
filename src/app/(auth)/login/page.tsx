import Link from "next/link";

import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Acesso
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Entrar no Eclesio</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Use o email do representante para acessar a area administrativa.
        </p>
      </div>
      <LoginForm />
      <p className="mt-6 text-sm text-muted">
        Ainda não cadastrou sua igreja?{" "}
        <Link href="/cadastro" className="font-semibold text-foreground underline decoration-accent underline-offset-4">
          Criar cadastro
        </Link>
      </p>
    </div>
  );
}