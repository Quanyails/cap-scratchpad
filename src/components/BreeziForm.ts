import { createElement, useCallback, useState } from "react";
import { Message } from "../message";
import { FORM_STYLES } from "../styles";
import { Tool } from "../tool";
import { SubmissionType } from "../lib/submissions/submissions";
import { makeSlate } from "../lib/slater";
import { Select } from "./Select";
import { makeBallots } from "../lib/ballots/ballotMaker";
import { Toggle } from "./Toggle";
import { BallotFormat } from "../lib/ballots/ballotFormatter";

export const BreeziForm = ({
  onSubmit,
}: {
  onSubmit: (result: string) => Promise<void>;
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Form elements
  const [ballotStyle, setBallotStyle] = useState(BallotFormat.Pollkritter);
  const [skipFirstPost, setSkipFirstPost] = useState(true);
  const [skipLastPost, setSkipLastPost] = useState(false);
  const [submissionType, setSubmissionType] = useState(SubmissionType.Art);
  const [tool, setTool] = useState(Tool.Slater);

  const handleSubmit = useCallback(async () => {
    switch (tool) {
      case Tool.BallotMaker: {
        const result = await makeBallots(ballotStyle, location.href, {
          skipFirst: skipFirstPost,
          skipLast: skipLastPost,
        });
        await onSubmit(result);
        break;
      }
      case Tool.Slater: {
        const result = await makeSlate(submissionType, location.href);
        await onSubmit(result);
        break;
      }
      default: {
        throw new Error(`Unexpected tool type selected: ${tool}`);
      }
    }
  }, [
    ballotStyle,
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
          onChange: setBallotStyle,
          selectedItem: ballotStyle,
          toValue: (t) => `${t}`,
        })
      : null,
    tool === Tool.BallotMaker
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
