import { createElement, useCallback, useState } from "react";
import { Message } from "../message";
import { FORM_STYLES } from "../styles";
import { Tool } from "../tool";
import { SubmissionType } from "../lib/submissions/submissions";
import { getSubmissionHandler } from "../lib/slater";
import { Select } from "./Select";
import { Toggle } from "./Toggle";
import { BallotFormat, formatters } from "../lib/ballots/ballotFormatter";
import {
  getApproval,
  getBordaCount,
  getRankedPairs,
} from "../lib/voting/votingCalculator";
import {
  formatApproval,
  formatRankedPairs,
} from "../lib/voting/votingMethodFormatter";
import { getPageTitle, makePost } from "../lib/posts";
import {
  formatBallots,
  formatValidationResults,
} from "../lib/voting/votingResultformatter";
import { fetchThread } from "../lib/threads";
import {
  validateUniqueBallotOptions,
  validateUniqueSubmissions,
  validateUniqueUsers,
} from "../lib/validators";
import { makeBallot } from "../lib/ballots/ballots";
import { ValidationResult } from "../lib/validation";

const getResult = async (
  url: string,
  tool: Tool,
  {
    ballotFormat,
    isRanked,
    skipFirstPost,
    skipLastPost,
    submissionType,
  }: {
    ballotFormat: BallotFormat;
    isRanked: boolean;
    skipFirstPost: boolean;
    skipLastPost: boolean;
    submissionType: SubmissionType;
  }
) => {
  const validationResults: ValidationResult[] = [];

  const els = await fetchThread(url);
  const posts = els.flatMap((el) => {
    const postOrNull = makePost(el);
    return postOrNull === null ? [] : [postOrNull];
  });

  switch (tool) {
    case Tool.BallotMaker: {
      const eligiblePosts = posts.slice(
        skipFirstPost ? 1 : 0,
        skipLastPost ? -1 : Infinity
      );

      validationResults.push(validateUniqueUsers(eligiblePosts, 1));

      const ballots = eligiblePosts.flatMap((post) => {
        const ballotOrNull = makeBallot(post);
        return ballotOrNull === null ? [] : [ballotOrNull];
      });

      validationResults.push(
        ...ballots.map((ballot) => validateUniqueBallotOptions(ballot, 1))
      );

      // Format results
      const formattedValidationResults =
        formatValidationResults(validationResults);
      const formattedBallots = formatters[ballotFormat](ballots);

      return [formattedValidationResults, formattedBallots].join("\n\n").trim();
    }
    case Tool.Slater: {
      const submissionHandler = getSubmissionHandler(submissionType);
      const parsedSubmissions = posts.map((post) =>
        submissionHandler.parseSubmission(post)
      );
      const validationResults = parsedSubmissions.flatMap((s) =>
        s.validationResult.isValid ? [] : s.validationResult
      );
      const submissions = parsedSubmissions.flatMap((s) =>
        s.validationResult.isValid && s.submission ? s.submission : []
      );
      validationResults.push(...validationResults);
      validationResults.push(validateUniqueSubmissions(submissions, 1));

      // Format results
      const formattedValidationResults =
        formatValidationResults(validationResults);
      const formattedBbCode = parsedSubmissions
        .flatMap(({ submission }) => {
          return submission === null
            ? []
            : // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [submissionHandler.formatBbCode(submission as any)];
        })
        .join("\n");
      return [formattedValidationResults, formattedBbCode].join("\n\n").trim();
    }
    case Tool.VotingCalculator: {
      const eligiblePosts = posts.slice(
        skipFirstPost ? 1 : 0,
        skipLastPost ? -1 : Infinity
      );

      validationResults.push(validateUniqueUsers(eligiblePosts, 1));

      const ballots = eligiblePosts.flatMap((post) => {
        const ballotOrNull = makeBallot(post);
        return ballotOrNull === null ? [] : [ballotOrNull];
      });

      validationResults.push(
        ...ballots.map((ballot) => validateUniqueBallotOptions(ballot, 1))
      );

      // Format results
      const formattedValidationResults =
        formatValidationResults(validationResults);

      if (isRanked) {
        const bordaCount = getBordaCount(ballots);
        const rankedPairs = getRankedPairs(ballots);
        return [
          getPageTitle(),
          ` # ${Message.RankedPairs.toUpperCase()} #`,
          ...(formattedValidationResults ? [formattedValidationResults] : []),
          formatBallots(ballots),
          formatRankedPairs(bordaCount, rankedPairs),
        ]
          .join("\n\n")
          .trim();
      } else {
        const approval = getApproval(ballots);
        return [
          getPageTitle(),
          ` # ${Message.Approval.toUpperCase()} #`,
          ...(formattedValidationResults ? [formattedValidationResults] : []),
          formatBallots(ballots),
          formatApproval(approval),
        ]
          .join("\n\n")
          .trim();
      }
    }
    default: {
      throw new Error(`Unexpected tool type selected: ${tool}`);
    }
  }
};

export const BreeziForm = ({
  onSubmit,
}: {
  onSubmit: (result: string) => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Form elements
  const [ballotFormat, setBallotFormat] = useState(BallotFormat.Pollkritter);
  const [skipFirstPost, setSkipFirstPost] = useState(true);
  const [skipLastPost, setSkipLastPost] = useState(false);
  const [submissionType, setSubmissionType] = useState(SubmissionType.Art);
  const [tool, setTool] = useState(Tool.VotingCalculator);
  const [isRanked, setIsRanked] = useState(true);

  const handleSubmit = useCallback(async () => {
    const result = await getResult(location.href, tool, {
      ballotFormat,
      isRanked,
      skipFirstPost,
      skipLastPost,
      submissionType,
    });
    onSubmit(result);
  }, [
    ballotFormat,
    isRanked,
    onSubmit,
    skipFirstPost,
    skipLastPost,
    submissionType,
    tool,
  ]);

  return createElement(
    "form",
    {
      disabled: isLoading,
      onSubmit: async (e) => {
        e.preventDefault();

        setIsLoading(true);
        await handleSubmit();
        setIsLoading(false);
      },
      style: FORM_STYLES,
    },
    createElement(Select<Tool>, {
      items: Object.values(Tool),
      label: Message.Tool,
      onChange: setTool,
      selectedItem: tool,
      toValue: (t) => `${t}`,
    }),
    tool === Tool.Slater
      ? createElement(Select<SubmissionType>, {
          items: Object.values(SubmissionType),
          label: Message.SlateType,
          onChange: setSubmissionType,
          selectedItem: submissionType,
          toValue: (t) => `${t}`,
        })
      : null,
    tool === Tool.BallotMaker
      ? createElement(Select<BallotFormat>, {
          items: Object.values(BallotFormat),
          label: Message.BallotFormat,
          onChange: setBallotFormat,
          selectedItem: ballotFormat,
          toValue: (t) => `${t}`,
        })
      : null,
    tool === Tool.VotingCalculator
      ? createElement(Toggle, {
          onChange: setIsRanked,
          label: Message.RankedPoll,
          value: isRanked,
        })
      : null,
    tool === Tool.BallotMaker || tool === Tool.VotingCalculator
      ? createElement(
          "div",
          {},
          createElement(Toggle, {
            onChange: setSkipFirstPost,
            label: Message.SkipFirstPost,
            value: skipFirstPost,
          }),
          createElement(Toggle, {
            onChange: setSkipLastPost,
            label: Message.SkipLastPost,
            value: skipLastPost,
          })
        )
      : null,
    createElement("button", { type: "submit" }, Message.Submit)
  );
};
