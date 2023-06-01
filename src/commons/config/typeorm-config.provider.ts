import { Injectable, Inject } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Hospitals } from 'src/hospitals/hospitals.entity';
import { Reports } from 'src/reports/reports.entity';
import dbConfig from '../../../config/db.config';

@Injectable()
export class MysqlConfigProvider implements TypeOrmOptionsFactory {
  constructor(
    @Inject(dbConfig.KEY) private config: ConfigType<typeof dbConfig>,
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.config.host,
      port: this.config.port,
      username: this.config.username,
      password: this.config.password,
      database: this.config.database,
      entities: [Hospitals, Reports],
      synchronize: false, //true - 변경시마다 새롭게!
      logging: true,
    };
  }
}
