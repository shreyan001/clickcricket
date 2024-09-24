"use client";

import { StreamableValue, useStreamableValue } from "ai/rsc";


export function AIMessageText({ content }: { content: string }) {
  return (
    <div className="bg-gray-500 text-white p-2 rounded-md mb-2">
      {content}
    </div>
  );
}

export function HumanMessageText({ content }: { content: string }) {
  return (
    <div className="bg-blue-500 text-white p-2 rounded-md mb-2">
      {content}
    </div>
  );
}


export function AIMessage(props: { value: StreamableValue<string> }) {
  const [data] = useStreamableValue(props.value);

  if (!data) {
    return null;
  }
  return <AIMessageText content={data} />;
}
