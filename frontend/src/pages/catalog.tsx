import { BookPlus, PencilLine, Search, Trash2 } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import {
  BookFace,
  BookFaceBadge,
  BookFormatBadge,
} from "../components/feature/book";
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
import { Skeleton } from "../components/ui/skeleton";
import { formatDateBR, shortId } from "../lib/dates";
import { useLibrary } from "../lib/library";
import type { Book, BookFormat } from "../types";
import { FORMAT_LABEL, isBookAvailable } from "../types";

type FormatFilter = "todos" | BookFormat;
type AvailFilter = "todos" | "disponivel" | "emprestado";

export function CatalogPage() {
  const { books, loading, currentUser, bookById, addBook, updateBook } =
    useLibrary();
  const [query, setQuery] = useState("");
  const [format, setFormat] = useState<FormatFilter>("todos");
  const [avail, setAvail] = useState<AvailFilter>("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);

  const isLibrarian = currentUser?.profile === "bibliotecario";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return books.filter((b) => {
      const matchesFormat = format === "todos" || b.format === format;
      const matchesAvail =
        avail === "todos" ||
        (avail === "disponivel" && isBookAvailable(b)) ||
        (avail === "emprestado" && !isBookAvailable(b));
      const matchesQuery =
        q.length === 0 ||
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q);
      return matchesFormat && matchesAvail && matchesQuery;
    });
  }, [books, query, format, avail]);

  const selected: Book | undefined = selectedId ? bookById(selectedId) : undefined;

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(book: Book) {
    setEditing(book);
    setFormOpen(true);
  }

  return (
    <div className="grid gap-5">
      {/* faixa de busca e filtros */}
      <div className="grid gap-3 sm:flex sm:flex-wrap sm:items-center">
        <div className="relative w-full sm:min-w-0 sm:flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faded" />
          <Input
            type="search"
            placeholder="Buscar por título ou autor…"
            className="pl-10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <div className="w-full sm:w-40">
            <Select value={format} onValueChange={(v) => setFormat(v as FormatFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os formatos</SelectItem>
                <SelectItem value="fisico">Físico</SelectItem>
                <SelectItem value="ebook">E-book</SelectItem>
                <SelectItem value="audiobook">Audiobook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-40">
            <Select value={avail} onValueChange={(v) => setAvail(v as AvailFilter)}>
              <SelectTrigger>
                <SelectValue placeholder="Disponibilidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                <SelectItem value="disponivel">Disponível</SelectItem>
                <SelectItem value="emprestado">Emprestado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {isLibrarian && (
          <Button variant="secondary" onClick={openCreate} className="sm:ml-auto">
            <BookPlus />
            Adicionar livro
          </Button>
        )}
      </div>

      <p className="text-sm text-sepia">
        {filtered.length}{" "}
        {filtered.length === 1 ? "volume encontrado" : "volumes encontrados"}
        {format !== "todos" && ` · ${FORMAT_LABEL[format].toLowerCase()}`}
        {avail !== "todos" && ` · ${avail === "disponivel" ? "disponíveis" : "emprestados"}`}
        {query.trim() && ` · “${query.trim()}”`}
      </p>

      {/* prateleira */}
      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4.4] w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-line-strong bg-parchment/50 px-6 py-14 text-center">
          <p className="font-display text-xl text-ink">Nenhum volume encontrado.</p>
          <p className="mt-1 text-sm text-sepia">
            Tente outra palavra, formato ou disponibilidade na estante.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => setSelectedId(book.id)}
              className="group cursor-pointer text-left outline-none focus-visible:ring-2 focus-visible:ring-gold rounded-lg"
              aria-label={`Ver detalhes de ${book.title}`}
            >
              <BookFace book={book} />
              <div className="mt-2.5 flex items-start justify-between gap-2 px-0.5">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{book.title}</p>
                  <p className="truncate text-xs text-sepia">{book.author}</p>
                </div>
                <Badge variant="outline" className="shrink-0">
                  {book.year}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* ficha do livro */}
      <Dialog
        open={selected !== undefined}
        onOpenChange={(open) => !open && setSelectedId(null)}
      >
        <DialogContent className="max-w-2xl">
          {selected && (
            <BookDetail
              book={selected}
              isLibrarian={isLibrarian}
              onEdit={() => openEdit(selected)}
              onClose={() => setSelectedId(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* criar/editar */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <BookFormDialog
            key={editing?.id ?? "novo"}
            mode={editing ? "editar" : "criar"}
            initial={editing ?? undefined}
            onDone={(input) => {
              if (editing) {
                void updateBook(editing.id, input);
              } else {
                void addBook(input);
              }
              setFormOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function BookDetail({
  book,
  isLibrarian,
  onEdit,
  onClose,
}: {
  book: Book;
  isLibrarian: boolean;
  onEdit: () => void;
  onClose: () => void;
}) {
  const { removeBook } = useLibrary();
  const [confirming, setConfirming] = useState(false);
  const [borrowOpen, setBorrowOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const outOfStock = book.format === "fisico" && book.availableQuantity <= 0;

  async function remove() {
    setError(null);
    try {
      await removeBook(book.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir.");
      setConfirming(false);
    }
  }

  return (
    <div className="grid gap-5">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 font-serif">
          Ficha do volume
          <span className="font-mono text-xs font-normal text-faded">
            #{shortId(book.id)}
          </span>
        </DialogTitle>
        <DialogDescription>
          Registro catalográfico do exemplar na estante Letraria.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-6 sm:grid-cols-[168px_1fr]">
        <BookFace book={book} className="w-40" />
        <dl className="grid content-start gap-4">
          <div>
            <dt className="letterhead text-faded">Título</dt>
            <dd className="mt-1 font-display text-2xl font-semibold text-ink">
              {book.title}
            </dd>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <dt className="letterhead text-faded">Autor</dt>
              <dd className="mt-1 text-ink-soft">{book.author}</dd>
            </div>
            <div>
              <dt className="letterhead text-faded">Ano</dt>
              <dd className="mt-1 text-ink-soft">{book.year}</dd>
            </div>
          </div>
          <div>
            <dt className="letterhead text-faded">Formato</dt>
            <dd className="mt-1.5">
              <BookFormatBadge format={book.format} />
            </dd>
          </div>
          <div>
            <dt className="letterhead text-faded">Disponibilidade</dt>
            <dd className="mt-1.5">
              <BookFaceBadge book={book} />
            </dd>
          </div>
          <div>
            <dt className="letterhead text-faded">Registrado em</dt>
            <dd className="mt-1 text-sm text-ink-soft">
              {formatDateBR(book.createdAt)}
            </dd>
          </div>
        </dl>
      </div>

      {!isLibrarian && (
        <div className="rounded-lg border border-line bg-paper-deep/40 p-4">
          <p className="letterhead text-faded">Retirada</p>
          <p className="mt-1 text-sm text-sepia">
            Retire pelo seu próprio registro — o prazo de devolução é calculado
            conforme o formato do volume.
          </p>
          <Button
            type="button"
            className="mt-3 w-full sm:w-auto"
            disabled={outOfStock}
            onClick={() => setBorrowOpen(true)}
          >
            <BookPlus />
            {outOfStock ? "Sem exemplares agora" : "Pegar emprestado"}
          </Button>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}

      <DialogFooter className="flex-wrap-reverse gap-3 sm:justify-between">
        <div className={isLibrarian ? "flex items-center gap-2" : "hidden"}>
          {confirming ? (
            <>
              <Button variant="ghost" onClick={() => setConfirming(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={remove}>
                <Trash2 />
                Confirmar exclusão
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={onEdit}>
                <PencilLine />
                Editar ficha
              </Button>
              <Button
                variant="ghost"
                className="text-danger hover:bg-danger-soft hover:text-danger"
                onClick={() => setConfirming(true)}
              >
                <Trash2 />
                Excluir
              </Button>
            </>
          )}
        </div>
        <Button variant="secondary" onClick={onClose}>
          Fechar ficha
        </Button>
      </DialogFooter>

      {!isLibrarian && (
        <SelfCheckoutDialog
          open={borrowOpen}
          onOpenChange={setBorrowOpen}
          initialBookId={book.id}
        />
      )}
    </div>
  );
}

function BookFormDialog({
  mode,
  initial,
  onDone,
}: {
  mode: "criar" | "editar";
  initial?: Book;
  onDone: (input: import("../services/api").BookInput) => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [author, setAuthor] = useState(initial?.author ?? "");
  const [year, setYear] = useState(initial?.year.toString() ?? "1900");
  const [format, setFormat] = useState<BookFormat>(initial?.format ?? "fisico");
  const [quantity, setQuantity] = useState(
    initial ? initial.availableQuantity.toString() : "1",
  );

  const isPhysical = format === "fisico";

  function submit(e: FormEvent) {
    e.preventDefault();
    onDone({
      title: title.trim(),
      author: author.trim(),
      year: Number(year) || new Date().getFullYear(),
      format,
      availableQuantity: isPhysical ? Math.max(0, Number(quantity) || 0) : 1,
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{mode === "criar" ? "Adquirir novo volume" : "Editar ficha do livro"}</DialogTitle>
        <DialogDescription>
          {mode === "criar"
            ? "Registre uma nova obra no catálogo da estante."
            : "Atualize os dados catalográficos do exemplar."}
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="bk-title">Título</Label>
          <Input
            id="bk-title"
            required
            placeholder="Grande Sertão: Veredas"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bk-author">Autor</Label>
          <Input
            id="bk-author"
            required
            placeholder="João Guimarães Rosa"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="bk-year">Ano</Label>
            <Input
              id="bk-year"
              type="number"
              min="1000"
              max="2100"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Formato</Label>
            <Select value={format} onValueChange={(v) => setFormat(v as BookFormat)}>
              <SelectTrigger>
                <SelectValue placeholder="Formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fisico">{FORMAT_LABEL.fisico}</SelectItem>
                <SelectItem value="ebook">{FORMAT_LABEL.ebook}</SelectItem>
                <SelectItem value="audiobook">{FORMAT_LABEL.audiobook}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isPhysical ? (
            <div className="grid gap-2">
              <Label htmlFor="bk-qty">Exemplares</Label>
              <Input
                id="bk-qty"
                type="number"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          ) : (
            <div className="grid gap-2">
              <Label>Estoque</Label>
              <Input disabled value="Digital · sempre" />
            </div>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button type="submit">
          {mode === "criar" ? "Registrar na estante" : "Salvar alterações"}
        </Button>
      </DialogFooter>
    </form>
  );
}