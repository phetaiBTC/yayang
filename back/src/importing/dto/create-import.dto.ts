import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateImportLineDto {
  @IsInt() @IsPositive() bookId!: number;
  @IsInt() @Min(1) qty!: number;
}

export class CreateImportDto {
  @IsInt() @IsPositive() poId!: number;

  // Optional received quantities. When omitted, the PO's ordered quantities are used.
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImportLineDto)
  lines?: CreateImportLineDto[];
}
