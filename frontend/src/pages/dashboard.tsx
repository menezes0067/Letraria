import {
  BookMarked,
  CalendarClock,
  Hourglass,
  Landmark,
  LibraryBig,
  ScrollText,
  Wallet,
} from "lucide-react";

import { Badge } from "../components/ui/badge";
import { BookFace } from "../components/feature/book";
import { StatCard } from "../components/feature/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { Skeleton } from "../components/ui/skeleton";
import { formatBRL, formatDateBR, shortId } from "../lib/dates";
import { useLibrary } from "../lib/library";
import type { ActivityEntry } from "../services/api";
import { FORMAT_SETTINGS } from "../types";

function overdueFineDays(expected: string): number {
  const ms = Date.now() - new Date(expected).getTime();
  return ms > 0 ? Math.floor(ms / (24 * 60 * 60 * 1000)) : 0;
}

function fineFor(expected: string, finePerDay: number): number {
  return overdueFineDays(expected) * finePerDay;
}

const ACTION_STYLE: Record<ActivityEntry["action"], { label: string; variant: "soft" | "outline" | "danger" | "gold" | "success" }> = {
  cadastro: { label: "Cadastro", variant: "soft" },
  "edição": { label: "Edição", variant: "outline" },
  exclusão: { label: "Exclusão", variant: "danger" },
  empréstimo: { label: "Empréstimo", variant: "gold" },
  devolução: { label: "Devolução", variant: "success" },
};

export function Dashboard() {
  const {
    loading,
    currentUser,
    books,
    loans,
    activeLoans,
    overdueLoans,
    activity,
    bookById,
    userById,
  } = useLibrary();

  const isLibrarian = currentUser?.profile === "bibliotecario";
  const myLoans = isLibrarian
    ? loans
    : loans.filter((l) => l.userId === currentUser?.id);
  const myActive = myLoans.filter((l) => l.actualReturnDate === null);
  const myOverdue = myActive.filter((l) => new Date(l.expectedReturnDate).getTime() < Date.now());

  const availableCopies = books.reduce((acc, b) => acc + b.availableQuantity, 0);
  const featured = books.filter((b) => {
    if (b.format === "fisico") return b.availableQuantity > 0;
    return true;
  }).slice(0, 6);

  const recent = [...myLoans]
    .sort((a, b) => b.loanDate.localeCompare(a.loanDate))
    .slice(0, 5);

  const pendingFines = myOverdue.reduce((acc, l) => {
    const book = bookById(l.bookId);
    const perDay = book ? FORMAT_SETTINGS[book.format].finePerDay : 0;
    return acc + fineFor(l.expectedReturnDate, perDay);
  }, 0);

  return (
    <div className="grid gap-8">
      {/* estatísticas */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLibrarian ? (
          <>
            <StatCard
              label="Exemplares na estante"
              value={availableCopies}
              hint={`${books.length} títulos no catálogo`}
              icon={<BookMarked />}
              tone="leather"
            />
            <StatCard
              label="Empréstimos ativos"
              value={activeLoans.length}
              hint="fora da estante neste momento"
              icon={<Landmark />}
              tone="binding"
            />
            <StatCard
              label="Pendentes de devolução"
              value={overdueLoans.length}
              hint="prazo já vencido"
              icon={<Hourglass />}
              tone="danger"
            />
            <StatCard
              label="Multas em aberto"
              value={formatBRL(Number(pendingFines.toFixed(2)))}
              hint="estimativa de atraso"
              icon={<Wallet />}
              tone="gold"
            />
          </>
        ) : (
          <>
            <StatCard
              label="Meus empréstimos"
              value={myActive.length}
              hint="livros com você agora"
              icon={<Landmark />}
              tone="binding"
            />
            <StatCard
              label="Minhas pendências"
              value={myOverdue.length}
              hint="prazo já vencido"
              icon={<Hourglass />}
              tone="danger"
            />
            <StatCard
              label="Multas estimadas"
              value={formatBRL(Number(pendingFines.toFixed(2)))}
              hint="caso devolva hoje"
              icon={<Wallet />}
              tone="gold"
            />
            <StatCard
              label="Exemplares na estante"
              value={availableCopies}
              hint={`${books.length} títulos no catálogo`}
              icon={<BookMarked />}
              tone="leather"
            />
          </>
        )}
      </section>

      {loading ? (
        <section className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="aspect-[3/4.4] w-full rounded-lg" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </section>
      ) : (
        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">
                Na estante
              </h2>
              <p className="text-sm text-sepia">
                {isLibrarian
                  ? "Títulos disponíveis para empréstimo agora."
                  : "Títulos que você pode levar para casa."}
              </p>
            </div>
            <span className="letterhead hidden text-faded sm:block">
              {featured.length} destaques
            </span>
          </div>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {featured.map((b) => (
              <BookFace key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}

      {/* movimentações recentes */}
      <section>
        <Card className="paper-texture">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="size-5 text-leather" />
              Movimentações recentes
            </CardTitle>
            <CardDescription>
              {isLibrarian
                ? "Últimas fichas de empréstimo registradas na estante."
                : "Suas últimas fichas de empréstimo."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-line">
              {recent.map((loan) => {
                const book = bookById(loan.bookId);
                const reader = userById(loan.userId);
                const returned = loan.actualReturnDate !== null;
                return (
                  <div
                    key={loan.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 py-4"
                  >
                    <span className="font-mono text-xs font-semibold text-faded">
                      #{shortId(loan.id)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">
                        {book?.title ?? "Título removido"}
                      </p>
                      <p className="truncate text-sm text-sepia">
                        {isLibrarian
                          ? `com ${reader?.name ?? "leitor desconhecido"}`
                          : formatDateBR(loan.loanDate)}
                      </p>
                    </div>
                    {isLibrarian && (
                      <p className="hidden text-sm text-sepia md:block">
                        {formatDateBR(loan.loanDate)}
                      </p>
                    )}
                    {returned ? (
                      <Badge variant="success" className="normal-case">
                        Devolvido em {formatDateBR(loan.actualReturnDate)}
                      </Badge>
                    ) : (
                      <Badge
                        variant={
                          myOverdue.some((o) => o.id === loan.id) ? "danger" : "gold"
                        }
                        className="normal-case"
                      >
                        {myOverdue.some((o) => o.id === loan.id)
                          ? `Em atraso — prazo ${formatDateBR(loan.expectedReturnDate)}`
                          : `Devolver até ${formatDateBR(loan.expectedReturnDate)}`}
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* registro de operações (RF15) — bibliotecário */}
      {isLibrarian && activity.length > 0 && (
        <section>
          <Card className="paper-texture">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="size-5 text-binding" />
                Registro de operações
              </CardTitle>
              <CardDescription>
                Auditoria das últimas ações cadastradas no sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-line">
                {activity.slice(0, 8).map((entry) => {
                  const style = ACTION_STYLE[entry.action];
                  return (
                    <div
                      key={entry.id}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3"
                    >
                      <Badge variant={style.variant} className="normal-case shrink-0">
                        {style.label}
                      </Badge>
                      <p className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                        {entry.detail}
                      </p>
                      <span className="text-xs text-faded">
                        {new Date(entry.at).toLocaleString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <Separator />
      <p className="flex items-center justify-center gap-2 text-center text-xs text-faded">
        <LibraryBig className="size-4" />
        Letraria · registra-se aqui a circulação de cada volume.
      </p>
    </div>
  );
}