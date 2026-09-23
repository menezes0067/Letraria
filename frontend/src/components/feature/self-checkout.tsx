import { TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { BookFormatBadge } from "./book";
import { addDays, formatDateBR, todayISO } from "../../lib/dates";
import { useLibrary } from "../../lib/library";
import type { Loan } from "../../types";
import { FORMAT_SETTINGS } from "../../types";

interface SelfCheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Vindo da ficha do livro — já vem selecionado. */
  initialBookId?: string;
  onBorrowed?: () => void;
}

export function SelfCheckoutDialog({
  open,
  onOpenChange,
  initialBookId,
  onBorrowed,
}: SelfCheckoutDialogProps) {
  const { books, currentUser, loans, overdueLoans, borrowSelf } = useLibrary();
  const myId = currentUser?.id;

  const [selectedId, setSelectedId] = useState(initialBookId ?? "");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Loan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setSelectedId(initialBookId ?? "");
      setPending(false);
      setDone(null);
      setError(null);
    }
  }, [open, initialBookId]);

  const myActiveBookIds = useMemo(
    () =>
      new Set(
        loans
          .filter((l) => l.userId === myId && l.actualReturnDate === null)
          .map((l) => l.bookId),
      ),
    [loans, myId],
  );

  const available = useMemo(
    () =>
      books.filter(
        (b) =>
          (b.format === "fisico" ? b.availableQuantity > 0 : true) &&
          !myActiveBookIds.has(b.id),
      ),
    [books, myActiveBookIds],
  );

  const myBlocked =
    !!myId && overdueLoans.some((o) => o.userId === myId && o.actualReturnDate === null);

  const book = selectedId ? books.find((b) => b.id === selectedId) : undefined;
  const dueDays = book ? FORMAT_SETTINGS[book.format].dueDays : 0;
  const expected = book ? addDays(todayISO(), dueDays) : "";

  async function confirm() {
    if (!book || !myId || myBlocked) return;
    setPending(true);
    setError(null);
    try {
      const loan = await borrowSelf(book.id);
      setDone(loan);
      onBorrowed?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível retirar o volume.");
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!pending) onOpenChange(next);
      }}
    >
      <DialogContent>
        {done && book ? (
          <div className="grid gap-4 text-center">
            <DialogHeader>
              <DialogTitle>Retirada carimbada</DialogTitle>
              <DialogDescription>
                "O volume está com você — boa leitura.
              </DialogDescription>
            </DialogHeader>
            <div className="rounded-lg border border-line bg-paper-deep/40 px-4 py-5">
              <span className="rubber-stamp text-binding">Carimbado</span>
              <p className="mt-4 font-display text-xl font-semibold text-ink">
                {book.title}
              </p>
              <p className="mt-2 text-sm text-sepia">Devolução prevista para</p>
              <p className="font-display text-2xl font-semibold text-ink">
                {formatDateBR(done.expectedReturnDate)}
              </p>
            </div>
            <DialogFooter className="sm:justify-center">
              <Button onClick={() => onOpenChange(false)}>Fechar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void confirm();
            }}
            className="grid gap-4"
          >
            <DialogHeader>
              <DialogTitle>Retirar livro</DialogTitle>
              <DialogDescription>
                Carimbe a retirada no seu próprio registro — o prazo segue o formato
                do volume.
              </DialogDescription>
            </DialogHeader>

            {initialBookId && book ? (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper-deep/40 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{book.title}</p>
                  <p className="truncate text-sm text-sepia">{book.author}</p>
                </div>
                <BookFormatBadge format={book.format} />
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Livro</Label>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha o volume…" />
                  </SelectTrigger>
                  <SelectContent>
                    {available.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.title} — {b.author}{" "}
                        {b.format === "fisico"
                          ? `(${b.availableQuantity} disp.)`
                          : "(digital)"}
                      </SelectItem>
                    ))}
                    {available.length === 0 && (
                      <SelectItem value="none" disabled>
                        Nenhum título retirável agora
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {book && (
              <div className="rounded-lg border border-line bg-paper-deep/40 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm text-ink-soft">
                    Prazo de leitura de{" "}
                    <strong className="text-ink">{dueDays} dias</strong>
                    {FORMAT_SETTINGS[book.format].finePerDay > 0 && (
                      <>
                        {" "}
                        · multa de{" "}
                        <strong className="text-ink">
                          R$ {FORMAT_SETTINGS[book.format].finePerDay.toFixed(2).replace(".", ",")}/dia
                        </strong>{" "}
                        por atraso
                      </>
                    )}
                    .
                  </span>
                  <span className="text-sm text-ink-soft">
                    Devolver até{" "}
                    <strong className="text-ink">{formatDateBR(expected)}</strong>
                  </span>
                </div>
              </div>
            )}

            {myBlocked && (
              <p className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">
                <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                Você está com empréstimo em atraso — regularize antes de retirar
                novos livros.
              </p>
            )}

            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                type="submit"
                disabled={!book || myBlocked || pending}
                className="w-full sm:w-auto"
              >
                {pending ? "Carimbando…" : "Carimbar retirada"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}