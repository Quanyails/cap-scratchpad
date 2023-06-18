import { createElement, useCallback, useState } from "react";
import { BreeziForm } from "./BreeziForm";
import { Message } from "../message";
import { Sidebar } from "./Sidebar";
import { CSS_UNIT } from "../styles";
import { sleep } from "../util/async";
export const Breezi = ({ version }: { version: string }) => {
  const [isCopying, setIsCopying] = useState(false);
  const [result, setResult] = useState("");

  const handleSubmit = useCallback(async (r: string) => {
    setResult(r ? r : Message.NoResults);
  }, []);

  const toolForm = createElement(BreeziForm, {
    onSubmit: handleSubmit,
  });

  return createElement(
    "div",
    {
      padding: 3 * CSS_UNIT,
    },
    createElement(Sidebar, {
      children: [
        createElement("h2", {}, `${Message.Breezi} ${version}`),
        toolForm,
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
