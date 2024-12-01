import {
  ArrowLeftEndOnRectangleIcon,
  CheckIcon,
  PlayIcon,
  BoltIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useContext, useState } from "react";
import styled from "styled-components";
import { defaultBorderRadius, vscEditorBackground } from "..";
import { IdeMessengerContext } from "../../context/IdeMessenger";
import { isJetBrains } from "../../util";
import HeaderButtonWithText from "../HeaderButtonWithText";
import { CopyButton } from "./CopyButton";
import { isPerplexityMode } from '../../util/bareChatMode';
import { useWebviewListener } from "../../hooks/useWebviewListener";
import { Loader } from "lucide-react";


const TopDiv = styled.div`
  position: sticky;
  top: 0;
  left: 100%;
  height: 0;
  width: 0;
  overflow: visible;
  z-index: 100;
`;

const SecondDiv = styled.div<{ bottom: boolean }>`
  position: absolute;
  ${(props) => (props.bottom ? "bottom: 3px;" : "top: -11px;")}
  right: 10px;
  display: flex;
  padding: 1px 2px;
  gap: 4px;
  border: 0.5px solid #8888;
  border-radius: ${defaultBorderRadius};
  background-color: ${vscEditorBackground};
`;

interface CodeBlockToolBarProps {
  text: string;
  bottom: boolean;
  language: string | undefined;
}

const terminalLanguages = ["bash", "sh"];
const commonTerminalCommands = [
  "npm",
  "pnpm",
  "yarn",
  "bun",
  "deno",
  "npx",
  "cd",
  "ls",
  "pwd",
  "pip",
  "python",
  "node",
  "git",
  "curl",
  "wget",
  "rbenv",
  "gem",
  "ruby",
  "bundle",
];
function isTerminalCodeBlock(language: string | undefined, text: string) {
  return (
    terminalLanguages.includes(language) ||
    ((!language || language?.length === 0) &&
      (text.trim().split("\n").length === 1 ||
        commonTerminalCommands.some((c) => text.trim().startsWith(c))))
  );
}

function CodeBlockToolBar(props: CodeBlockToolBarProps) {
  const ideMessenger = useContext(IdeMessengerContext);

  const [copied, setCopied] = useState(false);
  const [applying, setApplying] = useState(false);
  const [fastApplying, setFastApplying] = useState(false);
  const [isDiffVisible, setIsDiffVisible] = useState(false);
  const [originalFileUri, setOriginalFileUri] = useState("");
  const [diffFileUri, setDiffFileUri] = useState("");

  useWebviewListener("setRelaceDiffState", (state) => {
    setIsDiffVisible(state.diffVisible);
    setOriginalFileUri(state.originalFileUri);
    console.dir("updating diff state");
    console.dir(state);
    setDiffFileUri(state.diffFileUri);
    return Promise.resolve();
  });

  return (
    <TopDiv>
      <SecondDiv bottom={props.bottom || false}>
        {isPerplexityMode() && <HeaderButtonWithText
          text="Add to PearAI chat context"
          style={{ backgroundColor: vscEditorBackground }}
          onClick={() => {
            ideMessenger.post("addPerplexityContext", { text: props.text, language: props.language });
          }}
        >
          <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
        </HeaderButtonWithText>}
        {isJetBrains() || !isPerplexityMode() && (
          <>
            <HeaderButtonWithText
              text={
                isTerminalCodeBlock(props.language, props.text)
                  ? "Run in terminal"
                  : applying
                    ? "Applying..."
                    : "Apply to current file"
              }
              disabled={applying || fastApplying}
              onClick={() => {
                if (isTerminalCodeBlock(props.language, props.text)) {
                  let text = props.text;
                  if (text.startsWith("$ ")) {
                    text = text.slice(2);
                  }
                  ideMessenger.ide.runCommand(text);
                  return;
                }

                if (applying) return;
                ideMessenger.post("applyToCurrentFile", {
                  text: props.text,
                });
                setApplying(true);
                setTimeout(() => setApplying(false), 2000);
              }}
            >
              {applying ? (
                <CheckIcon className="w-4 h-4 text-green-500" />
              ) : (
                <PlayIcon className="w-4 h-4" />
              )}
            </HeaderButtonWithText>

            <>
              {!isDiffVisible ? (
                <HeaderButtonWithText
                  text={fastApplying ? "Fast Applying..." : "Fast Apply"}
                  disabled={applying || fastApplying}
                  onClick={() => {
                    if (fastApplying) return;
                    ideMessenger.post("applyWithRelace", {
                      text: props.text,
                    });
                    setFastApplying(true);
                    setTimeout(() => setFastApplying(false), 2000);
                  }}
                >
                  {fastApplying ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <BoltIcon className="w-4 h-4" />
                  )}
                </HeaderButtonWithText>
              ) : (
                <>
                  <HeaderButtonWithText
                    text="Accept Changes"
                    onClick={() => {
                      console.dir("accepting diff");
                      console.dir({originalFileUri, diffFileUri});
                      ideMessenger.post("acceptRelaceDiff", {originalFileUri, diffFileUri});
                      // setIsDiffVisible(false);
                    }}
                  >
                    <CheckIcon className="w-4 h-4 text-green-500" />
                  </HeaderButtonWithText>
                  <HeaderButtonWithText
                    text="Reject Changes"
                    onClick={() => {
                      ideMessenger.post("rejectRelaceDiff", {originalFileUri, diffFileUri});
                      setIsDiffVisible(false);
                    }}
                  >
                    <XMarkIcon className="w-4 h-4 text-red-600" />
                  </HeaderButtonWithText>
                  <HeaderButtonWithText
                    text="Reapply Changes"
                    onClick={() => {
                      ideMessenger.post("applyWithRelace", undefined);
                      setIsDiffVisible(false);
                    }}
                  >
                    <ArrowPathIcon className="w-4 h-4 text-yellow-500" />
                  </HeaderButtonWithText>
                </>
              )}
            </>
          </>
        )}
        {!isPerplexityMode() && <HeaderButtonWithText
          text="Insert at cursor"
          onClick={() => {
            ideMessenger.post("insertAtCursor", { text: props.text });
          }}
        >
          <ArrowLeftEndOnRectangleIcon className="w-4 h-4" />
        </HeaderButtonWithText>}
        <CopyButton text={props.text} />
      </SecondDiv>
    </TopDiv>
  );
}

export default CodeBlockToolBar;
