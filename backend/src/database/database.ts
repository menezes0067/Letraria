import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "app.db");
const schemaPath = path.join(import.meta.dirname, "schema.sql");

const db = new Database(dbPath);

db.pragma("foreign_keys = ON");

const schema = fs.readFileSync(schemaPath, "utf-8");
db.exec(schema);

export type Sqlite = typeof db;

export default db;