'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Search } from 'lucide-react'
import { AIMessageText, HumanMessageText } from "@/components/ui/message"
import { EndpointsContext } from '@/app/agent'
import { useActions } from '@/ai/client'

export function DefiChatbotSleek() {

  const actions = useActions<typeof EndpointsContext>();
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<[role: string, content: string][]>([ ["human", "Hello!"],
    ["ai", "Hi there! How can I assist you today?"]]);
  const [elements, setElements] = useState<JSX.Element[]>([]);

  const handleSend = async () => { 
    const newElements = [...elements]; 
    
    newElements.push(
      <div className="flex flex-col w-full gap-1 mt-auto" key={history.length}>
        <HumanMessageText content={input} />
      </div>
    );
    const element = await actions.agent({
      chat_history: history,
      input: input
    });

  
    newElements.push(
      <div className="flex flex-col gap-1 w-full max-w-fit mr-auto">
        {element.ui}
      </div>
    );

    
    setElements(newElements);
    setInput("");
  };

  return (
    <div className="flex h-screen bg-black text-white font-mono">
      <div className="w-[30%] bg-[#FFC700] text-black p-4">
        <h1 className="text-3xl font-bold mb-6">DeFi AI Chatbot</h1>
        <div className="mb-6">
          <h2 className="text-xl font-bold mb-2">Portfolio</h2>
          <div className="bg-black text-white p-4">
            <p className="text-lg">Balance: $10,245.67</p>
            <p className="text-lg">Net Worth: $15,789.32</p>
            <p className="text-lg text-[#FF69B4]">Profit: +12.5%</p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-2">Active Operations</h2>
          <ul className="space-y-2">
            {["ETH Staking: 5 ETH", "AAVE Lending: 1000 USDC", "Uniswap Liquidity: ETH/USDC"].map((operation, index) => (
              <li key={index} className="bg-black text-white p-2">
                {operation}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <Button className="bg-black text-white border border-white rounded-md px-3 py-1 text-sm hover:bg-white hover:text-black transition-colors">
              Menu
            </Button>
            <Select>
              <SelectTrigger className="w-[200px] bg-black text-white border border-white rounded-md">
                <SelectValue placeholder="Select Conversation" />
              </SelectTrigger>
              <SelectContent className="bg-black text-white border-gray-800">
                <SelectItem value="current">Current Conversation</SelectItem>
                <SelectItem value="eth">ETH Price Inquiry</SelectItem>
                <SelectItem value="defi">DeFi Strategies</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Input 
              placeholder="Search conversations..." 
              className="bg-black text-white border-gray-800 rounded-md"
            />
            <Button className="bg-black text-white border border-white rounded-md px-3 py-1 text-sm hover:bg-white hover:text-black transition-colors">
              <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
        <div className="flex flex-col w-full gap-1 mt-auto">{elements}</div>
        </ScrollArea>
        <div className="p-4 border-t border-gray-800">
          <div className="flex space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="bg-black text-white border-gray-800 rounded-md flex-grow"
            />
            <Button 
              onClick={handleSend} 
              className="bg-black text-white border border-white rounded-md px-4 py-2 text-sm hover:bg-white hover:text-black transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}