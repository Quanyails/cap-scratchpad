import { createRoot } from "react-dom/client";
import { createElement } from "react";
import { Breezi } from "./components/Breezi";

declare const __VERSION__: string; // Defined by DeclarePlugin

const BREEZI_CONTAINER_SELECTOR = "body";

const main = () => {
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
