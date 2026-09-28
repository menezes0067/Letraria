CREATE TABLE IF NOT EXISTS users(
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL UNIQUE,
	password TEXT NOT NULL,
	profile TEXT NOT NULL CHECK (profile in ('aluno', 'bibliotecario')),
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books(
	id TEXT PRIMARY KEY,
	format TEXT NOT NULL CHECK(format in ('fisico', 'ebook', 'audiobook')),
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	year INTEGER NOT NULL,
	availableQuantity INTEGER NOT NULL DEFAULT 1 CHECK (availableQuantity >= 0),
	createdAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS loans(
	id TEXT PRIMARY KEY,
	bookId TEXT NOT NULL,
	userId TEXT NOT NULL,
	loanDate TEXT NOT NULL,
	expectedReturnDate TEXT NOT NULL,
	actualReturnDate TEXT,
	fine REAL NOT NULL DEFAULT 0 CHECK(fine >= 0),
	createdAt TEXT NOT NULL,
	updatedAt TEXT NOT NULL,

	FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE,
	FOREIGN KEY (userId) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_loans_user ON loans(userId);
CREATE INDEX IF NOT EXISTS idx_loans_book ON loans(bookId);

CREATE TABLE IF NOT EXISTS activity(
	id TEXT PRIMARY KEY,
	action TEXT NOT NULL,
	detail TEXT NOT NULL,
	at TEXT NOT NULL
);