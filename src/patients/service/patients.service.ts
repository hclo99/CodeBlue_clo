import { Injectable } from '@nestjs/common';
import {
  Symptom,
  circulatorySymptoms,
  emergencySymptoms,
  injurySymptoms,
  neurologicalSymptoms,
  otherSymptoms,
  respiratorySymptoms,
} from '../../reports/constants/symtoms';
import { Patients } from '../patients.entity';
import { PatientInfoDTO } from '../../reports/dto/patientinfo.dto';
import { PatientsRepository } from '../patients.repository';
import { Reports } from 'src/reports/reports.entity';

@Injectable()
export class PatientsService {
  //저장하기 위한 주입
  constructor(private patientsRepository: PatientsRepository) {}

  //test를 위한 정의
  private symptomCategories: Symptom[];

  setSymptomCategories(categories: Symptom[]): void {
    this.symptomCategories = categories;
  }

  private readonly defaultSymptomCategories = [
    emergencySymptoms,
    neurologicalSymptoms,
    respiratorySymptoms,
    circulatorySymptoms,
    injurySymptoms,
    otherSymptoms,
  ];

  calculateEmergencyLevel(symptoms: string[]): number {
    const symptomScores: number[] = [];
    const symptomCategories =
      this.symptomCategories || this.defaultSymptomCategories;

    symptoms.forEach((symptom) => {
      //같은 카테고리에 정의된 증상들 모으기 위함
      const categoryIndex = this.getSymptomCategoryIndex(
        symptom,
        symptomCategories,
      );

      const score = this.getSymptomScore(
        symptom,
        this.symptomCategories[categoryIndex],
      );
      //같은 카테고리면 가중치 주기
      const count = symptoms.filter((s) => s === symptom).length;
      const adjustedScore = score + 2 * count;
      symptomScores.push(adjustedScore);
    });

    const totalScore = symptomScores.reduce((total, score) => total + score, 0);

    return this.emergencyLevelByScore(totalScore);
  }

  private emergencyLevelByScore(score: number): number {
    if (score > 80) {
      return 5;
    } else if (score > 60) {
      return 4;
    } else if (score > 40) {
      return 3;
    } else if (score > 20) {
      return 2;
    } else {
      return 1;
    }
  }

  private getSymptomCategoryIndex(
    symptom: string,
    symptomCategories: Symptom[],
  ): number {
    for (let i = 0; i < symptomCategories.length; i++) {
      if (symptomCategories[i].hasOwnProperty(symptom)) {
        return i;
      }
    }
    return -1; //카테고리안에 속하지 않는 경우 -> 텍스트 마이닝을 위한 코드
  }

  private getSymptomScore(symptom: string, symptomCategory: Symptom): number {
    return symptomCategory[symptom] || 0;
  }
}
