import { Type } from "class-transformer";
import { IsDate } from "class-validator";

export class FindByDateDto {
    @Type(() => Date)
    @IsDate()
    date:Date;
}
