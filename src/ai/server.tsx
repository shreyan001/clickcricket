import { createStreamableUI } from 'ai/rsc';
import nodegraph from './graph';
import { AIMessageText, HumanMessageText } from "@/components/ui/message";
import { ReactNode } from 'react';
import { AIProvider } from './client';
import { BaseMessage } from '@langchain/core/messages';
import BalanceDisplay from './renderBalance';
import { Runnable } from '@langchain/core/runnables';

export async function streamRunnableUI({ chat_history, input }: { chat_history?: BaseMessage[], input: string }) {
  const graph = nodegraph();
  const stream = await graph.stream({ 
    input,
    chat_history,
  });

  const ui = createStreamableUI();

  const runnable = graph;
  for await (const streamEvent of (
    runnable as Runnable<any, any>
  ).streamEvents({ input, chat_history }, {
    version: "v2",
  })) {
        console.log('Stream event:', streamEvent);
  }
 
  for await (const value of stream) {
    console.log('Stream value:', JSON.stringify(value, null, 10));

    const [nodeName, output] = Object.entries(value)[0];
    console.log('Node name:', nodeName);
    console.log('Output:', JSON.stringify(output, null, 2));

    // Add a loading indicator when the stream starts
    if (nodeName === 'initial_node') {
      ui.append(<div className="animate-pulse bg-gray-300 rounded-md p-2 w-24 h-6"></div>);
    }
    if (nodeName !== 'end') {
      if ((output as { result?: string }).result) {
        ui.update(<AIMessageText content={(output as { result: string }).result} />);
      }
      if (nodeName === 'fetch_balance_node' && (output as any).balanceData) {
        const { address } = (output as any).balanceData;
        // Check if address is an object or string
        const addressValue = typeof address === 'object' ? address.address : address;
        ui.append(<BalanceDisplay address={addressValue} />);
      }
    }
  }

  ui.done();
  return { ui: ui.value };
}

export function exposeEndpoints<T extends Record<string, unknown>>(
  actions: T,
): {
  (props: { children: ReactNode }): Promise<JSX.Element>;
  $$types?: T;
} {
  return async function AI(props: { children: ReactNode }) {
    return <AIProvider actions={actions}>{props.children}</AIProvider>;
  };
}
