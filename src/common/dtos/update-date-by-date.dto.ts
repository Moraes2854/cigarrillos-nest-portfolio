import { Type,  } from "class-transformer";
import { IsDate } from 'class-validator';

export class UpdateDateByDateDto {

    @Type(() => Date)
    @IsDate()
    // @IsString()
    dateToFindObjects:Date;

    @Type(() => Date)
    @IsDate()
    // @IsString()
    newDate:Date;

}