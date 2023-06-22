import groupBy from "lodash/groupBy";
import { Post } from "./posts";
import { Ballot } from "./ballots/ballots";
import { ValidationResult } from "./validation";

export const validateUniqueBallotOptions = (
  ballot: Ballot,
  max: number
): ValidationResult => {
  const options = groupBy(ballot.flat(2), (option) => option);
  const issues = Object.entries(options).flatMap(([option, repeats]) => {
    return repeats.length > max
      ? [
          `Found a ballot with ${repeats.length} instances of ${option}, which is more than the max of ${max}.`,
        ]
      : [];
  });
  return {
    issues,
    isValid: issues.length === 0,
  };
};

export const validateUniqueSubmissions = (
  submissions: { username: string }[],
  max: number
): ValidationResult => {
  const userPosts = groupBy(submissions, (s) => s.username);
  const issues = Object.entries(userPosts).flatMap(
    ([username, submissions]) => {
      return submissions.length > max
        ? [
            `${username} has made ${submissions.length} valid submissions, which is more than the maximum of ${max}.`,
          ]
        : [];
    }
  );
  return {
    issues,
    isValid: issues.length === 0,
  };
};

export const validateUniqueUsers = (
  posts: Post[],
  max: number
): ValidationResult => {
  const userPosts = groupBy(posts, (p) => p.username);
  const issues = Object.entries(userPosts).flatMap(([username, posts]) => {
    return posts.length > max
      ? [
          `${username} has made ${posts.length} valid posts, which is more than the maximum of ${max}.`,
        ]
      : [];
  });
  return {
    issues,
    isValid: issues.length === 0,
  };
};
