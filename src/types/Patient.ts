export interface Patient {
  patient_id: string;
  name: string;
  age: number | string | null;
  gender: string;
  blood_pressure: string | null;
  temperature: number | string | null;
  visit_date: string;
  diagnosis: string;
  medications: string;
}

export interface PatientsResponse {
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  metadata: {
    timestamp: string;
    version: string;
    requestId: string;
  };
}

export interface RiskScore {
  bloodPressure: number;
  temperature: number;
  age: number;
  total: number;
}

export interface PatientAnalysis {
  patient: Patient;
  riskScore: RiskScore;
  hasDataQualityIssues: boolean;
  hasFever: boolean;
  isHighRisk: boolean;
}

export interface AssessmentResults {
  high_risk_patients: string[];
  fever_patients: string[];
  data_quality_issues: string[];
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  results: {
    score: number;
    percentage: number;
    status: string;
    breakdown: {
      high_risk: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      fever: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
      data_quality: {
        score: number;
        max: number;
        correct: number;
        submitted: number;
        matches: number;
      };
    };
    feedback: {
      strengths: string[];
      issues: string[];
    };
    attempt_number: number;
    remaining_attempts: number;
    is_personal_best: boolean;
    can_resubmit: boolean;
  };
}