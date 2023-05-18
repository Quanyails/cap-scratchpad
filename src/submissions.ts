import { Post } from "./posts";

export interface SubmissionHandler<T> {
  formatBbCode: (post: Post, submission: T) => string;
  getSubmission: (el: HTMLElement, post: Post) => T | null;
}

export const FINAL_SUBMISSION_TEXT = "final submission";
