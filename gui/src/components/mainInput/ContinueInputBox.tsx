import { JSONContent } from "@tiptap/react";
import { ContextItemWithId, InputModifiers } from "core";
import { useDispatch, useSelector } from "react-redux";
import styled, { keyframes } from "styled-components";
import { defaultBorderRadius, vscBackground } from "..";
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { selectSlashCommands } from "../../redux/selectors";
import { newSession, setMessageAtIndex } from "../../redux/slices/stateSlice";
import { RootState } from "../../redux/store";
import ContextItemsPeek from "./ContextItemsPeek";
import TipTapEditor from "./TipTapEditor";
import { useMemo } from "react";
import { defaultModelSelector } from "../../redux/selectors/modelSelectors";
import { isBareChatMode } from "../../util/bareChatMode";
import RelativeFileContextProvider from "core/context/providers/RelativeFileContextProvider";
import FileContextProvider from "core/context/providers/FileContextProvider";

const gradient = keyframes`
  0% {
    background-position: 0px 0;
  }
  100% {
    background-position: 100em 0;
  }
`;

const GradientBorder = styled.div<{
  borderRadius?: string;
  borderColor?: string;
  isFirst: boolean;
  isLast: boolean;
  loading: 0 | 1;
}>`
  border-radius: ${(props) => props.borderRadius || "0"};
  padding: 2px;
  background: ${(props) =>
    props.borderColor
      ? props.borderColor
      : `repeating-linear-gradient(
      101.79deg,
      #4DA587 0%,
      #EBF5DF 16%,
      #4DA587 33%,
      #EBF5DF 55%,
      #4DA587 67%,
      #4DA587 85%,
      #4DA587 99%
    )`};
  animation: ${(props) => (props.loading ? gradient : "")} 6s linear infinite;
  background-size: 200% 200%;
  width: 100% - 0.6rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-top: 8px;
`;

interface ContinueInputBoxProps {
  isLastUserInput: boolean;
  isMainInput?: boolean;
  onEnter: (editorState: JSONContent, modifiers: InputModifiers) => void;
  editorState?: JSONContent;
  contextItems?: ContextItemWithId[];
  hidden?: boolean;
}

function ContinueInputBox(props: ContinueInputBoxProps) {
  const dispatch = useDispatch();

  const active = useSelector((store: RootState) => store.state.active);
  const availableSlashCommands = useSelector(selectSlashCommands);

  const bareChatMode = isBareChatMode()
  let availableContextProviders;
  if (bareChatMode) {
    availableContextProviders = [
      ...useSelector((store: RootState) => store.state.config.contextProviders),
      RelativeFileContextProvider.description
    ];
  } else {
    availableContextProviders = [
      ...useSelector((store: RootState) => store.state.config.contextProviders),
      FileContextProvider.description
    ];
  }


  useWebviewListener(
    "newSessionWithPrompt",
    async (data) => {
      if (props.isMainInput) {
        dispatch(newSession());
        dispatch(
          setMessageAtIndex({
            message: { role: "user", content: data.prompt },
            index: 0,
          }),
        );
      }
    },
    [props.isMainInput],
  );

  return (
    <div
      style={{
        display: props.hidden ? "none" : "inherit",
      }}
    >
      <GradientBorder
        loading={active && props.isLastUserInput ? 1 : 0}
        isFirst={false}
        isLast={false}
        borderColor={
          active && props.isLastUserInput ? undefined : vscBackground
        }
        borderRadius={defaultBorderRadius}
      >
        <TipTapEditor
          editorState={props.editorState}
          onEnter={props.onEnter}
          isMainInput={props.isMainInput}
          availableContextProviders={availableContextProviders}
          availableSlashCommands={
            bareChatMode ? undefined : availableSlashCommands
          }
        ></TipTapEditor>
      </GradientBorder>
      <ContextItemsPeek contextItems={props.contextItems}></ContextItemsPeek>
    </div>
  );
}

export default ContinueInputBox;
