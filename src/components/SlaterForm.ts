import { createElement, useState } from "react";
import { Message } from "../Message";
import { FORM_STYLES } from "../styles";
import { Select } from "./Select";

export const SlaterForm = <T>({
  items,
  onSubmit,
}: {
  items: T[];
  onSubmit: (submittedItem: T) => Promise<void>;
}) => {
  const [currentItem, setCurrentItem] = useState(items[0]);
  const [isLoading, setIsLoading] = useState(false);

  return createElement(
    "form",
    {
      disabled: isLoading,
      onSubmit: async (e) => {
        e.preventDefault();

        if (currentItem) {
          setIsLoading(true);
          await onSubmit(currentItem);
          setIsLoading(false);
        }
      },
      style: FORM_STYLES,
    },
    createElement(Select<T>, {
      currentItem,
      items,
      label: Message.SlateType,
      onChange: setCurrentItem,
      toValue: (s) => `${s}`,
    }),
    createElement("button", { type: "submit" }, Message.Submit)
  );
};
