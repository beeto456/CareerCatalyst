/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { JobStatus, InterviewMethod, WorkArrangement } from "./types";

export const STATUS_OPTIONS = Object.values(JobStatus);
export const INTERVIEW_METHOD_OPTIONS = Object.values(InterviewMethod);
export const WORK_ARRANGEMENT_OPTIONS = Object.values(WorkArrangement);

export const DEFAULT_THRESHOLDS = {
  competency: 7,
  interest: 7,
};
