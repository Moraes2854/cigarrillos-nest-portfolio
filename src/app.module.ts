import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EnvConfiguration } from './config/app.config';

import { CigarrillosModule } from './cigarrillos/cigarrillos.module';
import { VentasModule } from './ventas/ventas.module';
import { ComprasModule } from './compras/compras.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { CommonModule } from './common/common.module';
import { DatosModule } from './datos/datos.module';
import { BackupModule } from './backup/backup.module';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
      exclude:['api/*'],
    }),
    ConfigModule.forRoot({
      load:[ EnvConfiguration ],
    }),
    TypeOrmModule.forRoot({
      ssl:process.env.STAGE === 'prod',
      extra:{
        ssl:process.env.STAGE === 'prod' 
        ? { rejectUnauthorized:false}
        : null,
      },
      type:'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      synchronize:true,
      autoLoadEntities:true,
    }),
    CigarrillosModule, 
    ComprasModule,  
    VentasModule, 
    AuthModule, 
    BackupModule,
    CommonModule, 
    DatosModule,
    SeedModule, 
  ],

})
export class AppModule {}
