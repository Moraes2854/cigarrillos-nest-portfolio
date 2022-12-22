import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateCigarrilloDto {
    
    @IsString()
    name:string;

    @IsNumber()
    @IsPositive()
    buy_price:number;

    @IsNumber()
    @IsPositive()
    sell_price:number;
}
