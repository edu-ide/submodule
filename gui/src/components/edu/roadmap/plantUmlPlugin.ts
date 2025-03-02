// PlantUML 코드 블록을 이미지로 변환하는 rehype 플러그인
export default function plantUmlPlugin() {
  return (tree) => {
    tree.children.forEach((node) => {
      if (node.type === 'code' && node.lang === 'plantuml') {
        const url = `http://www.plantuml.com/plantuml/svg/${encodeURIComponent(node.value)}`;
        node.type = 'element';
        node.tagName = 'img';
        node.properties = { src: url, alt: 'PlantUML Diagram' };
      }
    });
  };
}