import { UserProfile } from "../user.entity.js";

interface UserResponseData {
  id: string;
  name: string;
  email: string;
  profile: UserProfile;
  createdAt: Date;
}

export class UserResponseDto {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly profile: UserProfile;
  readonly createdAt: Date;

  constructor(data: UserResponseData) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.profile = data.profile;
    this.createdAt = data.createdAt;
  }
}