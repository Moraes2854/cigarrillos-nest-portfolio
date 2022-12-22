import { Controller, Post, Body, Patch, Param, Delete, ParseArrayPipe } from '@nestjs/common';

import { VentasService } from './ventas.service';
import { CreateVentaDto, UpdateVentaDto } from './dto';
import { ValidatePayloadExistsPipe } from '../common/pipes';
import { Auth } from '../auth/decorators';
import { FindByDateDto, UpdateDateByDateDto } from '../common/dtos';

@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @Auth('user')
  create(@Body() createVentaDto: CreateVentaDto) {
    return this.ventasService.create(createVentaDto);
  }

  @Post('createSeveral')
  @Auth('user')
  createSeveral(@Body(new ParseArrayPipe({items:CreateVentaDto})) createVentasDto: CreateVentaDto[]) {
    return this.ventasService.createSeveral(createVentasDto);
  }


  @Patch('updateVentasDateByDate')
  @Auth('user')
  updateSeveralVentasDateByDate(
    @Body(ValidatePayloadExistsPipe) updateDateByDateDto: UpdateDateByDateDto
  ){
    return this.ventasService.updateVentasDatesByDate(updateDateByDateDto);
  }


  @Post('deleteSeveralVentasByDate')
  @Auth('user')
  deleteSeveralVentasByDate(
    @Body(ValidatePayloadExistsPipe) findByDateDto: FindByDateDto
  ){
    return this.ventasService.deleteSeveralVentasByDate(findByDateDto);
  }

  @Delete(':id')
  @Auth('user')
  remove(@Param('id') id: string) {
    return this.ventasService.remove(id);
  }

}
