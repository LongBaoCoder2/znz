import { IsEmail, IsString, MinLength } from 'class-validator';

export interface CreateUserDto {
  email: string;
  username: string;
  password: string;
}