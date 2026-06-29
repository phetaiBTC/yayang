import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsInt() @IsPositive() catId!: number;
  @IsInt() @IsPositive() typeId!: number;
  @IsNumber() @Min(0) price!: number;
}

export class UpdateBookDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsInt() @IsPositive() catId?: number;
  @IsOptional() @IsInt() @IsPositive() typeId?: number;
  @IsOptional() @IsNumber() @Min(0) price?: number;
}
