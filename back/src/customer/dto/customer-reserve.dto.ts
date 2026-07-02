import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { CreateReservationLineDto } from '../../reservation/dto/reservation.dto';

export class CustomerReserveDto {
  // A deposit is required to place a reservation.
  @IsNumber() @IsPositive() deposit!: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateReservationLineDto)
  lines!: CreateReservationLineDto[];
}
