import type { Patient, RiskScore, PatientAnalysis } from '../types/Patient';

export function calculateBloodPressureRisk(bloodPressure: string | null): number {
  if (!bloodPressure || typeof bloodPressure !== 'string') {
    return 0;
  }
  
  const bpParts = bloodPressure.split('/');
  if (bpParts.length !== 2) {
    return 0;
  }
  
  const systolicStr = bpParts[0].trim();
  const diastolicStr = bpParts[1].trim();
  
  if (!systolicStr || !diastolicStr) {
    return 0;
  }
  
  const systolic = parseFloat(systolicStr);
  const diastolic = parseFloat(diastolicStr);
  
  if (isNaN(systolic) || isNaN(diastolic)) {
    return 0;
  }
  
  const systolicRisk = getSystolicRisk(systolic);
  const diastolicRisk = getDiastolicRisk(diastolic);
  
  return Math.max(systolicRisk, diastolicRisk);
}

function getSystolicRisk(systolic: number): number {
  if (systolic < 120) return 1;
  if (systolic >= 120 && systolic <= 129) return 2;
  if (systolic >= 130 && systolic <= 139) return 3;
  if (systolic >= 140) return 4;
  return 0;
}

function getDiastolicRisk(diastolic: number): number {
  if (diastolic < 80) return 1;
  if (diastolic >= 80 && diastolic <= 89) return 3;
  if (diastolic >= 90) return 4;
  return 0;
}

export function calculateTemperatureRisk(temperature: number | string | null): number {
  if (temperature === null || temperature === undefined) {
    return 0;
  }
  
  const temp = typeof temperature === 'string' ? parseFloat(temperature) : temperature;
  
  if (isNaN(temp)) {
    return 0;
  }
  
  if (temp <= 99.5) return 0;
  if (temp >= 99.6 && temp <= 100.9) return 1;
  if (temp >= 101.0) return 2;
  
  return 0;
}

export function calculateAgeRisk(age: number | string | null): number {
  if (age === null || age === undefined) {
    return 0;
  }
  
  const ageNum = typeof age === 'string' ? parseFloat(age) : age;
  
  if (isNaN(ageNum)) {
    return 0;
  }
  
  if (ageNum < 40) return 1;
  if (ageNum >= 40 && ageNum <= 65) return 1;
  if (ageNum > 65) return 2;
  
  return 0;
}

export function calculateRiskScore(patient: Patient): RiskScore {
  const bloodPressure = calculateBloodPressureRisk(patient.blood_pressure);
  const temperature = calculateTemperatureRisk(patient.temperature);
  const age = calculateAgeRisk(patient.age);
  
  return {
    bloodPressure,
    temperature,
    age,
    total: bloodPressure + temperature + age,
  };
}

export function hasDataQualityIssues(patient: Patient): boolean {
  const bpInvalid = isBloodPressureInvalid(patient.blood_pressure);
  const tempInvalid = isTemperatureInvalid(patient.temperature);
  const ageInvalid = isAgeInvalid(patient.age);
  
  return bpInvalid || tempInvalid || ageInvalid;
}

function isBloodPressureInvalid(bloodPressure: string | null): boolean {
  if (!bloodPressure || typeof bloodPressure !== 'string' || bloodPressure.trim() === '') {
    return true;
  }
  
  const bpParts = bloodPressure.split('/');
  if (bpParts.length !== 2) {
    return true;
  }
  
  const systolicStr = bpParts[0].trim();
  const diastolicStr = bpParts[1].trim();
  
  if (!systolicStr || !diastolicStr) {
    return true;
  }
  
  const systolic = parseFloat(systolicStr);
  const diastolic = parseFloat(diastolicStr);
  
  return isNaN(systolic) || isNaN(diastolic);
}

function isTemperatureInvalid(temperature: number | string | null): boolean {
  if (temperature === null || temperature === undefined) {
    return true;
  }
  
  const temp = typeof temperature === 'string' ? parseFloat(temperature) : temperature;
  return isNaN(temp);
}

function isAgeInvalid(age: number | string | null): boolean {
  if (age === null || age === undefined) {
    return true;
  }
  
  const ageNum = typeof age === 'string' ? parseFloat(age) : age;
  return isNaN(ageNum);
}

export function hasFever(patient: Patient): boolean {
  if (patient.temperature === null || patient.temperature === undefined) {
    return false;
  }
  
  const temp = typeof patient.temperature === 'string' ? parseFloat(patient.temperature) : patient.temperature;
  
  if (isNaN(temp)) {
    return false;
  }
  
  return temp >= 99.6;
}

export function analyzePatient(patient: Patient): PatientAnalysis {
  const riskScore = calculateRiskScore(patient);
  const hasDataIssues = hasDataQualityIssues(patient);
  
  // If patient has data issues, exclude from risk/fever calculations
  const patientHasFever = hasDataIssues ? false : hasFever(patient);
  const isHighRisk = hasDataIssues ? false : riskScore.total >= 4;
  
  return {
    patient,
    riskScore,
    hasDataQualityIssues: hasDataIssues,
    hasFever: patientHasFever,
    isHighRisk,
  };
}