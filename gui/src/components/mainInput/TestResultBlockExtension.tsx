// gui/src/components/mainInput/TestResultBlockExtension.tsx
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import styled from "styled-components";
import { vscForeground, vscInputBackground, vscInputBorder } from "..";
import { getFontSize } from "../../util";
import React from "react"; // React import 추가

// 요구사항 표시 스타일
const RequirementsDiv = styled.div`
  padding: 8px 12px;
  margin-bottom: 8px;
  border: 1px solid ${vscInputBorder};
  border-radius: 4px;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  font-size: ${getFontSize() * 0.9}px;
  white-space: pre-wrap;
  word-break: break-word;
`;

// HTML 내용 표시 스타일
const HtmlContentWrapper = styled.div`
  padding: 0;
  border: 1px solid ${vscInputBorder};
  border-radius: 4px;
  background-color: ${vscInputBackground};
  color: ${vscForeground};
  font-size: ${getFontSize()}px;
  overflow: hidden;

  & > pre {
    margin: 0;
    border: none;
    border-radius: 0;
  }
`;

// TestResultBlock 렌더링 컴포넌트
const TestResultBlockComponent = ({ node }) => {
    const { title, category, htmlContent, requirements } = node.attrs;

    return (
        <NodeViewWrapper className="test-result-block-node m-0 p-0" as="div">
            {/* 요구사항이 있으면 표시 */}
            {requirements && (
                <RequirementsDiv>
                    <strong>요구사항:</strong>
                    <div>{requirements}</div>
                </RequirementsDiv>
            )}
            {/* 카테고리와 제목 표시 (옵션) */}
            {/* {category && title && <h5 style={{ marginTop: 0, marginBottom: '4px' }}>{title} [{category}]</h5>} */}
            {/* HTML 내용 렌더링 */}
            {htmlContent && (
                <HtmlContentWrapper dangerouslySetInnerHTML={{ __html: htmlContent }} />
            )}
        </NodeViewWrapper>
    );
};


// Tiptap 노드 확장 정의
export default Node.create({
    name: "testResultBlock",
    group: "block",
    atom: true, // 단일 블록으로 취급
    selectable: true,
    draggable: true,
    isolating: true,

    parseHTML() {
        return [
            {
                tag: 'div[data-type="testResultBlock"]', // 이 태그/속성으로 파싱
                // getAttrs: (domNode) => { ... } // 필요시 DOM에서 속성 추출 로직 추가
            },
        ];
    },

    addAttributes() {
        return {
            title: { default: null },
            category: { default: null },
            htmlContent: { default: null },
            requirements: { default: null },
        };
    },

    renderHTML({ node, HTMLAttributes }) {
        // HTML로 렌더링될 때 data-* 속성 추가
        const attrsToRender: Record<string, string> = {
            'data-type': 'testResultBlock',
        };
        if (node.attrs.title) attrsToRender['data-title'] = node.attrs.title;
        if (node.attrs.category) attrsToRender['data-category'] = node.attrs.category;
        if (node.attrs.htmlContent) attrsToRender['data-html-content'] = node.attrs.htmlContent;
        if (node.attrs.requirements) attrsToRender['data-requirements'] = node.attrs.requirements;

        return ["div", mergeAttributes(HTMLAttributes, attrsToRender), 0];
    },

    addNodeView() {
        return ReactNodeViewRenderer(TestResultBlockComponent);
    },
}); 