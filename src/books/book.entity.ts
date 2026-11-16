import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Loan } from "../loan/loan.entity.js";

enum BookFormat {
    FISIC = 'fisico',
    EBOOK = 'ebook',
    AUDIOBOOK = 'audiobook'
}

@Entity('book')
export class Book {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column('int')
    year: number;

    @Column({ type: 'simple-enum', enum: BookFormat })
    format: BookFormat;

    @Column('int', { default: 1 })
    availableQuantity: number;

    @Column('int', { nullable: true })
    durationInMinutes: number | null; 

    @CreateDateColumn()
    createdAt: Date;

    @OneToMany(() => Loan, (loan) => loan.book)
    loans: Loan[];
}