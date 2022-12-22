import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { AuthModule } from '../auth/auth.module';
import { CigarrillosModule } from '../cigarrillos/cigarrillos.module';
import { ComprasModule } from '../compras/compras.module';
import { VentasModule } from '../ventas/ventas.module';

@Module({
  controllers: [SeedController],
  providers: [
    SeedService,
    ConfigService
  ],
  imports:[
    AuthModule,
    CigarrillosModule,
    ComprasModule,
    VentasModule,
  ]
})
export class SeedModule {}
