/* eslint-disable @typescript-eslint/no-unused-vars */
import { type CSSProperties } from "react";

import { useUserContext } from "@/context/userContext";
import type EditableInput from "@/schema/EditableInput";

interface EditableDebugInfoProps extends EditableInput<string> {
  maxLength?: number;
  style?: CSSProperties;
}

const EditableDebugInfo = (props: EditableDebugInfoProps) => {
  const {
    label,
    value,
    onSubmit,
    disabled,
    required,
    maxLength,
    className,
    leftSection,
    rightSection,
    keyName,
    ...moreProps
  } = props;
  const { debug } = useUserContext();

  return debug ? (
    <div {...moreProps}>
      {label} {value}
    </div>
  ) : null;
};

export default EditableDebugInfo;
