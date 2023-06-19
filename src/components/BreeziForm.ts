import { createElement, useCallback, useState } from "react";
import { Message } from "../message";
import { FORM_STYLES } from "../styles";
import { Tool } from "../tool";
import { SubmissionType } from "../lib/submissions/submissions";
import { makeSlate } from "../lib/slater";
import { Select } from "./Select";
import { makeBallots } from "../lib/ballots/ballotMaker";
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
import { getPageTitle } from "../lib/posts";
import { formatBallots } from "../lib/voting/votingResultformatter";

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
  const [tool, setTool] = useState(Tool.Slater);
  const [isRanked, setIsRanked] = useState(true);

  const handleSubmit = useCallback(async () => {
    let result: string;

    switch (tool) {
      case Tool.BallotMaker: {
        const ballots = await makeBallots(ballotFormat, location.href, {
          skipFirst: skipFirstPost,
          skipLast: skipLastPost,
        });
        result = formatters[ballotFormat](ballots);
        break;
      }
      case Tool.Slater: {
        result = await makeSlate(submissionType, location.href);
        break;
      }
      case Tool.VotingCalculator: {
        const ballots = await makeBallots(ballotFormat, location.href, {
          skipFirst: skipFirstPost,
          skipLast: skipLastPost,
        });
        if (isRanked) {
          const bordaCount = getBordaCount(ballots);
          const rankedPairs = getRankedPairs(ballots);
          result = [
            getPageTitle(),
            ` # ${Message.RankedPairs.toUpperCase()} #`,
            formatBallots(ballots),
            formatRankedPairs(bordaCount, rankedPairs),
          ].join("\n\n");
        } else {
          const approval = getApproval(ballots);
          result = [
            getPageTitle(),
            ` # ${Message.Approval.toUpperCase()} #`,
            formatBallots(ballots),
            formatApproval(approval),
          ].join("\n\n");
        }
        break;
      }
      default: {
        throw new Error(`Unexpected tool type selected: ${tool}`);
      }
    }
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
