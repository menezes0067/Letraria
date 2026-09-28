import { randomUUID } from "node:crypto";

import { Book, type BookData, type BookFormat } from "../models/book.ts";
import { Audiobook } from "../models/audiobook.ts";
import { Ebook } from "../models/ebook.ts";
import { Fisic } from "../models/fisic.ts";

type BookConstructor = new (
	id: string,
	title: string,
	author: string,
	year: number,
	availableQuantity: number,
	format: string,
	createdAt: string,
	durationInMinutes?: number,
) => Book;

const REGISTRY: Record<BookFormat, BookConstructor> = {
	fisico: Fisic,
	ebook: Ebook,
	audiobook: Audiobook,
};

export class BookBuilder {
	private _id?: string;
	private _title = "";
	private _author = "";
	private _year?: number;
	private _availableQuantity?: number;
	private _format?: BookFormat;
	private _durationInMinutes?: number;
	private _createdAt?: string;

	withId(id: string): this {
		this._id = id;
		return this;
	}

	withTitle(title: string): this {
		this._title = title;
		return this;
	}

	withAuthor(author: string): this {
		this._author = author;
		return this;
	}

	withYear(year: number): this {
		this._year = year;
		return this;
	}

	withAvailableQuantity(availableQuantity: number): this {
		this._availableQuantity = availableQuantity;
		return this;
	}

	withFormat(format: BookFormat): this {
		this._format = format;
		return this;
	}

	withDurationInMinutes(durationInMinutes: number): this {
		this._durationInMinutes = durationInMinutes;
		return this;
	}

	withCreatedAt(createdAt: string): this {
		this._createdAt = createdAt;
		return this;
	}

	static fromData(data: BookData): BookBuilder {
		return new BookBuilder()
			.withId(data.id)
			.withTitle(data.title)
			.withAuthor(data.author)
			.withYear(data.year)
			.withAvailableQuantity(data.availableQuantity)
			.withFormat(data.format)
			.withCreatedAt(data.createdAt);
	}

	build(): Book {
		if (!this._format) throw new Error("Formato não definido antes do build.");
		const Constructor = REGISTRY[this._format];
		if (!Constructor) throw new Error(`Formato de livro desconhecido: ${this._format}`);
		return new Constructor(
			this._id ?? randomUUID(),
			this._title.trim(),
			this._author.trim(),
			this._year ?? 0,
			this._availableQuantity ?? 1,
			this._format,
			this._createdAt ?? new Date().toISOString(),
			this._durationInMinutes,
		);
	}
}