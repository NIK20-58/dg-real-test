import { IsNumber, IsPositive, IsString, IsInt } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsPositive()
  userId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  action: string;
}
