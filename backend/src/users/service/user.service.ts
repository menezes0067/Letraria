import { Injectable } from '@nestjs/common';
import { UserMapper } from '../mappers/user.mapper.js';
import { UserRequestDto } from '../dtos/user.request.dto.js';
import { UserResponseDto } from '../dtos/user.response.dto.js';
import { UserRepository } from '../repository/user.repository.js';

import * as bcrypt from 'bcrypt';


@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async save(data: UserRequestDto): Promise<UserResponseDto> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await this.userRepository.save({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      profile: data.profile,
    });

    return UserMapper.toResponse(user);
  }
}
