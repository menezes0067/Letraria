CREATE TABLE IF NOT EXISTS users(
	id TEXT PRIMARY KEY,
	name TEXT NOT NULL,
	email TEXT NOT NULL,
	password TEXT NOT NULL,
	profil TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS books(
	id TEXT PRIMARY KEY,
	types TEXT NOT NULL CHECK(types in ('fisico', 'ebook', 'audiobook')),
	title TEXT NOT NULL,
	autor TEXT NOT NULL,
	year_ INTERGER NOT NULL,
	available_quantity INTERGER NOT NULL DEFAULT 1 CHECK (available_quantity >= 0)
);

CREATE TABLE IF NOT EXISTS loans(
	id TEXT PRIMARY KEY,
	book_id TEXT NOT NULL,
	user_id TEXT NOT NULL,	
	loandate TEXT NOT NULL,
	expectedreturndate TEXT NOT NULL,
	actualreturndate TEXT 
	fine REAL NOT NULL DEFAULT 0 CHECK(fine >= 0),

	FOREIGN KEY (book_id) REFERENCES books(id),
	FOREIGN KEY(user_id) REFERENCES users(id)
);
