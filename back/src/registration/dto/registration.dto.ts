import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() phone!: string;
  @IsEmail() email!: string;
}

export class VerifyOtpDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @Length(6, 6) code!: string;
}

export class ResendOtpDto {
  @IsString() @IsNotEmpty() phone!: string;
}

export class CustomerLoginRequestDto {
  @IsEmail() email!: string;
}

export class CustomerLoginVerifyDto {
  @IsEmail() email!: string;
  @IsString() @Length(6, 6) code!: string;
}
