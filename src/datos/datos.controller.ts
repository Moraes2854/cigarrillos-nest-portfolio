import { Controller, Get, Post, Body} from '@nestjs/common';
import { DatosService, DatoResponse } from './datos.service';
import { FindByDateDto, FindBetweenTwoDatesDto} from '../common/dtos';


@Controller('datos')
export class DatosController {
  constructor(private readonly datosService: DatosService) {}

  @Get('generales')
  generales(): Promise<DatoResponse> {
    return this.datosService.general();
  }

  @Get('CigarrillosMasVendidos')
  masVendidos(): Promise<DatoResponse>{
    return this.datosService.cigarrillosMasVendidos();
  }

  @Get('CigarrillosMasComprados')
  masComprados(): Promise<DatoResponse>{
    return this.datosService.cigarrillosMasComprados();
  }

  @Get('DiasDeMayorVenta')
  diasDeMayorVenta(): Promise<DatoResponse>{
    return this.datosService.diasMayorVenta();
  }

  @Get('DiasDeMayorCompra')
  diasDeMayorCompra(): Promise<DatoResponse>{
    return this.datosService.diasMayorCompra();
  }

  @Post('VentasDelDia')
  ventasDelDia(
    @Body()findByDateDto:FindByDateDto,
  ): Promise<DatoResponse>{
    return this.datosService.ventasDelDia(findByDateDto);
  }
  
  @Post('ComprasDelDia')
  comprasDelDia(
    @Body()findByDateDto:FindByDateDto,
  ): Promise<DatoResponse>{
    return this.datosService.comprasDelDia(findByDateDto);
  }

  @Post('VentasEntreDosDias')
  ventasEntreDosDias(
    @Body()findBetweenTwoDatesDto:FindBetweenTwoDatesDto,
  ): Promise<DatoResponse>{
    return this.datosService.ventasEntreDosDias(findBetweenTwoDatesDto);
  }

  @Post('ComprasEntreDosDias')
  comprasEntreDosDias(
    @Body()findBetweenTwoDatesDto:FindBetweenTwoDatesDto,
  ): Promise<DatoResponse>{
    return this.datosService.comprasEntreDosDias(findBetweenTwoDatesDto);
  }

  @Get('MayorVentaPorCigarrillo')
  mayorVentaPorCigarrillo(): Promise<DatoResponse>{
    return this.datosService.cigarrillosMasVendidos();
  }

  @Post('UnidadesVendidasEntreDosDias')
  unidadesVendidasEntreDosDias(
    @Body()findBetweenTwoDatesDto:FindBetweenTwoDatesDto,
  ): Promise<DatoResponse>{
    return this.datosService.unidadesVendidasEntreDosDias(findBetweenTwoDatesDto);
  }
}
