import { ethers } from "ethers";
import { StateGraph } from "@langchain/langgraph";
import { BaseMessage, AIMessage, HumanMessage } from "@langchain/core/messages";
import { START, END } from "@langchain/langgraph";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { ChatGroq } from "@langchain/groq";
import { systemPrompt } from "./contractTemplate";


type guildState = {
    input: string,
    contractData?: string | null,
    chatHistory?: BaseMessage[],
    messages?: any[] | null,
    operation?: string,
    result?: string,
}

export default function nodegraph() {
    const graph = new StateGraph<guildState>({
        channels: {
            messages: { value: (x: any[], y: any[]) => x.concat(y) },
            input: { value: null },
            result: { value: null },
            contractData: { value: null },
            chatHistory: { value: null },
            operation: { value: null }
        }
    });

    // Initial Node: Routes user requests to the appropriate node
    graph.addNode("initial_node", async (state: guildState) => {
        const SYSTEM_TEMPLATE = `You are an AI agent representing AgentsGuild. Your role is to route user requests to the appropriate specialized agent. Based on the user input and chat history, respond with ONLY ONE of the following words:
        - "verify_Node" if the request is about verifying a smart contract
        - "escrow_Node" if the request is related to Escrow strategies
        - "vault_Node" if the request is related to defi and other Vault strategies
        - "unknown" if the request doesn't fit into any of the above categories
        Respond with ONLY ONE of these words, nothing else.`;

        const prompt = ChatPromptTemplate.fromMessages([
            ["system", SYSTEM_TEMPLATE],
            new MessagesPlaceholder({ variableName: "chat_history", optional: true }),
            ["human", "{input}"]
        ]);

        const response = await prompt.pipe(new ChatGroq({
            modelName: "Llama3-8b-8192",
            temperature: 0.7,
            apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
        })).invoke({ input: state.input, chat_history: state.chatHistory });

        console.log(response.content, "Initial Message");

        const content = response.content as string;
        if (content.includes("verify_Node")) {
            return {  messages: [response.content], operation: "verify_Node" };
        } else if (content.includes("escrow_Node")) {
            return { messages: [response.content], operation: "Escrow_Node" };
        } else if (content.includes("vault_Node")) {
            return { messages: [response.content], operation: "Vault_Node" };
        } else if (content.includes("unknown")) {
            const CONVERSATIONAL_TEMPLATE = `You are an AI assistant for AgentsGuild. The Agents Node within the AgentsGuild framework is designed to facilitate interactions between users and specialized agents, each tailored to address specific tasks within the Web3 and DeFi ecosystems. This node serves as a central point for processing user requests, routing them to the appropriate agent based on the inquiry.

            Key Features:
            - Role Definition: Each agent within the node has distinct roles, such as managing escrow transactions or implementing DeFi strategies. For instance, the EscrowSmartContract agent focuses on secure transaction management, while the SimpleDeFiStrategies agent provides insights and execution for straightforward DeFi operations.
            - User Interaction: The node is built to engage users conversationally, answering questions about the guild, its operations, and the specific roles of its agents. This creates a welcoming environment for users to explore the available functionalities.
            - Data Handling: The Agents Node efficiently processes user inputs, ensuring that data requests are met with clear, actionable information. This helps users navigate their inquiries with ease and confidence.
            - Collaborative Framework: The node is part of a larger ecosystem within AgentsGuild, promoting collaboration among agents to deliver comprehensive solutions to users.

            This structure enables the AgentsGuild to offer tailored, user-friendly interactions, enhancing the overall experience in the Web3 and DeFi space.

            If the user's request is unrelated to our services, politely explain that we cannot process their request and suggest something related to AgentsGuild that they might find interesting. Always maintain a friendly and helpful tone, and dont give long responses, keep it short or medium length and concise in markdown format`;

            const conversationalPrompt = ChatPromptTemplate.fromMessages([
                ["system", CONVERSATIONAL_TEMPLATE],
                new MessagesPlaceholder({ variableName: "chat_history", optional: true }),
                ["human", "{input}"]
            ]);

            const conversationalResponse = await conversationalPrompt.pipe(new ChatGroq({
                modelName: "Llama3-8b-8192",
                temperature: 0.7,
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
            })).invoke({ input: state.input, chat_history: state.chatHistory });

            return { result: conversationalResponse.content as string, messages: [conversationalResponse.content] };
        } 
    });

    //@ts-ignore
    graph.addEdge(START, "initial_node");
    //@ts-ignore
    graph.addConditionalEdges("initial_node",
        async (state) => {
            if (!state.messages || state.messages.length === 0) {
                console.error("No messages in state");
                return "end";
            }

            if (state.operation === "verify_Node") {
                return "verify_node";
            } else if (state.operation === "Escrow_Node") {
                return "escrow_node";
            } else if (state.operation === "Vault_Node") {
                return "vault_node";
            } else if (state.result) {
                return "end";
            }
        },
        {
            verify_node: "verify_node",
            escrow_node: "escrow_node",
            vault_node: "vault_node",
            end: END,
        }
    );

    // Add the verify_node
    graph.addNode("verify_node", async (state: guildState) => {
        // Verification logic for previously deployed smart contract
        console.log("Verifying smart contract:", state.contractData);
        return { result: "Contract verified: " + state.contractData };
    });

    // Add the Escrow_Node
    graph.addNode("escrow_node", async (state: guildState) => {
        console.log("Generating Escrow contract");

        const escrowPrompt = ChatPromptTemplate.fromMessages([
            ["system", systemPrompt],
            new MessagesPlaceholder({ variableName: "chat_history", optional: true }),
            ["human", "{input}"]
        ]);

        try {
            const response = await escrowPrompt.pipe(new ChatGroq({
                modelName: "Llama3-8b-8192",
                temperature: 0.7,
                apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
            })).invoke({ 
                input: state.input, 
                chat_history: state.chatHistory 
            });

            const content = response.content as string;

            const match = content.match(/```[\s\S]*?```/);
            let contractData = null;
            let resultData = content;

            if (match) {
                // Remove the backticks and any language specifier (like 'solidity')
                contractData = match[0].replace(/```(?:solidity)?\s?|\s?```/g, '').trim();
                resultData = content.replace(match[0], '').trim();
            }

            return { 
                contractData: contractData,
                result: resultData,
                messages: [content]
            };
        } catch (error) {
            console.error("Error in escrow_node:", error);
            return { 
                result: "Error generating Escrow contract", 
                messages: ["I apologize, but there was an error generating the Escrow contract. Please try again or provide more information about your requirements."]
            };
        }
    });

    // Add the Vault_Node
    graph.addNode("vault_node", async (state: guildState) => {
        // Logic for handling Vault strategies
        console.log("Executing Vault strategy");
        return { result: "Vault strategy executed successfully" };
    });

    //@ts-ignore    
    graph.addEdge("verify_node", END);
    //@ts-ignore
    graph.addEdge("escrow_node", END);
    //@ts-ignore
    graph.addEdge("vault_node", END);

    const data = graph.compile();
    return data;
}