
import React, { useEffect, useContext, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { IdeMessengerContext } from '@ide/context/IdeMessenger';
import { EditorContent } from 'core/protocol/types';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import { markEducationLearnMessageSent } from '../../redux/slices/stateSlice';

const LearnEntryWrapper: React.FC = () => {
  const ideMessenger = useContext(IdeMessengerContext);
  const dispatch = useDispatch();
  const hasSentMessageRef = useRef(false);

  const educationLearnMessageSent = useSelector((state: RootState) => state.state.educationLearnMessageSent);

  useEffect(() => {
    if (ideMessenger && !hasSentMessageRef.current && !educationLearnMessageSent) {
      console.log('[LearnEntryWrapper] Sending initial message to chat (first time).');
      const editorContent: EditorContent = {
        type: "assistant",
        content: [
          {
            type: "educationBlock",
            attrs: {
              title: "학습 시작",
              content: "어떤 공부를 하실래요?",
              category: "안내",
              markdown: "어떤 공부를 하실래요?"
            }
          }
        ]
      };

      ideMessenger.post('addEducationContextToChat', {
        content: editorContent,
        shouldRun: true,
        prompt: "어떤 공부를 하실래요?"
      });

      dispatch(markEducationLearnMessageSent());
      hasSentMessageRef.current = true;

    } else if (ideMessenger && educationLearnMessageSent) {
       console.log('[LearnEntryWrapper] Initial message already sent (checked via Redux state).');
       if (!hasSentMessageRef.current) {
            hasSentMessageRef.current = true;
       }
    } else if (!ideMessenger) {
      console.warn('[LearnEntryWrapper] ideMessenger context is not available yet.');
    }
  }, [ideMessenger, dispatch, educationLearnMessageSent]);

  return <Outlet />;
};

export default LearnEntryWrapper; 