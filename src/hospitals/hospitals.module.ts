import { Module } from '@nestjs/common';
import { HospitalsController } from './controller/hospitals.controller';
import { HospitalsService } from './service/hospitals.service';
import { HospitalsRepository } from './hospitals.repository';
import { ReportsRepository } from '../reports/reports.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Hospitals } from './hospitals.entity';
import { Crawling } from '../commons/middlewares/crawling';
import { KakaoMapService } from '../commons/providers/kakao-map.provider';
import { CacheModule } from '@nestjs/cache-manager';
import { RedisConfigProvider } from '../commons/providers/redis-config.provider';

@Module({
  imports: [
    TypeOrmModule.forFeature([Hospitals]),
    CacheModule.registerAsync({
      useClass: RedisConfigProvider,
    }),
  ],
  controllers: [HospitalsController],
  providers: [
    HospitalsService,
    HospitalsRepository,
    ReportsRepository,
    Crawling,
    KakaoMapService,
  ],
  exports: [HospitalsService, HospitalsRepository],
})
export class HospitalsModule {}
