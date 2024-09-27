'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Search, Wallet } from 'lucide-react'
import { AIMessageText, HumanMessageText } from "@/components/ui/message"
import { EndpointsContext } from '@/app/agent'
import { useActions } from '@/ai/client'
import ConnectButton from './ui/walletButton'
import Image from 'next/image'
import PortfolioWallet from './ui/portfolioWallet'

export function AgentsGuildInterface() {
  const actions = useActions<typeof EndpointsContext>();
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<[role: string, content: string][]>([
    ["human", "Hello!"],
    ["ai", "Welcome to Agents Guild! How can I assist you today?"]
  ]);
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
    <div className="flex flex-col h-screen bg-black text-white font-mono">
      <nav className="flex justify-between items-center p-4 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <Image src="/guild.png" alt="Agents Guild Logo" width={35} height={35} />
          <span className="text-xl font-bold">Agents Guild</span>
        </div>
       <ConnectButton/>
      </nav>
      <div className="flex flex-1">
        <div className="w-[30%] bg-[#FFC700] text-black p-4 flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Agents Guild Dashboard</h1>
          <div className="mb-6">
       <PortfolioWallet/>
          </div>
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Recent Projects</h2>
            <ul className="space-y-2">
              {["Next.js Integration", "DeFi Market Analysis", "OpenAI SDK Implementation"].map((project, index) => (
                <li key={index} className="bg-black text-white p-2">
                  {project}
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
                  <SelectValue placeholder="Select Project" />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-gray-800">
                  <SelectItem value="current">Current Project</SelectItem>
                  <SelectItem value="nextjs">Next.js Integration</SelectItem>
                  <SelectItem value="defi">DeFi Analysis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search projects..." 
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
                placeholder="Describe your project or ask a question..."
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
    </div>
  )
}