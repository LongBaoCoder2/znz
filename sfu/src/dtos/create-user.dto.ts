import { IsEmail, IsString, MinLength } from 'class-validator';

export interface CreateUserDto {
  username: string;
  password: string;
}