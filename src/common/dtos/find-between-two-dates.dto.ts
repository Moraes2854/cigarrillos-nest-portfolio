import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class FindBetweenTwoDatesDto {

    @Type(() => Date)
    @IsDate()
    initDate:Date;

    @Type(() => Date)
    @IsDate()
    endDate:Date;
}
