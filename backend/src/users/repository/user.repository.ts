import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../user.entity.js";
import { Repository } from "typeorm";
import { IUserRepository } from "./iuser.repository.js";

@Injectable()
export class UserRepository implements IUserRepository{
    constructor(@InjectRepository(User) private readonly repository: Repository<User>) {}

    async save(user: Partial<User>): Promise<User> {
        const newUser = this.repository.create(user);
        return this.repository.save(newUser);
    }
}