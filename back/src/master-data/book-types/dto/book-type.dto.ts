import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateBookTypeDto {
  @IsString() @IsNotEmpty() typeName!: string;
}

export class UpdateBookTypeDto {
  @IsOptional() @IsString() @IsNotEmpty() typeName?: string;
}
