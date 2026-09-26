import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import * as api from "../services/api";
import type {
  ActivityEntry,
  BookInput,
  NewLoanInput,
  NewUserInput,
} from "../services/api";
import type { Book, User, Loan } from "../types";
import { isOverdue } from "./dates";

interface LibraryContextValue {
  currentUser: User | null;
  loading: boolean;

  books: Book[];
  users: User[];
  loans: Loan[];
  activity: ActivityEntry[];

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;

  addBook: (input: BookInput) => Promise<void>;
  updateBook: (id: string, input: BookInput) => Promise<void>;
  removeBook: (id: string) => Promise<void>;

  addUser: (input: NewUserInput) => Promise<void>;
  addLoan: (input: NewLoanInput) => Promise<void>;
  borrowSelf: (bookId: string) => Promise<Loan>;
  returnLoan: (loanId: string, actualDate: string) => Promise<void>;

  bookById: (id: string) => Book | undefined;
  userById: (id: string) => User | undefined;
  activeLoans: Loan[];
  overdueLoans: Loan[];
}

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [books, setBooks] = useState<Book[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      const [b, u, l, a] = await Promise.all([
        api.fetchBooks(),
        api.fetchUsers(),
        api.fetchLoans(),
        api.fetchActivity(),
      ]);
      if (!mounted) return;
      setBooks(b);
      setUsers(u);
      setLoans(l);
      setActivity(a);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const refreshActivity = useCallback(async () => {
    setActivity(await api.fetchActivity());
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await api.signIn(email, password);
    setCurrentUser(user);
  }, []);

  const signOut = useCallback(() => setCurrentUser(null), []);

  const addBook = useCallback(
    async (input: BookInput) => {
      const created = await api.createBook(input);
      setBooks((prev) => [created, ...prev]);
      await refreshActivity();
    },
    [refreshActivity],
  );

  const updateBook = useCallback(
    async (id: string, input: BookInput) => {
      const updated = await api.updateBook(id, input);
      setBooks((prev) => prev.map((b) => (b.id === id ? updated : b)));
      await refreshActivity();
    },
    [refreshActivity],
  );

  const removeBook = useCallback(
    async (id: string) => {
      await api.removeBook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      await refreshActivity();
    },
    [refreshActivity],
  );

  const addUser = useCallback(
    async (input: NewUserInput) => {
      const created = await api.createUser(input);
      setUsers((prev) => [...prev, created]);
      await refreshActivity();
    },
    [refreshActivity],
  );

  const addLoan = useCallback(
    async (input: NewLoanInput) => {
      const created = await api.createLoan(input);
      setLoans((prev) => [created, ...prev]);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === input.bookId && b.format === "fisico" && b.availableQuantity > 0
            ? { ...b, availableQuantity: b.availableQuantity - 1 }
            : b,
        ),
      );
      await refreshActivity();
    },
    [refreshActivity],
  );

  const returnLoan = useCallback(
    async (loanId: string, actualDate: string) => {
      const updated = await api.returnLoan(loanId, actualDate);
      setLoans((prev) => prev.map((l) => (l.id === loanId ? updated : l)));
      setBooks((prev) =>
        prev.map((b) =>
          b.id === updated.bookId && b.format === "fisico"
            ? { ...b, availableQuantity: b.availableQuantity + 1 }
            : b,
        ),
      );
      await refreshActivity();
    },
    [refreshActivity],
  );

  const borrowSelf = useCallback(
    async (bookId: string) => {
      if (!currentUser) throw new Error("Entre com sua carteirinha para retirar um volume.");
      const created = await api.borrowSelf(currentUser.id, bookId);
      setLoans((prev) => [created, ...prev]);
      setBooks((prev) =>
        prev.map((b) =>
          b.id === created.bookId && b.format === "fisico" && b.availableQuantity > 0
            ? { ...b, availableQuantity: b.availableQuantity - 1 }
            : b,
        ),
      );
      await refreshActivity();
      return created;
    },
    [currentUser, refreshActivity],
  );

  const bookById = useCallback(
    (id: string) => books.find((b) => b.id === id),
    [books],
  );
  const userById = useCallback(
    (id: string) => users.find((u) => u.id === id),
    [users],
  );

  const activeLoans = useMemo(
    () => loans.filter((l) => l.actualReturnDate === null),
    [loans],
  );
  const overdueLoans = useMemo(
    () => activeLoans.filter((l) => isOverdue(l.expectedReturnDate)),
    [activeLoans],
  );

  const value: LibraryContextValue = {
    currentUser,
    loading,
    books,
    users,
    loans,
    activity,
    signIn,
    signOut,
    addBook,
    updateBook,
    removeBook,
    addUser,
    addLoan,
    borrowSelf,
    returnLoan,
    bookById,
    userById,
    activeLoans,
    overdueLoans,
  };

  return (
    <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>
  );
}

export function useLibrary(): LibraryContextValue {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error("useLibrary deve ser usado dentro de LibraryProvider.");
  return ctx;
}