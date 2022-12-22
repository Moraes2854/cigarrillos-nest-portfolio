import { Controller, Get, Post, Body, Patch, Param, Delete, ParseArrayPipe } from '@nestjs/common';
import { Auth } from '../auth/decorators';

import { ParseNameToUppercase, ParseNameWithoutFinalSpaces } from '../common/pipes';
import { CigarrillosService } from './cigarrillos.service';
import { CreateCigarrilloDto } from './dto';
import { ValidateCigarrilloExistsPipe } from './pipes/ValidateCigarrillo.pipe';
import { UpdateSeveralCigarrilloDto } from './dto/update-several-cigarrillos.dto';


@Controller('cigarrillos')
export class CigarrillosController {
  constructor(private readonly cigarrillosService: CigarrillosService) {}

  @Post()
  @Auth('user')
  create(@Body(ParseNameToUppercase, ParseNameWithoutFinalSpaces) createCigarrilloDto: CreateCigarrilloDto) {
    return this.cigarrillosService.create(createCigarrilloDto);
  }

  @Get()
  findAll() {
    return this.cigarrillosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cigarrillosService.findOne(id);
  }

  // @Patch(':id')
  // @Auth('user')
  // update(@Param('id', ValidateCigarrilloExistsPipe) id: string, @Body(ValidatePayloadExistsPipe) updateCigarrilloDto: UpdateCigarrilloDto) {
  //   return this.cigarrillosService.update(id, updateCigarrilloDto);
  // }

  @Patch('/updateSeveral')
  @Auth('user')
  updateSeveral(
    @Body(new ParseArrayPipe({items:UpdateSeveralCigarrilloDto})) updateSeveralCigarrilloDto: UpdateSeveralCigarrilloDto[]
  ){
    return this.cigarrillosService.updateSeveral(updateSeveralCigarrilloDto);
  }

  @Delete(':id')
  @Auth('user')
  remove(@Param('id', ValidateCigarrilloExistsPipe) id: string) {
    return this.cigarrillosService.remove(id);
  }
}
