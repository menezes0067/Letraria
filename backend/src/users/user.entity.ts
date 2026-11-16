import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Loan } from "../loan/loan.entity.js";

export enum UserProfile {
    STUDENT = 'aluno',
    LIBRARIAN = 'bibliotecario',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column()
    name: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column({ select: false }) 
    password: string; 
  
    @Column({ type: 'simple-enum', enum: UserProfile })
    profile: UserProfile;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @OneToMany(() => Loan, (loan) => loan.user)
    loans: Loan[];
}