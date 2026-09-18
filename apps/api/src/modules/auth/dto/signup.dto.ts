import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_]+$/, { message: 'username must be alphanumeric + underscore' })
  username!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  name!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(100)
  password!: string;
}
