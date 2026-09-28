import { KeyRound, Landmark, Mail, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { AuthShell } from "../layout/auth-shell";
import { useLibrary } from "../lib/library";
import { PROFILE_LABEL } from "../types";
import type { UserProfile } from "../types";

export function Register() {
  const { addUser } = useLibrary();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [profile, setProfile] = useState<UserProfile>("aluno");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("As senhas não conferem. Revise a confirmação.");
      return;
    }
    setPending(true);
    try {
      await addUser({ name: name.trim(), email: email.trim(), password, profile });
      navigate("/", { replace: true, state: { registered: true } });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível emitir a carteirinha.",
      );
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

        <p className="letterhead text-faded">Abrir carteirinha</p>
        <p className="mt-1.5 max-w-xs text-sm text-sepia">
          Crie seu registro na estante — aluno ou bibliotecário — e comece a
          circular livros.
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-7 grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="r-name">
            <UserRound className="size-4 text-faded" /> Nome completo
          </Label>
          <Input
            id="r-name"
            required
            autoComplete="name"
            placeholder="Ana Beatriz Souza"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="r-email">
            <Mail className="size-4 text-faded" /> E-mail
          </Label>
          <Input
            id="r-email"
            type="email"
            required
            autoComplete="email"
            placeholder="voce@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="r-password">
              <KeyRound className="size-4 text-faded" /> Senha
            </Label>
            <Input
              id="r-password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="r-confirm">
              <KeyRound className="size-4 text-faded" /> Confirmar senha
            </Label>
            <Input
              id="r-confirm"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label>
            <UserRound className="size-4 text-faded" /> Perfil
          </Label>
          <Select value={profile} onValueChange={(v) => setProfile(v as UserProfile)}>
            <SelectTrigger>
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluno">{PROFILE_LABEL.aluno}</SelectItem>
              <SelectItem value="bibliotecario">{PROFILE_LABEL.bibliotecario}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-faded">
            {profile === "aluno"
              ? "Aluno consulta o catálogo e acompanha o próprio histórico."
              : "Bibliotecário gerencia livros, leitores e empréstimos."}
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending ? "Emitindo…" : "Emitir carteirinha"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-sepia">
        Já tem carteirinha?{" "}
        <Link
          to="/"
          className="font-semibold text-binding transition-colors hover:text-leather"
        >
          Entrar na estante
        </Link>
      </p>
    </AuthShell>
  );
}