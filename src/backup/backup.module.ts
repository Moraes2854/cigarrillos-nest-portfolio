import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BackupService } from './backup.service';
import { BackupController } from './backup.controller';

import { CigarrillosModule } from '../cigarrillos/cigarrillos.module';
import { ComprasModule } from '../compras/compras.module';
import { VentasModule } from '../ventas/ventas.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  controllers: [BackupController],
  providers: [BackupService],
  imports:[
    AuthModule,
    CigarrillosModule,
    ComprasModule,
    ConfigModule,
    VentasModule
  ]
})
export class BackupModule {}
