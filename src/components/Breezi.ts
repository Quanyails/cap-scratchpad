import { createElement, useState } from "react";
import { SlaterForm } from "./SlaterForm";
import { Message } from "../Message";
import { SubmissionType } from "../lib/submissions/submissions";
import { Sidebar } from "./Sidebar";
import { CSS_UNIT } from "../styles";
import { sleep } from "../util/async";
import { Select } from "./Select";
import { makeSlate } from "../lib/slater";

enum Tool {
  SLATER = "slater",
}

export const Breezi = ({ version }: { version: string }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [result, setResult] = useState("");
  const [tool, setTool] = useState(Tool.SLATER);

  const toolComponent =
    tool === Tool.SLATER
      ? createElement(SlaterForm<SubmissionType>, {
          items: Object.values(SubmissionType),
          onSubmit: async (s: SubmissionType) => {
            const result = await makeSlate(s, location.href);
            setResult(result ? result : Message.NoResults);
          },
        })
      : null;

  return createElement(
    "div",
    {
      padding: 3 * CSS_UNIT,
    },
    createElement(Sidebar, {
      children: [
        createElement("h2", {}, `${Message.Breezi} ${version}`),
        createElement(Select<Tool>, {
          currentItem: tool,
          items: Object.values(Tool),
          label: Message.Tool,
          onChange: setTool,
          toValue: (s) => `${s}`,
        }),
        toolComponent,
        createElement("textarea", {
          readOnly: true,
          style: {
            flexGrow: 1,
          },
          value: result,
        }),
        createElement(
          "button",
          {
            onClick: async () => {
              setIsCopying(true);
              await navigator.clipboard.writeText(result);
              await sleep(2 * 1000); // so text stays readable for a little bit
              setIsCopying(false);
            },
          },
          isCopying ? Message.Copied : Message.Copy
        ),
      ],
    })
  );
};
