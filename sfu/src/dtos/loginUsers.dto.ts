import { IsString } from 'class-validator';

export class LoginUserDto {
  @IsString()
  public username: string;

  @IsString()
  public password: string;

}
