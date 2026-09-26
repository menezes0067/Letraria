import { BookCheck, BookPlus, CalendarDays, Stamp, TriangleAlert } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { SelfCheckoutDialog } from "../components/feature/self-checkout";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { addDays, formatBRL, formatDateBR, isOverdue, shortId, todayISO } from "../lib/dates";
import { useLibrary } from "../lib/library";
import type { Book, Loan, User } from "../types";
import { computeFine, FORMAT_SETTINGS } from "../types";

export function LoansPage() {
  const {
    currentUser,
    loans,
    loading,
    books,
    users,
    bookById,
    userById,
    addLoan,
    returnLoan,
  } = useLibrary();

  const isLibrarian = currentUser?.profile === "bibliotecario";

  const visible = useMemo(
    () =>
      isLibrarian
        ? loans
        : loans.filter((l) => l.userId === currentUser?.id),
    [loans, isLibrarian, currentUser],
  );

  const active = useMemo(
    () => visible.filter((l) => l.actualReturnDate === null),
    [visible],
  );
  const overdue = useMemo(
    () => active.filter((l) => isOverdue(l.expectedReturnDate)),
    [active],
  );
  const sorted = useMemo(
    () => [...visible].sort((a, b) => b.loanDate.localeCompare(a.loanDate)),
    [visible],
  );
  const overdueIds = useMemo(() => new Set(overdue.map((o) => o.id)), [overdue]);

  const [newOpen, setNewOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [returning, setReturning] = useState<Loan | null>(null);

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sepia">
          {isLibrarian ? (
            <>
              {active.length}{" "}
              {active.length === 1 ? "empréstimo em aberto" : "empréstimos em aberto"} ·{" "}
              <span className={overdue.length > 0 ? "font-semibold text-danger" : ""}>
                {overdue.length} em atraso
              </span>
            </>
          ) : (
            <>Seu histórico de empréstimos na estante.</>
          )}
        </p>
        {isLibrarian && (
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button>
                <BookPlus />
                Registrar empréstimo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <NewLoanForm
                books={books}
                users={users}
                overdueUserIds={new Set(overdue.map((o) => o.userId))}
                onDone={async (input) => {
                  await addLoan(input); // valida RF12/RF14 no serviço
                  setNewOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        )}
        {!isLibrarian && (
          <>
            <Button variant="secondary" onClick={() => setCheckoutOpen(true)}>
              <BookPlus />
              Retirar livro
            </Button>
            <SelfCheckoutDialog
              open={checkoutOpen}
              onOpenChange={setCheckoutOpen}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="aberto">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="aberto" className="flex-1 sm:flex-none">
            Em aberto ({active.length})
          </TabsTrigger>
          {overdue.length > 0 && (
            <TabsTrigger value="atrasados" className="flex-1 sm:flex-none">
              Atrasados ({overdue.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="todos" className="flex-1 sm:flex-none">
            Todas as fichas ({visible.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aberto">
          <LoanTable
            loans={active}
            loading={loading}
            bookById={bookById}
            userById={userById}
            overdueIds={overdueIds}
            isLibrarian={isLibrarian}
            onReturn={isLibrarian ? setReturning : undefined}
          />
        </TabsContent>

        <TabsContent value="atrasados">
          <LoanTable
            loans={overdue}
            loading={loading}
            bookById={bookById}
            userById={userById}
            overdueIds={overdueIds}
            isLibrarian={isLibrarian}
            onReturn={isLibrarian ? setReturning : undefined}
          />
        </TabsContent>

        <TabsContent value="todos">
          <LoanTable
            loans={sorted}
            loading={loading}
            bookById={bookById}
            userById={userById}
            overdueIds={overdueIds}
            isLibrarian={isLibrarian}
            onReturn={isLibrarian ? setReturning : undefined}
          />
        </TabsContent>
      </Tabs>

      <Dialog
        open={returning !== null}
        onOpenChange={(open) => !open && setReturning(null)}
      >
        <DialogContent>
          {returning && (
            <ReturnLoanForm
              loan={returning}
              bookTitle={bookById(returning.bookId)?.title ?? "Livro"}
              format={bookById(returning.bookId)?.format ?? "fisico"}
              onDone={async (actual) => {
                await returnLoan(returning.id, actual);
                setReturning(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function LoanCard({
  loan,
  book,
  reader,
  overdue,
  onReturn,
}: {
  loan: Loan;
  book: Book | undefined;
  reader: User | undefined;
  overdue: boolean;
  onReturn?: (loan: Loan) => void;
}) {
  const returned = loan.actualReturnDate !== null;
  return (
    <div className="rounded-xl border border-line bg-parchment p-4 shadow-paper">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink">{book?.title ?? "—"}</p>
          <p className="truncate text-xs text-sepia">
            {reader?.name ?? "—"} · {reader?.email ?? ""}
          </p>
        </div>
        <span className="font-mono text-xs font-semibold text-faded">
          #{shortId(loan.id)}
        </span>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
        <div>
          <dt className="letterhead text-faded">Empréstimo</dt>
          <dd className="mt-0.5 text-ink-soft">{formatDateBR(loan.loanDate)}</dd>
        </div>
        <div>
          <dt className="letterhead text-faded">Prevista</dt>
          <dd className="mt-0.5 text-ink-soft">{formatDateBR(loan.expectedReturnDate)}</dd>
        </div>
        <div>
          <dt className="letterhead text-faded">Efetiva</dt>
          <dd className="mt-0.5 text-ink-soft">
            {returned ? formatDateBR(loan.actualReturnDate) : "—"}
          </dd>
        </div>
        <div>
          <dt className="letterhead text-faded">Multa</dt>
          <dd className="mt-0.5">
            {loan.fine > 0 ? (
              <span className="font-semibold text-danger">{formatBRL(loan.fine)}</span>
            ) : (
              <span className="text-faded">—</span>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-3 flex items-center justify-between gap-2">
        {returned ? (
          <Badge variant="success" className="normal-case">
            Devolvido
          </Badge>
        ) : overdue ? (
          <Badge variant="danger" className="normal-case">
            Em atraso
          </Badge>
        ) : (
          <Badge variant="soft" className="normal-case">
            Em aberto
          </Badge>
        )}
        {onReturn && !returned && (
          <Button variant="outline" size="sm" onClick={() => onReturn(loan)}>
            <BookCheck />
            Devolver
          </Button>
        )}
      </div>
    </div>
  );
}

function LoanTable({
  loans,
  loading,
  bookById,
  userById,
  overdueIds,
  isLibrarian,
  onReturn,
}: {
  loans: Loan[];
  loading: boolean;
  bookById: (id: string) => Book | undefined;
  userById: (id: string) => User | undefined;
  overdueIds: Set<string>;
  isLibrarian: boolean;
  onReturn?: (loan: Loan) => void;
}) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-paper-deep" />
        ))}
      </div>
    );
  }

  if (loans.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-line-strong bg-parchment/50 px-6 py-14 text-center">
        <Stamp className="mx-auto size-8 text-faded" />
        <p className="mt-3 font-display text-xl text-ink">Nenhuma ficha por aqui.</p>
        <p className="mt-1 text-sm text-sepia">
          {onReturn
            ? "Registre um empréstimo para a circulação começar."
            : "Quando você retirar um livro, ele aparecerá neste histórico."}
        </p>
      </div>
    );
  }

  return (
    <>
      {/* cartões (mobile) */}
      <div className="grid gap-3 md:hidden">
        {loans.map((loan) => (
          <LoanCard
            key={loan.id}
            loan={loan}
            book={bookById(loan.bookId)}
            reader={userById(loan.userId)}
            overdue={overdueIds.has(loan.id)}
            onReturn={onReturn}
          />
        ))}
      </div>

      {/* tabela (md+) */}
      <div className="hidden overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Livro</TableHead>
              <TableHead>Leitor</TableHead>
              <TableHead>Empréstimo</TableHead>
              <TableHead>Prevista</TableHead>
              <TableHead>Efetiva</TableHead>
              <TableHead className="text-right">Multa</TableHead>
              {isLibrarian && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loans.map((loan) => {
              const book = bookById(loan.bookId);
              const reader = userById(loan.userId);
              const returned = loan.actualReturnDate !== null;
              const overdue = !returned && overdueIds.has(loan.id);
              return (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono text-xs font-semibold text-faded">
                    #{shortId(loan.id)}
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold text-ink">{book?.title ?? "—"}</p>
                    <p className="text-xs text-sepia">{book?.author}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-ink-soft">{reader?.name ?? "—"}</p>
                    <p className="text-xs text-sepia">{reader?.email}</p>
                  </TableCell>
                  <TableCell className="text-ink-soft">
                    {formatDateBR(loan.loanDate)}
                  </TableCell>
                  <TableCell className="text-ink-soft">
                    {formatDateBR(loan.expectedReturnDate)}
                  </TableCell>
                  <TableCell>
                    {returned ? (
                      <Badge variant="success" className="normal-case">
                        {formatDateBR(loan.actualReturnDate)}
                      </Badge>
                    ) : (
                      <Badge variant={overdue ? "danger" : "soft"} className="normal-case">
                        {overdue ? "Em atraso" : "Em aberto"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {loan.fine > 0 ? (
                      <span className="font-semibold text-danger">
                        {formatBRL(loan.fine)}
                      </span>
                    ) : (
                      <span className="text-faded">—</span>
                    )}
                  </TableCell>
                  {isLibrarian && (
                    <TableCell className="text-right">
                      {!returned && (
                        <Button variant="outline" size="sm" onClick={() => onReturn?.(loan)}>
                          <BookCheck />
                          Devolver
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

function NewLoanForm({
  books,
  users,
  overdueUserIds,
  onDone,
}: {
  books: Book[];
  users: User[];
  overdueUserIds: Set<string>;
  onDone: (input: { bookId: string; userId: string; loanDate: string; expectedReturnDate: string }) => Promise<void>;
}) {
  const available = books.filter((b) => (b.format === "fisico" ? b.availableQuantity > 0 : true));
  const [bookId, setBookId] = useState("");
  const [userId, setUserId] = useState("");
  const [loanDate, setLoanDate] = useState(todayISO());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const book = books.find((b) => b.id === bookId);
  const userBlocked = !!userId && overdueUserIds.has(userId);
  const dueDays = book ? FORMAT_SETTINGS[book.format].dueDays : 14;
  const expected = book && loanDate ? addDays(loanDate, dueDays) : "";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!bookId || !userId) return;
    setPending(true);
    setError(null);
    try {
      await onDone({ bookId, userId, loanDate, expectedReturnDate: expected });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Registrar empréstimo</DialogTitle>
        <DialogDescription>
          Carimbe uma ficha nova — o volume sairá da estante.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label>Livro</Label>
          <Select value={bookId} onValueChange={setBookId}>
            <SelectTrigger>
              <SelectValue placeholder="Escolha o volume…" />
            </SelectTrigger>
            <SelectContent>
              {available.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.title} — {b.author}{" "}
                  {b.format === "fisico" ? `(${b.availableQuantity} disp.)` : "(digital)"}
                </SelectItem>
              ))}
              {available.length === 0 && (
                <SelectItem value="none" disabled>
                  Nenhum exemplar disponível
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Leitor</Label>
          <Select value={userId} onValueChange={setUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Quem vai levar?" />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id} disabled={overdueUserIds.has(u.id)}>
                  {u.name}
                  {overdueUserIds.has(u.id) ? " (em atraso)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {userBlocked && (
          <p className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            Este leitor possui empréstimo em atraso e não pode retirar novos livros (RF14).
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="loan-date">Data do empréstimo</Label>
            <Input
              id="loan-date"
              type="date"
              required
              value={loanDate}
              onChange={(e) => setLoanDate(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="due-date">Devolução prevista</Label>
            <Input
              id="due-date"
              type="date"
              value={expected}
              className="disabled:opacity-60"
              disabled
            />
          </div>
        </div>

        {book && loanDate && (
          <p className="flex items-center gap-2 rounded-lg border border-line bg-paper-deep/50 px-3 py-2 text-sm text-ink-soft">
            <CalendarDays className="size-4 text-binding" />
            Formato <strong>{book.format}</strong>: prazo de leitura de{" "}
            <strong>{dueDays} dias</strong>
            {FORMAT_SETTINGS[book.format].finePerDay > 0 && (
              <> · multa de {formatBRL(FORMAT_SETTINGS[book.format].finePerDay)}/dia por atraso</>
            )}
            .
          </p>
        )}

        {error && (
          <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>

      <DialogFooter>
        <Button
          type="submit"
          disabled={!bookId || !userId || !expected || userBlocked || pending}
        >
          {pending ? "Carimbando…" : "Carimbar ficha"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function ReturnLoanForm({
  loan,
  bookTitle,
  format,
  onDone,
}: {
  loan: Loan;
  bookTitle: string;
  format: "fisico" | "ebook" | "audiobook";
  onDone: (actualDate: string) => Promise<void>;
}) {
  const [date, setDate] = useState(todayISO());
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fine = computeFine(format, loan.expectedReturnDate, date);

  async function submit() {
    setPending(true);
    setError(null);
    try {
      await onDone(date);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível registrar.");
      setPending(false);
    }
  }

  return (
    <div className="grid gap-4">
      <DialogHeader>
        <DialogTitle>Registrar devolução</DialogTitle>
        <DialogDescription>
          Confira a data de retorno do volume{" "}
          <span className="font-semibold text-ink">{bookTitle}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-2">
        <Label htmlFor="return-date">Data efetiva de devolução</Label>
        <Input
          id="return-date"
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between rounded-lg border border-line bg-paper-deep/50 px-4 py-3">
        <span className="text-sm text-ink-soft">Multa por atraso</span>
        <span
          className={
            fine > 0
              ? "font-display text-2xl font-semibold text-danger"
              : "font-display text-2xl font-semibold text-success"
          }
        >
          {formatBRL(fine)}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <DialogFooter>
        <Button onClick={submit} disabled={pending}>
          <BookCheck />
          {pending ? "Registrando…" : "Confirmar devolução"}
        </Button>
      </DialogFooter>
    </div>
  );
}