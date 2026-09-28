import { LibraryBig, UserPlus } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { useLibrary } from "../lib/library";
import type { User, UserProfile } from "../types";
import { PROFILE_LABEL } from "../types";

const INITIAL_TONES = [
  "bg-leather/12 text-leather",
  "bg-binding/12 text-binding",
  "bg-gold/14 text-gold",
  "bg-danger/10 text-danger",
];

export function UsersPage() {
  const { users, loans, loading, currentUser, addUser } = useLibrary();
  const [addOpen, setAddOpen] = useState(false);

  const isLibrarian = currentUser?.profile === "bibliotecario";

  const openLoansByUser = (userId: string) =>
    loans.filter((l) => l.userId === userId && l.actualReturnDate === null).length;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sepia">
          {users.length} {users.length === 1 ? "carteirinha cadastrada" : "carteirinhas cadastradas"}
        </p>
        {isLibrarian && (
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus />
                Cadastrar leitor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NewUserForm
                onDone={(input) => {
                  void addUser(input);
                  setAddOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-paper-deep" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-line-strong bg-parchment/50 px-6 py-14 text-center">
          <LibraryBig className="mx-auto size-8 text-faded" />
          <p className="mt-3 font-display text-xl text-ink">Nenhum leitor ainda.</p>
          <p className="mt-1 text-sm text-sepia">
            Cadastre a primeira carteirinha da estante.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {users.map((user, idx) => (
            <MembershipCard
              key={user.id}
              user={user}
              openLoans={openLoansByUser(user.id)}
              tone={INITIAL_TONES[idx % INITIAL_TONES.length] ?? INITIAL_TONES[0]}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MembershipCard({
  user,
  openLoans,
  tone,
}: {
  user: User;
  openLoans: number;
  tone: string;
}) {
  const initials = user.name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="group relative overflow-hidden rounded-xl border border-line-strong bg-parchment p-5 shadow-paper transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-leather via-gold-soft to-binding" />
      <div className="flex items-center gap-4">
        <Avatar className="size-12 border-line-strong" >
          <AvatarFallback className={tone}>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-lg font-semibold text-ink">
            {user.name}
          </p>
          <p className="truncate text-sm text-sepia">{user.email}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge
          variant={user.profile === "bibliotecario" ? "gold" : "soft"}
          className="normal-case"
        >
          {user.profile === "bibliotecario" ? "✦ " : ""}
          {PROFILE_LABEL[user.profile]}
        </Badge>
        <span className="font-mono text-xs text-faded">nº {user.id.toUpperCase()}</span>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-line bg-paper-deep/50 px-3 py-2">
        <span className="text-xs text-faded">Fichas em aberto:</span>
        <span className="font-display text-lg font-semibold leading-none text-ink">
          {openLoans}
        </span>
      </div>
    </div>
  );
}

function NewUserForm({
  onDone,
}: {
  onDone: (input: { name: string; email: string; password: string; profile: UserProfile }) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<UserProfile>("aluno");

  function submit(e: FormEvent) {
    e.preventDefault();
    onDone({ name: name.trim(), email: email.trim(), password, profile });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Nova carteirinha</DialogTitle>
        <DialogDescription>
          Cadastre um leitor ou bibliotecário no registro da estante.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="u-name">Nome completo</Label>
          <Input
            id="u-name"
            required
            placeholder="Ana Beatriz Souza"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="u-email">E-mail</Label>
          <Input
            id="u-email"
            type="email"
            required
            placeholder="leitora@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="u-password">Senha</Label>
          <Input
            id="u-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label>Perfil</Label>
          <Select value={profile} onValueChange={(v) => setProfile(v as UserProfile)}>
            <SelectTrigger>
              <SelectValue placeholder="Perfil" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aluno">{PROFILE_LABEL.aluno}</SelectItem>
              <SelectItem value="bibliotecario">{PROFILE_LABEL.bibliotecario}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">Emitir carteirinha</Button>
      </DialogFooter>
    </form>
  );
}