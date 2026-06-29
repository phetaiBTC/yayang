import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNumber,
  IsPositive,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateReservationLineDto {
  @IsInt() @IsPositive() bookId!: number;
  @IsInt() @Min(1) qty!: number;
}

export class CreateReservationDto {
  @IsInt() @IsPositive() cusId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReservationLineDto)
  lines!: CreateReservationLineDto[];
}

export class DepositDto {
  @IsNumber() @Min(0) deposit!: number;
}

export class UpdateStatusDto {
  @IsIn(['ready', 'completed', 'cancelled']) status!: 'ready' | 'completed' | 'cancelled';
}
