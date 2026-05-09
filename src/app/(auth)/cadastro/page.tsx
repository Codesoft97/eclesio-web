import Link from "next/link";

import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
  return (
    <div className="w-full max-w-xl py-8">
      <div className="mb-8">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Primeiro acesso
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground">Cadastrar igreja</h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Crie a conta da igreja e o usuário administrador em um único passo.
        </p>
      </div>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted">
        Ja tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-foreground underline decoration-accent underline-offset-4">
          Entrar
        </Link>
      </p>
    </div>
  );
}