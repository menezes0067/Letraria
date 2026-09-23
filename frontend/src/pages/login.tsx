import { KeyRound, Landmark, Mail, ShieldCheck, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { AuthShell } from "../layout/auth-shell";
import { useLibrary } from "../lib/library";

export function Login() {
  const { signIn } = useLibrary();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const registered = location.state?.registered === true;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email.trim(), password);
      navigate("/app/inicio", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível entrar.");
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center">
        <span className="flex size-14 items-center justify-center rounded-full border border-gold-soft/70 bg-gold/10">
          <Landmark className="size-7 text-gold" />
        </span>
        <h1 className="mt-4 font-display text-4xl font-semibold tracking-[0.18em] text-ink">
          LETRARIA
        </h1>
        <p className="mt-3 font-serif text-sm italic leading-relaxed text-sepia">
          "Um livro é um jardim que se carrega no bolso."
        </p>
        <p className="mt-1 text-xs text-faded">— provérbio árabe</p>

        <div className="my-6 h-px w-24 bg-line-strong" />

        <p className="letterhead text-faded">Entrar na estante</p>
        <p className="mt-1.5 max-w-xs text-sm text-sepia">
          Acesse seu registro de leitor ou de bibliotecário para solicitar e
          acompanhar empréstimos.
        </p>
      </div>

      {registered && (
        <p
          role="status"
          className="mt-6 flex items-start gap-2 rounded-lg border border-success/30 bg-success-soft px-3 py-2 text-sm font-medium text-success"
        >
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          Carteirinha emitida! Entre com a senha criada para começar.
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-7 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">
            <Mail className="size-4 text-faded" /> E-mail
          </Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">
            <KeyRound className="size-4 text-faded" /> Senha
          </Label>
          <Input
            id="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Folheando…" : "Entrar na estante"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-sepia">
        Ainda não tem carteirinha?{" "}
        <Link
          to="/cadastro"
          className="font-semibold text-binding transition-colors hover:text-leather"
        >
          Criar conta
        </Link>
      </p>

      <button
        type="button"
        onClick={() => setShowHint((v) => !v)}
        className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-medium text-faded transition-colors hover:text-binding"
      >
        <ShieldCheck className="size-3.5" />
        Credenciais de demonstração
      </button>
      {showHint && (
        <div className="mt-3 rounded-lg border border-line bg-paper-deep/50 p-4 text-sm text-ink-soft">
          <p className="flex items-center gap-2 font-semibold">
            <UserRound className="size-4 text-leather" /> Bibliotecário
          </p>
          <p className="mt-1 font-mono text-xs text-sepia">
            ana@letraria.dev · senha123
          </p>
          <p className="mt-3 flex items-center gap-2 font-semibold">
            <UserRound className="size-4 text-binding" /> Aluno
          </p>
          <p className="mt-1 font-mono text-xs text-sepia">
            miguel@example.com · senha123
          </p>
        </div>
      )}
    </AuthShell>
  );
}