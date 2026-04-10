import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @IsEmail()
  username: string;

  @IsString()
  password: string;
}
