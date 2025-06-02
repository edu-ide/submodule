import styled from 'styled-components';

const QuizContainer = styled.div`
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 4px;
`;

const QuizBlock = ({ value }) => {
  const lines = value.split('\n');
  const question = lines[0].replace('Q: ', '');
  const answers = lines.slice(1, -1).map((line) => line.replace('A', 'Answer '));
  const correct = lines[lines.length - 1].replace('Correct: ', '');

  return (
    <QuizContainer>
      <h3>{question}</h3>
      <ul>
        {answers.map((answer, i) => (
          <li key={i}>{answer}</li>
        ))}
      </ul>
      <p>정답: {correct}</p>
    </QuizContainer>
  );
};

export default QuizBlock;