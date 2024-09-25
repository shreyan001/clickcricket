import { ethers } from "ethers";
import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { START, END } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import renderBalance from "./renderBalance";
import BalanceDisplay from './renderBalance';

export const CUSTOM_UI_YIELD_NAME = "__yield_ui__";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC_URL);
const defaultWalletAddress = "0x78160b2c45b0A7FAC6857DC3FED965c4aD55803F";

type lazyState = {
    input: string,
    walletAddress?: string | null,
    balanceRSC?: React.ReactNode | null,
    chatHistory?: BaseMessage[],
    messages?: any[] | null,
    result?: string,
    balanceData?: {
        address: string | null,
        balance: string | null,
    };
}

export default function nodegraph() {
    const graph = new StateGraph<lazyState>({
        channels: {
            messages: {
                value: (x: any[], y: any[]) => x.concat(y),
            },
            input: {
                value: null,
            },
            result: {
                value: null,
            },
            walletAddress: {
                value: null,
            },
            balanceData: {
                value: null,
            },
            chatHistory: {
                value: null,
            }
        }
    });

    graph.addNode("initial_node", async (state: lazyState) => {
        const SYSTEM_TEMPLATE = `You are a web3 assistant. You can answer questions about web3 and fetch wallet balances. 
        When use specifically asks for wallet balance just resond as balanceRSC`;

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            new MessagesPlaceholder({
                variableName: "chat_history",
                optional: true,
            }),
            ["human", "{input}"],
        ]);

        const response = await prompt.pipe(new ChatGroq({
            modelName: "Llama3-8b-8192",
            temperature: 0.7,
            apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        })).invoke({ input: state.input, chat_history: state.chatHistory });

        console.log(response.content, "this is the first message");

        const content = response.content as string;
        if (content.includes("balanceRSC")) {
            return {
                walletAddress: defaultWalletAddress,
                messages: [response.content]
            }
        } else {
            return {
                result: response.content as string,
                messages: [response.content]
            }
        }
    });

    /* @ts-ignore */
    graph.addEdge(START, "initial_node");
    // @ts-ignore
    graph.addConditionalEdges("initial_node",
        async (state) => {
            if (!state.messages || state.messages.length === 0) {
                console.error("No messages in state");
                return "end";  // Changed from END to "end"
            }

            const lastMessage = state.messages[state.messages.length - 1];

            if (!lastMessage || typeof lastMessage !== 'string') {
                console.error("Last message is invalid", lastMessage);
                return "end";  // Changed from END to "end"
            }

            if (state.walletAddress) {
                return "fetch_balance_node";
            } else {
                return "end";
            }
        },
        {
            fetch_balance_node: "fetch_balance_node",
            end: END,
        }
    );

    graph.addNode("fetch_balance_node", async (state: lazyState) => {
        const walletAddress = state.walletAddress || defaultWalletAddress;
        let balanceInEth = null;
        
        try {
            const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC_URL);
            const balance = await provider.getBalance(walletAddress);
             balanceInEth = ethers.formatEther(balance);
        } catch (error) {
            console.error('Error fetching balance:', error);
        }

        return {
           balanceData: {
            address: walletAddress,
            balance: balanceInEth,
           }
        };
    });

    /* @ts-ignore */
    graph.addEdge("fetch_balance_node", END);
    const data = graph.compile();
    return data;
}




