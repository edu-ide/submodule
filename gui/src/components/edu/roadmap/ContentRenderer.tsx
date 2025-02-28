const ContentRenderer: React.FC<{ sections: ContentSection[] }> = ({ sections }) => {
  return (
    <>
      {sections.map((section, index) => {
        switch (section.type) {
          case 'markdown':
            return <Markdown key={index}>{section.content}</Markdown>;
          case 'code':
            return (
              <pre key={index}>
                <code className={`language-${section.language}`}>
                  {section.content}
                </code>
              </pre>
            );
          default:
            return null;
        }
      })}
    </>
  );
}; 