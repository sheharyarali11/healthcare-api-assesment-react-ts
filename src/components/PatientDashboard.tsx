import { useState, useEffect } from 'react';
import type { Patient, PatientAnalysis, SubmissionResponse } from '../types/Patient';
import { fetchAllPatients, submitAssessment } from '../services/apiService';
import { analyzeAllPatients, generateAssessmentResults, getPatientSummary } from '../utils/patientAnalysis';
import { showToast } from '../utils/toast';

export default function PatientDashboard() {
  const [analyses, setAnalyses] = useState<PatientAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState<SubmissionResponse | null>(null);

  const loadPatients = async () => {
    setLoading(true);
    
    try {
      const patientsData = await fetchAllPatients();
      
      const analysisResults = analyzeAllPatients(patientsData);
      setAnalyses(analysisResults);
      showToast(`Loaded ${patientsData.length} patients successfully`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load patients';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async () => {
    if (analyses.length === 0) return;
    
    setSubmitting(true);
    
    try {
      const results = generateAssessmentResults(analyses);
      const response = await submitAssessment(results);
      setSubmission(response);
      showToast(`Assessment submitted! Score: ${response.results.percentage}%`, 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit assessment';
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const summary = analyses.length > 0 ? getPatientSummary(analyses) : null;
  const results = analyses.length > 0 ? generateAssessmentResults(analyses) : null;

  return (
    <div style={{ padding: '20px'}}>
      <h1>Healthcare Patient Risk Assessment</h1>
      

      {loading ? (
        <div>Loading patients...</div>
      ) : (
        <>
          {summary && (
            <div style={{ 
              background: '#f5f5f5', 
              padding: '32px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h2>Summary</h2>
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div>
                  <strong>Total Patients:</strong> {summary.totalPatients}
                </div>
                <div style={{ color: '#d32f2f' }}>
                  <strong>High Risk:</strong> {summary.highRiskCount}
                </div>
                <div style={{ color: '#f57c00' }}>
                  <strong>Fever:</strong> {summary.feverCount}
                </div>
                <div style={{ color: '#7b1fa2' }}>
                  <strong>Data Issues:</strong> {summary.dataQualityCount}
                </div>
              </div>
            </div>
          )}

          {results && (
            <div style={{ marginBottom: '20px' }}>
              <h2>Assessment Results</h2>
              
              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#d32f2f' }}>High Risk Patients ({results.high_risk_patients.length})</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {results.high_risk_patients.join(', ') || 'None'}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#f57c00' }}>Fever Patients ({results.fever_patients.length})</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {results.fever_patients.join(', ') || 'None'}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <h3 style={{ color: '#7b1fa2' }}>Data Quality Issues ({results.data_quality_issues.length})</h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {results.data_quality_issues.join(', ') || 'None'}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={handleSubmitAssessment}
              disabled={submitting || analyses.length === 0}
              style={{
                background: '#1976d2',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                marginRight: '10px'
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Assessment'}
            </button>
            
            <button
              onClick={loadPatients}
              disabled={loading}
              style={{
                background: '#388e3c',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Loading...' : 'Reload Data'}
            </button>
          </div>

          {submission && (
            <div style={{ 
              background: submission.success ? '#e8f5e8' : '#ffebee',
              color: submission.success ? '#2e7d32' : '#c62828',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <h3>Submission Result</h3>
              <p><strong>Status:</strong> {submission.results.status}</p>
              <p><strong>Score:</strong> {submission.results.score.toFixed(2)} ({submission.results.percentage}%)</p>
              
              <div style={{ marginTop: '10px' }}>
                <h4>Breakdown:</h4>
                <ul>
                  <li>High Risk: {submission.results.breakdown.high_risk.score}/{submission.results.breakdown.high_risk.max}</li>
                  <li>Fever: {submission.results.breakdown.fever.score}/{submission.results.breakdown.fever.max}</li>
                  <li>Data Quality: {submission.results.breakdown.data_quality.score}/{submission.results.breakdown.data_quality.max}</li>
                </ul>
              </div>

              {submission.results.feedback.strengths.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4>Strengths:</h4>
                  <ul>
                    {submission.results.feedback.strengths.map((strength, idx) => (
                      <li key={idx}>{strength}</li>
                    ))}
                  </ul>
                </div>
              )}

              {submission.results.feedback.issues.length > 0 && (
                <div style={{ marginTop: '10px' }}>
                  <h4>Issues:</h4>
                  <ul>
                    {submission.results.feedback.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}

              <p style={{ marginTop: '10px', fontSize: '14px' }}>
                Attempt {submission.results.attempt_number} - {submission.results.remaining_attempts} remaining
              </p>
            </div>
          )}

          {analyses.length > 0 && (
            <div>
              <h2>Patient Details</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Age</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>BP</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Temp</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Risk Score</th>
                      <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>Alerts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map(analysis => (
                      <tr key={analysis.patient.patient_id}>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.patient.patient_id}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.patient.name}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.patient.age}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.patient.blood_pressure}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.patient.temperature}
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          {analysis.riskScore.total} 
                          <small> (BP:{analysis.riskScore.bloodPressure} T:{analysis.riskScore.temperature} A:{analysis.riskScore.age})</small>
                        </td>
                        <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                            {analysis.isHighRisk && (
                              <span style={{ 
                                background: '#ffcdd2', 
                                color: '#d32f2f', 
                                padding: '2px 6px', 
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                High Risk
                              </span>
                            )}
                            {analysis.hasFever && (
                              <span style={{ 
                                background: '#ffe0b2', 
                                color: '#f57c00', 
                                padding: '2px 6px', 
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                Fever
                              </span>
                            )}
                            {analysis.hasDataQualityIssues && (
                              <span style={{ 
                                background: '#e1bee7', 
                                color: '#7b1fa2', 
                                padding: '2px 6px', 
                                borderRadius: '12px',
                                fontSize: '12px'
                              }}>
                                Data Issue
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}