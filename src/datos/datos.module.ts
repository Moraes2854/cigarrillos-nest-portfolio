import { Module } from '@nestjs/common';
import { DatosService } from './datos.service';
import { DatosController } from './datos.controller';
import { AuthModule } from '../auth/auth.module';
import { CigarrillosModule } from '../cigarrillos/cigarrillos.module';
import { ComprasModule } from '../compras/compras.module';
import { VentasModule } from '../ventas/ventas.module';

@Module({
  controllers: [DatosController],
  providers: [DatosService],
  imports:[
    AuthModule,
    CigarrillosModule,
    ComprasModule,
    VentasModule
  ]
})
export class DatosModule {}
