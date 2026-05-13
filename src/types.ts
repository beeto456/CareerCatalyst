/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum JobStatus {
  NOT_APPLIED = 'Have Not Applied',
  APPLIED = 'Applied',
  AWAITING_INTERVIEW = 'Awaiting Interview',
  INTERVIEWING = 'Interviewing',
  OFFERED = 'Offered',
  REJECTED = 'Rejected',
  WITHDRAWN = 'Withdrawn/Expired',
  GHOSTED = 'Ghosted (>2 Weeks)',
  NO_LONGER_INTERESTED = 'No Longer Interested',
}

export enum InterviewMethod {
  ONLINE = 'Online',
  FACE_TO_FACE = 'Face-to-Face',
  NA = 'N/A',
}

export enum WorkArrangement {
  REMOTE = 'Remote',
  HYBRID = 'Hybrid',
  ONSITE = 'On-site',
  NA = 'N/A',
}

export interface JobRequirement {
  id: string;
  text: string;
  competencyScore: number; // 1-10
  interestScore: number; // 1-10
}

export interface JobApplication {
  id: string;
  userId: string;
  title: string;
  company: string;
  url?: string;
  sourceType?: 'URL' | 'Manual Input';
  applicationDate?: string;
  status: JobStatus;
  interviewMethod?: InterviewMethod;
  interviewDate?: string; // ISO string or Firestore timestamp (Interview 1)
  interviewDate2?: string; // (Interview 2)
  salaryTarget?: string;
  salaryPosted?: string;
  followUpDate?: string;
  workArrangement?: WorkArrangement;
  officeLocation?: string;
  notes: string;
  requirements: JobRequirement[];
  avgCompetency: number;
  avgInterest: number;
  overallScore: number; // (avgCompetency + avgInterest) / 2
  createdAt: number;
  updatedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}
