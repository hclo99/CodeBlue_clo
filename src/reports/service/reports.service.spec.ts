import { Test } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportsRepository } from '../reports.repository';
import { NotFoundException, HttpException } from '@nestjs/common';
import { Reports } from '../reports.entity';
import { Gender } from '../reports.enum';

describe('ReportsService Unit Testing', () => {
  let reportsService: ReportsService;
  let reportsRepository: ReportsRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: ReportsRepository,
          useValue: {
            findReport: jest.fn(),
            updateReportPatientInfo: jest.fn(),
          },
        },
      ],
    }).compile();

    reportsService = moduleRef.get(ReportsService);
    reportsRepository = moduleRef.get(ReportsRepository);
  });

  describe('updateReportPatientInfo()', () => {
    const report_id = 1;
    const updatedPatientInfo = {
      name: '홍길동',
      age: 20,
      gender: Gender.M,
    };

    it('should update the patient location', async () => {
      const report = {} as Reports;
      jest.spyOn(reportsRepository, 'findReport').mockResolvedValueOnce(report);
      jest
        .spyOn(reportsRepository, 'updateReportPatientInfo')
        .mockResolvedValueOnce(report);

      const result = await reportsService.updateReportPatientInfo(
        report_id,
        updatedPatientInfo,
      );

      expect(reportsRepository.findReport).toHaveBeenCalledWith(report_id);
      expect(reportsRepository.updateReportPatientInfo).toHaveBeenCalledWith(
        report_id,
        updatedPatientInfo,
      );
      expect(result).toEqual(report);
    });

    it('should throw NotFoundException if the report does not exist', async () => {
      jest.spyOn(reportsRepository, 'findReport').mockResolvedValueOnce(null);

      await expect(
        reportsService.updateReportPatientInfo(report_id, updatedPatientInfo),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException for other errors', async () => {
      const error = new Error('Some error');
      jest.spyOn(reportsRepository, 'findReport').mockRejectedValueOnce(error);

      await expect(
        reportsService.updateReportPatientInfo(report_id, updatedPatientInfo),
      ).rejects.toThrow(HttpException);
    });
  });
});
