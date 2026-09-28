import { Ilendable } from "../interfaces/Ilendable.ts"

export type BookFormat = "fisico" | "ebook" | "audiobook";

export interface BookData {
	id: string;
	title: string;
	author: string;
	year: number;
	availableQuantity: number;
	format: BookFormat;
	createdAt: string;
}

abstract class Book implements Ilendable {
	protected readonly _createdAt: string;
	private readonly _id: string;

	constructor(
		id: string,
		protected title: string,
		protected author: string,
		protected year: number,
		protected availableQuantity: number = 1,
		protected _format?: string,
		createdAt?: string
	) {
		this._id = id;
		this._createdAt = createdAt ?? new Date().toISOString()
	}

	get id(): string { return this._id; }
	get titulo(): string { return this.title; }
	get autor(): string { return this.author; }
	get ano(): number { return this.year; }
	get quantidadeDisponivel(): number { return this.availableQuantity; }
	get format(): string | undefined { return this._format; }
	get createdAt(): string { return this._createdAt; }

	toData(): BookData {
		return {
			id: this._id,
			title: this.title,
			author: this.author,
			year: this.year,
			availableQuantity: this.availableQuantity,
			format: this.getType() as BookFormat,
			createdAt: this._createdAt,
		};
	}

	abstract calculateDueDateInDays(): number;

	abstract calculateFine(overdueDays: number): number;

	abstract getType(): string;

	isAvailable(): boolean {
		return this.availableQuantity > 0;
	}
}

export { Book }