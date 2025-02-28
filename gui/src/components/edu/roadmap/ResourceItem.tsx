import { VscCopy, VscOpenPreview } from 'react-icons/vsc';

interface ResourceItemProps {
  resource: {
    title: string;
    url: string;
  };
}

const ResourceItem: React.FC<ResourceItemProps> = ({ resource }) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('링크가 복사되었습니다!'))
      .catch(console.error);
  };

  return (
    <li className="resource-item">
      <a href={resource.url} target="_blank" rel="noopener noreferrer">
        {resource.title}
      </a>
      <div className="action-icons">
        <VscCopy 
          onClick={() => copyToClipboard(resource.url)} 
          className="icon" 
          title="링크 복사"
        />
      </div>
    </li>
  );
};

export default ResourceItem; 