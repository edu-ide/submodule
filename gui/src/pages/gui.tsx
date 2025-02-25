import InventoryPreview from "@/components/InventoryPreview";
import ShortcutContainer from "@/components/ShortcutContainer";
import StatusBar from "@/components/StatusBar";
import WarningCard from "@/components/ui/warningcard";
import { setActiveFilePath } from "@/redux/slices/uiStateSlice";
import { getLocalStorage, setLocalStorage } from "@/util/localStorage";
import {
  BackspaceIcon,
  ChatBubbleOvalLeftIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { JSONContent } from "@tiptap/react";
import { InputModifiers } from "core";
import { usePostHog } from "posthog-js/react";
import {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Button,
  lightGray,
  vscBackground,
  vscBadgeBackground,
  vscBadgeForeground,
  vscForeground,
} from "../components";
import StepContainer from "../components/gui/StepContainer";
import TimelineItem from "../components/gui/TimelineItem";
import ContinueInputBox from "../components/mainInput/ContinueInputBox";
import { defaultInputModifiers } from "../components/mainInput/inputModifiers";
import { IdeMessengerContext } from "../context/IdeMessenger";
import useChatHandler from "../hooks/useChatHandler";
import useHistory from "../hooks/useHistory";
import { useWebviewListener } from "../hooks/useWebviewListener";
import { defaultModelSelector } from "../redux/selectors/modelSelectors";
import {
  clearLastResponse,
  deleteMessage,
  newSession,
  setDefaultModel,
  setInactive,
  setShowInteractiveContinueTutorial,
  addContextItems,
} from "../redux/slices/stateSlice";
import { setBottomMessage } from "../redux/slices/uiStateSlice";
import { RootState } from "../redux/store";
import {
  getFontSize,
  getMetaKeyLabel,
  isMetaEquivalentKeyPressed,
} from "../util";
import { FREE_TRIAL_LIMIT_REQUESTS } from "../util/freeTrial";
import OnboardingTutorial from "./onboarding/OnboardingTutorial";
import { getLogoPath } from "./welcome/setup/ImportExtensions";
import { Badge } from "../components/ui/badge";
import { cn } from "@/lib/utils";
import { EducationContent } from 'core/protocol/types.js';

// ContextItemId 타입을 인라인으로 정의
type ContextItemId = string;

const LENGTHY_MESSAGE_WARNING_INDEX = 14; // number of messages after which we show the warning card

export const TopGuiDiv = styled.div<{ isNewSession: boolean }>`
  overflow-y: scroll;
  position: relative;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const StopButtonContainer = styled.div`
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
`;

export const StopButton = styled.div`
  border-radius: 4px;
  padding: 4px;
	display: flex;
	align-items: center;
	gap: 6px;
  background-color: rgb(147, 51, 51);
  z-index: 50;
  color: ${vscBadgeForeground};
  cursor: pointer;
`;

export const NewSessionButton = styled.div`
  width: fit-content;
  font-size: ${getFontSize() - 3}px;
	background-color: ${vscBackground}ee;
	padding: 0px 4px;
  color: ${lightGray};

  &:hover {
    color: ${vscForeground};
  }

  cursor: pointer;
`;

const TutorialCardDiv = styled.header`
  position: sticky;
  top: 0px;
  z-index: 500;
  background-color: ${vscBackground}ee; // Added 'ee' for slight transparency
  display: flex;
  width: 100%;
`;

export const InputContainer = styled.div<{ isNewSession?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  padding-bottom: 0.9rem;
  border-top-left-radius: 0.5rem;
  border-top-right-radius: 0.5rem;
  position: ${props => props.isNewSession ? 'relative' : 'fixed'};
  bottom: ${props => props.isNewSession ? 'auto' : '0'};
  left: 0;
  right: 0;
  background-color: ${vscBackground};
`;

export function fallbackRender({ error, resetErrorBoundary }) {
  return (
    <div
      role="alert"
      className="px-2"
      style={{ backgroundColor: vscBackground }}
    >
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>

      <div className="text-center">
        <Button onClick={resetErrorBoundary}>Restart</Button>
      </div>
    </div>
  );
}

function GUI() {
  const posthog = usePostHog();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const ideMessenger = useContext(IdeMessengerContext);

  const sessionState = useSelector((state: RootState) => state.state);
  const defaultModel = useSelector(defaultModelSelector);
  const active = useSelector((state: RootState) => state.state.active);
  const [stepsOpen, setStepsOpen] = useState<(boolean | undefined)[]>([]);
  // If getting this from redux state, it is false. So need to get from localStorage directly.
  // This is likely because it becomes true only after user onboards, upon which the local storage is updated.
  // On first launch, showTutorialCard will be null, so we want to show it (true)
  // Once it's been shown and closed, it will be false in localStorage
  const showTutorialCard = getLocalStorage("showTutorialCard") ?? (setLocalStorage("showTutorialCard", true), true);
  useEffect(() => {
    // Set the redux state to the updated localStorage value (true)
    dispatch(setShowInteractiveContinueTutorial(showTutorialCard ?? false));
  }, [])
  const onCloseTutorialCard = useCallback(() => {
    posthog.capture("closedTutorialCard");
    setLocalStorage("showTutorialCard", false);
    dispatch(setShowInteractiveContinueTutorial(false));
  }, []);

  const mainTextInputRef = useRef<HTMLInputElement>(null);
  const topGuiDivRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState<boolean>(false);
  const state = useSelector((state: RootState) => state.state);
  const isNewSession = state.history.length === 0;
  const [shouldShowSplash, setShouldShowSplash] = useState(true);

  const handleScroll = () => {
    const OFFSET_HERUISTIC = 300;
    if (!topGuiDivRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = topGuiDivRef.current;
    const atBottom =
      scrollHeight - clientHeight <= scrollTop + OFFSET_HERUISTIC;

    setIsAtBottom(atBottom);
  };

  const snapToBottom = useCallback(() => {
    window.scrollTo({
      top: topGuiDivRef.current?.scrollHeight,
      behavior: "instant" as any,
    });
    setIsAtBottom(true);
  }, []);

  useEffect(() => {
    if (active) {
      snapToBottom();
    }
  }, [active])

  useEffect(() => {
    if (active && !isAtBottom) {
      if (!topGuiDivRef.current) return;
      const scrollAreaElement = topGuiDivRef.current;
      scrollAreaElement.scrollTop =
        scrollAreaElement.scrollHeight - scrollAreaElement.clientHeight;
      setIsAtBottom(true);
    }
  }, [active, isAtBottom]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      snapToBottom();
    }, 1);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [topGuiDivRef]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (inputContainerRef.current && topGuiDivRef.current) {
        const scrollTop = topGuiDivRef.current.scrollTop;
        const height = inputContainerRef.current.offsetHeight;
        const newPadding = isNewSession ? '0px' : `${height + 20}px`;

        topGuiDivRef.current.style.paddingBottom = '0px';
        topGuiDivRef.current.offsetHeight;
        topGuiDivRef.current.style.paddingBottom = newPadding;

        topGuiDivRef.current.scrollTop = scrollTop;
      }
    });

    if (inputContainerRef.current) {
      resizeObserver.observe(inputContainerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [isNewSession, inputContainerRef, topGuiDivRef]);

  useEffect(() => {
    const listener = (e: any) => {
      if (
        e.key === "Backspace" &&
        isMetaEquivalentKeyPressed(e) &&
        !e.shiftKey
      ) {
        dispatch(setInactive());
      }
    };
    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, [active]);

  const { streamResponse } = useChatHandler(dispatch, ideMessenger);

  const sendInput = useCallback(
    (editorState: JSONContent, modifiers: InputModifiers) => {
      if (defaultModel?.provider === "free-trial") {
        const u = getLocalStorage("ftc");
        if (u) {
          setLocalStorage("ftc", u + 1);

          if (u >= FREE_TRIAL_LIMIT_REQUESTS) {
            navigate("/onboarding");
            posthog?.capture("ftc_reached");
            return;
          }
        } else {
          setLocalStorage("ftc", 1);
        }
      }

      streamResponse(editorState, modifiers, ideMessenger, undefined, 'continue');

      const currentCount = getLocalStorage("mainTextEntryCounter");
      if (currentCount) {
        setLocalStorage("mainTextEntryCounter", currentCount + 1);
      } else {
        setLocalStorage("mainTextEntryCounter", 1);
      }
    },
    [
      sessionState.history,
      sessionState.contextItems,
      defaultModel,
      state,
      streamResponse,
    ],
  );

  const { saveSession, getLastSessionId, loadLastSession, loadMostRecentChat } =
    useHistory(dispatch, 'continue');

  useWebviewListener(
    "newSession",
    async () => {
      saveSession();
      mainTextInputRef.current?.focus?.();
    },
    [saveSession],
  );

  useWebviewListener(
    "setActiveFilePath",
    async (data) => {
      dispatch(setActiveFilePath(data));
    },
    []
  );

  useWebviewListener(
    "loadMostRecentChat",
    async () => {
      await loadMostRecentChat();
      mainTextInputRef.current?.focus?.();
    },
    [loadMostRecentChat],
  );

  useWebviewListener("restFirstLaunchInGUI", async () => {
    setLocalStorage("showTutorialCard", true);
    localStorage.removeItem("onboardingSelectedTools");
    dispatch(setShowInteractiveContinueTutorial(true));
  });

  useWebviewListener(
    "showInteractiveContinueTutorial",
    async () => {
      setLocalStorage("showTutorialCard", true);
      dispatch(setShowInteractiveContinueTutorial(true));
    },
    [],
  );

  useWebviewListener("highlightedCode", async (data) => {
    setShouldShowSplash(false);
  }, []);


  useWebviewListener("switchModel", async (model: string) => {
    dispatch(setDefaultModel({ title: model }));
  });


  const isLastUserInput = useCallback(
    (index: number): boolean => {
      let foundLaterUserInput = false;
      for (let i = index + 1; i < state.history.length; i++) {
        if (state.history[i].message.role === "user") {
          foundLaterUserInput = true;
          break;
        }
      }
      return !foundLaterUserInput;
    },
    [state.history],
  );

  const adjustPadding = useCallback((height: number) => {
    if (topGuiDivRef.current) {
      topGuiDivRef.current.style.paddingBottom = `${height + 20}px`;
    }
  }, []);

  // 교육 콘텐츠를 Chat 컨텍스트에 추가하는 리스너 추가
  useWebviewListener("addEducationContextToChat", async (data: { content: EducationContent }) => {
    // content 객체 추출
    const content = data.content;
    console.log('[GUI] 교육 콘텐츠 수신:', content);
    
    // 콘텐츠를 컨텍스트 아이템 형식으로 변환
    const contextItem = {
      id: `edu-${Date.now()}` as ContextItemId,
      itemType: "file",
      name: content.title,
      content: content.markdown,
      language: "markdown",
      source: "education",
      path: `education/${content.category}/${content.title.toLowerCase().replace(/\s+/g, '-')}`,
      description: `${content.title}에 대한 교육 자료`,
    } as any;
    
    console.log('[GUI] 생성된 컨텍스트 아이템:', contextItem);
    
    // 코드 스니펫이 있으면 추가
    if (content.codeSnippets && content.codeSnippets.length > 0) {
      content.codeSnippets.forEach((snippet, index) => {
        const snippetItem = {
          id: `edu-code-${Date.now()}-${index}` as ContextItemId,
          itemType: "file",
          name: `${content.title} - 코드 예제 ${index + 1}`,
          content: snippet.code,
          language: snippet.language || "typescript",
          source: "education",
          path: `education/${content.category}/code-snippets/example-${index + 1}.${snippet.language || 'ts'}`,
          description: `${content.title}의 코드 예제 ${index + 1}`,
        } as any;
        console.log('[GUI] 스니펫 컨텍스트 아이템 추가:', snippetItem);
        dispatch(addContextItems([snippetItem]));
      });
    }
    
    // 메인 콘텐츠 컨텍스트 추가
    dispatch(addContextItems([contextItem as any]));
    
    // 메인 페이지로 이동
    navigate("/");
    
    // 사용자에게 알림 (React 요소로 변환)
    dispatch(setBottomMessage(<span>교육 콘텐츠가 PearAI Chat에 추가되었습니다.</span>));
    
    // 추가: VS Code 스타일의 토스트 메시지 표시
    showToastDirectly(`"${content.title}"이(가) 채팅에 추가되었습니다`);
    
    // 타이머로 알림 메시지 제거
    setTimeout(() => {
      dispatch(setBottomMessage(undefined));
    }, 3000);
  });

  // 토스트 메시지를 직접 표시하는 함수 추가
  const showToastDirectly = (message: string) => {
    // 기존 토스트 제거
    const existingToast = document.getElementById('direct-toast');
    if (existingToast) {
      document.body.removeChild(existingToast);
    }
    
    // 새 토스트 생성 및 추가
    const toast = document.createElement('div');
    toast.id = 'direct-toast';
    toast.textContent = message;
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.padding = '8px 16px';
    toast.style.backgroundColor = 'var(--vscode-editor-background)';
    toast.style.color = 'var(--vscode-editor-foreground)';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
    toast.style.zIndex = '1000';
    document.body.appendChild(toast);
    
    // 일정 시간 후 토스트 제거
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2000);
  };

  return (
    <>
      {/* Disabling Tutorial Card until we improve it */}
      {false &&
        <TutorialCardDiv>
          <OnboardingTutorial onClose={onCloseTutorialCard} />
        </TutorialCardDiv>
      }

      <TopGuiDiv ref={topGuiDivRef} onScroll={handleScroll} isNewSession={isNewSession}>
        {state.history.map((item, index: number) => {
          // Insert warning card if conversation is too long
          const showWarningHere = index === LENGTHY_MESSAGE_WARNING_INDEX;

          return (
            <Fragment key={index}>
              <ErrorBoundary
                FallbackComponent={fallbackRender}
                onReset={() => {
                  dispatch(newSession({ session: undefined, source: 'continue' }));
                }}
              >
                <div style={{
                  minHeight: index === state.history.length - 1 ? "50vh" : 0,
                }}>
                  {item.message.role === "user" ? (
                    <div className="max-w-3xl mx-auto">
                      <div className=" max-w-96 ml-auto px-2">

                        <ContinueInputBox
                          onEnter={async (editorState, modifiers) => {
                            streamResponse(
                              editorState,
                              modifiers,
                              ideMessenger,
                              index,
                            );
                          }}
                          isLastUserInput={isLastUserInput(index)}
                          isMainInput={false}
                          editorState={item.editorState}
                          contextItems={item.contextItems}
                        />
                      </div>
                    </div>
                  ) : (
                    <TimelineItem
                      item={item}
                      iconElement={
                        <ChatBubbleOvalLeftIcon
                          width="16px"
                          height="16px"
                        />
                      }
                      open={
                        typeof stepsOpen[index] === "undefined"
                          ? true
                          : stepsOpen[index]!
                      }
                      onToggle={() => { }}
                    >
                      <StepContainer
                        index={index}
                        isLast={index === sessionState.history.length - 1}
                        isFirst={index === 0}
                        open={
                          typeof stepsOpen[index] === "undefined"
                            ? true
                            : stepsOpen[index]!
                        }
                        key={index}
                        onUserInput={(input: string) => { }}
                        item={item}
                        onReverse={() => { }}
                        onRetry={() => {
                          streamResponse(
                            state.history[index - 1].editorState,
                            state.history[index - 1].modifiers ??
                            defaultInputModifiers,
                            ideMessenger,
                            index - 1,
                          );
                        }}
                        onContinueGeneration={() => {
                          window.postMessage(
                            {
                              messageType: "userInput",
                              data: {
                                input: "Keep going.",
                              },
                            },
                            "*",
                          );
                        }}
                        onDelete={() => {
                          dispatch(
                            deleteMessage({
                              index: index,
                              source: "continue",
                            }),
                          );
                        }}
                        modelTitle={
                          item.promptLogs?.[0]?.completionOptions?.model ??
                          ""
                        }
                      />
                      {showWarningHere && (
                        <WarningCard >
                          <span className="flex items-center gap-2">
                            Your chat is getting lengthy, which may run slower and use tokens faster.
                            Consider starting a new chat to optimize performance and maintain better context.
                            <Link to="command:pearai.newSession">
                              <Button className="min-w-20" style={{ backgroundColor: `${vscBadgeBackground}` }}>
                                New chat
                              </Button>
                            </Link>
                          </span>
                        </WarningCard>
                      )}
                    </TimelineItem>
                  )}
                </div>
              </ErrorBoundary>
            </Fragment>
          );
        })}
      </TopGuiDiv>

      <div
        className={cn(
          "mx-2",
        )}
      >
        {shouldShowSplash && isNewSession &&
          <>
            <div className="max-w-2xl mx-auto w-full h-[calc(100vh-270px)] text-center flex flex-col justify-center">

              <div className="w-full text-center flex flex-col items-center justify-center relative gap-5">
                <img src={getLogoPath("pearai-chat-splash.svg")} alt="..." />
                <div className="w-[300px] flex-col justify-start items-start gap-5 inline-flex">
                  <div className="flex flex-col text-left">
                    <div className="text-2xl">PearAI Chat</div>
                    <div className="h-[18px] opacity-50 text-xs leading-[18px]">
                      Powered by Continue
                    </div>
                  </div>
                </div>
                <div className="w-[300px] text-left opacity-50 text-xs leading-[18px]">
                  Ask questions about the code or make changes.
                </div>
                <div className="w-[300px] text-left space-y-2  text-zinc-400 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span>⌘</span>
                      <span>+</span>
                      <span>I</span>
                    </span>
                    <span>Make inline edits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span>⌘</span>
                      <span>+</span>
                      <span>L</span>
                    </span>
                    <span>Add selection to chat</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        }
        {!active && (
          <InputContainer
            ref={inputContainerRef}
          >
            <ContinueInputBox
              onEnter={(editorContent, modifiers) => {
                sendInput(editorContent, modifiers);
              }}
              isLastUserInput={false}
              isMainInput={true}
              hidden={active}
              onHeightChange={adjustPadding}
            />
            <StatusBar />
          </InputContainer>
        )}
        {/* {isNewSession &&
        <>
          <div className="px-3">
            <ShortcutContainer />
          </div>
        </>
      } */}

        {active && (
          <StopButtonContainer>
            <StopButton
              onClick={() => {
                dispatch(setInactive());
                if (
                  state.history[state.history.length - 1]?.message.content
                    .length === 0
                ) {
                  dispatch(clearLastResponse("continue"));
                }
              }}
            >
              <div className="flex items-center">
                <ChevronUpIcon className="w-3 h-4 stroke-2 pr-1" />
                <BackspaceIcon className="w-4 h-4 stroke-2" />
              </div>
              <span className="text-xs font-medium">Cancel</span>
            </StopButton>
          </StopButtonContainer>
        )}
      </div>
    </>

  );
}

export default GUI;
