import { User } from "../models/user.ts";

export interface IUserDAO {
    create(data: User): void;
    findById(id: string): User | null;
    findByEmail(email: string): User | null;
    findAll(): User[];  
}