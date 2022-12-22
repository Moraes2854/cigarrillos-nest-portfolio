import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { Venta } from './entities/venta.entity';
import { CigarrillosModule } from '../cigarrillos/cigarrillos.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [VentasController],
  providers: [VentasService],
  imports:[
    AuthModule,
    CigarrillosModule,
    TypeOrmModule.forFeature([Venta])
  ],
  exports:[
    VentasService,
    TypeOrmModule,
  ]

})
export class VentasModule {}
