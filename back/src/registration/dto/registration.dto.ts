import { IsNotEmpty, IsString, Length } from 'class-validator';

export class RegisterDto {
  @IsString() @IsNotEmpty() name!: string;
  @IsString() @IsNotEmpty() phone!: string;
}

export class VerifyOtpDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @Length(6, 6) code!: string;
}

export class ResendOtpDto {
  @IsString() @IsNotEmpty() phone!: string;
}
