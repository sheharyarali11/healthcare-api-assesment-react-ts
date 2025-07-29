import type { Patient, PatientAnalysis, AssessmentResults } from '../types/Patient';
import { analyzePatient } from './riskScoring';

export function analyzeAllPatients(patients: Patient[]): PatientAnalysis[] {
  return patients.map(analyzePatient);
}

export function generateAssessmentResults(analyses: PatientAnalysis[]): AssessmentResults {
  const highRiskPatients: string[] = [];
  const feverPatients: string[] = [];
  const dataQualityIssues: string[] = [];
  
  analyses.forEach(analysis => {
    if (analysis.isHighRisk) {
      highRiskPatients.push(analysis.patient.patient_id);
    }
    
    if (analysis.hasFever) {
      feverPatients.push(analysis.patient.patient_id);
    }
    
    if (analysis.hasDataQualityIssues) {
      dataQualityIssues.push(analysis.patient.patient_id);
    }
  });
  
  return {
    high_risk_patients: highRiskPatients,
    fever_patients: feverPatients,
    data_quality_issues: dataQualityIssues,
  };
}

export function getPatientSummary(analyses: PatientAnalysis[]) {
  const totalPatients = analyses.length;
  const highRiskCount = analyses.filter(a => a.isHighRisk).length;
  const feverCount = analyses.filter(a => a.hasFever).length;
  const dataQualityCount = analyses.filter(a => a.hasDataQualityIssues).length;
  
  return {
    totalPatients,
    highRiskCount,
    feverCount,
    dataQualityCount,
  };
}