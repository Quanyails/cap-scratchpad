import { createElement } from "react";
import { LABEL_STYLES } from "../styles";

export const Toggle = ({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (v: boolean) => void;
  value: boolean;
}) => {
  return createElement(
    "label",
    {
      style: LABEL_STYLES,
    },
    createElement("span", {}, label),
    createElement("input", {
      checked: value,
      onChange: (e) => onChange(e.currentTarget.checked),
      type: "checkbox",
    })
  );
};
