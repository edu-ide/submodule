async function* toAsyncIterable(nodeReadable: NodeJS.ReadableStream): AsyncGenerator<Uint8Array> {
  for await (const chunk of nodeReadable) {
    yield chunk as Uint8Array;
  }
}

export async function* streamResponse(response: Response): AsyncGenerator<string> {
  if (response.status !== 200) {
    throw new Error(await response.text());
  }

  if (!response.body) {
    throw new Error("No response body returned.");
  }

  // Get the major version of Node.js
  const nodeMajorVersion = parseInt(process.versions.node.split(".")[0], 10);

  if (nodeMajorVersion >= 20) {
    // Use the new API for Node 20 and above
    const stream = (ReadableStream as any).from(response.body);
    for await (const chunk of stream.pipeThrough(new TextDecoderStream("utf-8"))) {
      yield chunk;
    }
  } else {
    // Fallback for Node versions below 20
    // Streaming with this method doesn't work as version 20+ does
    const decoder = new TextDecoder("utf-8");
    const nodeStream = response.body as unknown as NodeJS.ReadableStream;
    for await (const chunk of toAsyncIterable(nodeStream)) {
      yield decoder.decode(chunk, { stream: true });
    }
  }
}

function parseDataLine(line: string): any {
  const json = line.startsWith("data: ")
    ? line.slice("data: ".length)
    : line.slice("data:".length);

  try {
    const data = JSON.parse(json);
    if (data.error) {
      throw new Error(`Error streaming response: ${data.error}`);
    }

    return data;
  } catch (e) {
    throw new Error(`Malformed JSON sent from server: ${json}`);
  }
}

function parseSseLine(line: string): { done: boolean; data: any } {
  if (line.startsWith("data: [DONE]")) {
    return { done: true, data: undefined };
  }
  if (line.startsWith("data:")) {
    return { done: false, data: parseDataLine(line) };
  }
  if (line.startsWith(": ping")) {
    return { done: true, data: undefined };
  }
  return { done: false, data: undefined };
}

export async function* streamSse(response: Response): AsyncGenerator<any> {
  let buffer = "";
  for await (const value of streamResponse(response)) {
    buffer += value;

    let position: number;
    while ((position = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, position);
      buffer = buffer.slice(position + 1);

      const { done, data } = parseSseLine(line);
      if (done) {
        break;
      }
      if (data) {
        yield data;
      }
    }
  }

  if (buffer.length > 0) {
    const { done, data } = parseSseLine(buffer);
    if (!done && data) {
      yield data;
    }
  }
}

export async function* streamJSON(response: Response): AsyncGenerator<any> {
  console.log("streamJSON 시작, 응답 상태:", response.status, response.statusText);
  
  try {
    let buffer = "";
    for await (const value of streamResponse(response)) {
      console.log("streamResponse에서 받은 청크:", value);
      buffer += value;
      
      // 버퍼 내용 출력
      console.log("현재 버퍼 내용:", buffer);
      
      let position;
      // 줄바꿈을 찾아 처리
      while ((position = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, position);
        console.log("파싱할 줄:", line);
        
        try {
          const data = JSON.parse(line);
          console.log("파싱된 데이터:", data);
          yield data;
        } catch (parseError) {
          console.error("JSON 파싱 오류:", parseError, "원본 텍스트:", line);
        }
        
        buffer = buffer.slice(position + 1);
      }
    }
    
    // 마지막 버퍼 처리
    if (buffer.length > 0) {
      console.log("남은 버퍼 처리:", buffer);
      try {
        const data = JSON.parse(buffer);
        console.log("마지막 파싱된 데이터:", data);
        yield data;
      } catch (parseError) {
        console.error("마지막 JSON 파싱 오류:", parseError, "원본 텍스트:", buffer);
      }
    }
  } catch (error) {
    console.error("streamJSON 처리 중 오류 발생:", error);
  } finally {
    console.log("streamJSON 함수 종료");
  }
}
