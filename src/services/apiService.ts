import type { Patient, PatientsResponse, AssessmentResults, SubmissionResponse } from '../types/Patient';

const API_BASE_URL = 'https://assessment.ksensetech.com/api';
const API_KEY = import.meta.env.VITE_API_KEY;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry<T>(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error = new Error('Unknown error occurred');

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.status === 429) {
        if (attempt < maxRetries) {
          const delayTime = baseDelay * Math.pow(2, attempt);
          console.log(`Rate limited. Retrying in ${delayTime}ms...`);
          await delay(delayTime);
          continue;
        }
        throw new Error('Rate limit exceeded');
      }
      
      if (response.status >= 500 && response.status < 600) {
        if (attempt < maxRetries) {
          const delayTime = baseDelay * Math.pow(2, attempt);
          console.log(`Server error ${response.status}. Retrying in ${delayTime}ms...`);
          await delay(delayTime);
          continue;
        }
        throw new Error(`Server error: ${response.status}`);
      }
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      try {
        return await response.json();
      } catch (jsonError) {
        throw new Error(`Invalid JSON response: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        lastError = error;
      } else {
        lastError = new Error(`Unexpected error: ${String(error)}`);
      }
      
      if (attempt < maxRetries && (
        error instanceof TypeError || 
        (error instanceof Error && error.message.includes('fetch')) ||
        (error instanceof Error && error.name === 'NetworkError')
      )) {
        const delayTime = baseDelay * Math.pow(2, attempt);
        console.log(`Network error. Retrying in ${delayTime}ms...`);
        await delay(delayTime);
        continue;
      }
      if (attempt === maxRetries) break;
    }
  }
  
  throw lastError;
}

export async function fetchPatients(page: number = 1, limit: number = 20): Promise<PatientsResponse> {
  const url = `${API_BASE_URL}/patients?page=${page}&limit=${limit}`;

  console.log(`API KEY********`, API_KEY)
  const options: RequestInit = {
    method: 'GET',
    headers: {
      'x-api-key': API_KEY,
    },
  };
  
  return fetchWithRetry<PatientsResponse>(url, options);
}

export async function fetchAllPatients(): Promise<Patient[]> {
  const allPatients: Patient[] = [];
  let currentPage = 1;
  let totalPages = 1;
  
  do {
    const response = await fetchPatients(currentPage, 20);
    allPatients.push(...response.data);
    totalPages = response.pagination.totalPages;
    currentPage++;
  } while (currentPage <= totalPages);
  
  return allPatients;
}

export async function submitAssessment(results: AssessmentResults): Promise<SubmissionResponse> {
  const url = `${API_BASE_URL}/submit-assessment`;
  const options: RequestInit = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify(results),
  };
  
  return fetchWithRetry<SubmissionResponse>(url, options);
}