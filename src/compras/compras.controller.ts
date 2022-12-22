import { Controller, Post, Body, Patch, Param, Delete, ParseArrayPipe } from '@nestjs/common';

import { ValidatePayloadExistsPipe } from '../common/pipes';
import { ComprasService } from './compras.service';
import { FindByDateDto, UpdateDateByDateDto } from '../common/dtos';
import { CreateCompraDto, UpdateCompraDto } from './dto';
import { Auth } from '../auth/decorators';

@Controller('compras')
export class ComprasController {
  constructor(private readonly comprasService: ComprasService) {}

  @Post()
  @Auth('user')
  create(@Body() createCompraDto: CreateCompraDto) {
    return this.comprasService.create(createCompraDto);
  }
  
  @Post('createSeveral')
  @Auth('user')
  createSeveral(@Body(new ParseArrayPipe({items:CreateCompraDto})) createComprasDto: CreateCompraDto[]) {
    return this.comprasService.createSeveral(createComprasDto);
  }

  @Patch('/updateComprasDateByDate')
  @Auth('user')
  updateSeveralComprasDateByDate(
    @Body(ValidatePayloadExistsPipe) updateDateByDateDto: UpdateDateByDateDto
  ){
    return this.comprasService.updateComprasDatesByDate(updateDateByDateDto);
  }


  @Post('deleteSeveralComprasByDate')
  @Auth('user')
  deleteSeveralComprasByDate(
    @Body(ValidatePayloadExistsPipe) findByDateDto: FindByDateDto
  ){
    return this.comprasService.deleteSeveralComprasByDate(findByDateDto);
  }


  @Delete(':id')
  @Auth('user')
  remove(@Param('id') id: string) {
    return this.comprasService.remove(id);
  }

}
