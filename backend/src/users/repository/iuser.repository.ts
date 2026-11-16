import { User } from "../user.entity.js";

export interface IUserRepository {
    save(user: Partial<User>): Promise<User>;
}
