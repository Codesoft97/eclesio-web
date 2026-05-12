import Link from "next/link";

import { PasswordRecoveryForm } from "@/features/auth/components/password-recovery-form";

export default function PasswordRecoveryPage() {
  return (
    <div className="w-full max-w-md animate-slide-up">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Recuperação de acesso
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">
          Redefinir senha
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Informe o email cadastrado, valide o código recebido e escolha uma
          nova senha para acessar o Gerencia Igreja.
        </p>
      </div>
      <PasswordRecoveryForm />
      <p className="mt-6 text-sm text-muted">
        Lembrou sua senha?{" "}
        <Link
          href="/login"
          className="font-semibold text-foreground underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-accent"
        >
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
