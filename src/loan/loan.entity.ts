import {
    Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn,
  } from 'typeorm';
  import { Book } from '../books/book.entity.js';
  import { User } from '../users/user.entity.js';
  
  @Entity('loans')
  export class Loan {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    bookId: string;
  
    @ManyToOne(() => Book, (book) => book.loans, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bookId' })
    book: Book;
  
    @Column()
    userId: string;
  
    @ManyToOne(() => User, (user) => user.loans)
    @JoinColumn({ name: 'userId' })
    user: User;
  
    @Column('date')
    loanDate: string;
  
    @Column('date')
    expectedReturnDate: string;
  
    @Column('date', { nullable: true })
    actualReturnDate: string | null; 
  
    @Column('float', { default: 0 })
    fine: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    isOpen(): boolean {
      return this.actualReturnDate === null;
    }
  }