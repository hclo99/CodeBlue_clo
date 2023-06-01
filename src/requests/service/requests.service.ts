import {
  Injectable,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HospitalsRepository } from './../../hospitals/hospitals.repository';
import { ReportsRepository } from '../../reports/reports.repository';
import { RequestsRepository } from '../../requests/requests.repository';
import { EntityManager } from 'typeorm';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Reports } from 'src/reports/reports.entity';

@Injectable()
export class RequestsService {
  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly hospitalsRepository: HospitalsRepository,
    private readonly requestsRepository: RequestsRepository,
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  async getAllRequests(): Promise<Reports[]> {
    const allReports = await this.requestsRepository.getAllRequests();
    return allReports;
  }

  async getSearchRequests(queries: object): Promise<Reports[]> {
    const allReports = await this.requestsRepository.getSearchRequests(queries);
    return allReports;
  }

  async createRequest(report_id: number, hospital_id: number) {
    const updatedReport = await this.entityManager.transaction(
      'READ COMMITTED',
      async () => {
        try {
          const hospital = await this.hospitalsRepository.findHospital(
            hospital_id,
          );
          if (!hospital) {
            throw new NotFoundException('병원이 존재하지 않습니다.');
          }

          const report = await this.reportsRepository.findReport(report_id);
          if (!report) {
            throw new NotFoundException('증상 보고서가 존재하지 않습니다.');
          }
          if (report.is_sent) {
            throw new HttpException(
              '이미 전송된 증상 보고서입니다.',
              HttpStatus.BAD_REQUEST,
            );
          }

          const availableBeds = hospital.available_beds;
          if (availableBeds === 0) {
            throw new HttpException(
              '병원 이송 신청이 마감되었습니다. 다른 병원에 신청하시길 바랍니다.',
              HttpStatus.SERVICE_UNAVAILABLE,
            );
          }

          // 해당 병원의 available_beds를 1 감소
          await this.hospitalsRepository.updateAvailableBeds(hospital_id);

          // 해당 report의 is_sent를 true로 변경
          return await this.reportsRepository.updateReportBeingSent(report_id);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw error;
          }
          throw new HttpException(
            error.response || '증상 보고서 전송에 실패하였습니다.',
            error.status || HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }
      },
    );
    return updatedReport;
  }
}
