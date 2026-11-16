import { UserResponseDto } from '../dtos/user.response.dto.js';
import { User } from '../user.entity.js';

export class UserMapper {
  static toResponse(user: User): UserResponseDto {
    return new UserResponseDto({
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      createdAt: user.createdAt,
    });
  }
}
