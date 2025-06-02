import { VscCopy, VscOpenPreview } from 'react-icons/vsc';

interface ChallengeItemProps {
  challenge: {
    title: string;
    description: string;
  };
}

const ChallengeItem: React.FC<ChallengeItemProps> = ({ challenge }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('내용이 복사되었습니다!'))
      .catch(console.error);
  };

  const sendToEditor = (content: string) => {
    if (window.vscode) {
      window.vscode.postMessage({
        command: 'insertCode',
        text: content
      });
    }
  };

  return (
    <li className="challenge-item">
      <h3>{challenge.title}</h3>
      <p>{challenge.description}</p>
      <div className="action-icons">
        <VscCopy
          onClick={() => copyToClipboard(challenge.description)}
          className="icon"
          title="설명 복사"
        />
        <VscOpenPreview
          onClick={() => sendToEditor(challenge.description)}
          className="icon"
          title="에디터로 보내기"
        />
      </div>
    </li>
  );
};

export default ChallengeItem; 