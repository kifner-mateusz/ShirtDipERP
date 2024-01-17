import {
  createContext,
  useContext,
  type ReactNode,
  type SetStateAction,
  type Dispatch,
} from "react";

import { useLocalStorage } from "@mantine/hooks";

interface FlagEditableAddress {
  editableAddressMode?: "popup" | "extend" | "always_visible";
  setEditableAddressMode: Dispatch<
    SetStateAction<"popup" | "extend" | "always_visible">
  >;
  mobileOverride?: "auto" | "mobile" | "desktop";
  setMobileOverride: Dispatch<SetStateAction<"auto" | "mobile" | "desktop">>;
}

interface FlagContextType extends FlagEditableAddress {}

export const FlagContext = createContext<FlagContextType | null>(null);

export const FlagContextProvider = ({ children }: { children: ReactNode }) => {
  const [editableAddressMode, setEditableAddressMode] = useLocalStorage<
    "popup" | "extend" | "always_visible"
  >({
    key: "flag-editable-address-mode",
    defaultValue: "always_visible",
  });

  const [mobileOverride, setMobileOverride] = useLocalStorage<
    "auto" | "mobile" | "desktop"
  >({
    key: "flag-mobile-override",
    defaultValue: "auto",
  });

  return (
    <FlagContext.Provider
      value={{
        editableAddressMode,
        setEditableAddressMode,
        mobileOverride,
        setMobileOverride,
      }}
    >
      {children}
    </FlagContext.Provider>
  );
};

export function useFlagContext(): FlagContextType {
  const state = useContext(FlagContext);
  if (!state) {
    throw new Error(
      `ERROR: FlagContext reached invalid state, null 'Flag' in context`,
    );
  }
  return state;
}