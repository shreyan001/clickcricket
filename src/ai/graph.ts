'use server'

import { ethers } from "ethers";
import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { START, END } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import RenderBalance from "./renderBalance";


const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const defaultWalletAddress = "0x78160b2c45b0A7FAC6857DC3FED965c4aD55803F";

type lazyState = {
    messages: any[] | null,
    walletAddress?: string | null,
    balanceRSC?: any | null,
}

export default function nodegraph() {
    const graph = new StateGraph<lazyState>({
        channels: {
            messages: {
                value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
            },
            walletAddress: {
                value: null,
            },
            balanceRSC: {
                value: null,
            }
        }
    });

    graph.addNode("initial_node", async (state: lazyState) => {
        const SYSTEM_TEMPLATE = `You are a web3 assistant. You can answer questions about web3 and fetch wallet balances.`;

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            new MessagesPlaceholder("messages"),
        ]);

        const response = await prompt.pipe(new ChatGroq({
            modelName: "Llama3-8b-8192",
            temperature: 0,
            apiKey: process.env.GROQ_API_KEY,
        })).invoke({ messages: state.messages });

        return {
            messages: [response]
        }
    });

    /* @ts-ignore */
    graph.addEdge(START, "initial_node");

    /* @ts-ignore */
    graph.addConditionalEdges("initial_node", async (state) => {
        const lastMessage = state.messages[state.messages.length - 1].content.toLowerCase();
        if (lastMessage.includes("wallet balance")) {
            return "fetch_balance_node";
        } else {
            return END;
        }
    }, {
        fetch_balance_node: "fetch_balance_node",
        end: END,
    });

    graph.addNode("fetch_balance_node", async (state: lazyState) => {
        const walletAddress = state.walletAddress || defaultWalletAddress;
        const balance = await provider.getBalance(walletAddress);
        const balanceInEth = ethers.formatEther(balance);

        return {
            
            balanceRSC: RenderBalance()
        }
    });

    /* @ts-ignore */
    graph.addEdge("fetch_balance_node", END);

    return graph.compile();
}




