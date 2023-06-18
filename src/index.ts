import { SubmissionType } from "./lib/submissions/submissions";
import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Breezi } from "./components/Breezi";
import { makeSlate } from "./lib/slater";

declare global {
  interface Window {
    Breezi: {
      makeSlate: (type: SubmissionType, url: string) => Promise<string>;
    };
  }
}
declare const __VERSION__: string; // Defined by DeclarePlugin

const BREEZI_CONTAINER_SELECTOR = "body";

const main = () => {
  window.Breezi = {
    makeSlate,
  };

  const containerEl = document.querySelector(
    BREEZI_CONTAINER_SELECTOR
  ) as HTMLBodyElement;
  const rootEl = document.createElement("div");
  containerEl.append(rootEl);

  const root = createRoot(rootEl);
  root.render(
    createElement(Breezi, {
      version: __VERSION__,
    })
  );
};

main();
