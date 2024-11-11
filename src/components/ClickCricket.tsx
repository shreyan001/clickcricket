'use client'

import React, { useState, useRef, useEffect } from 'react'

import { useAccount } from 'wagmi'
import { useArweaveWallet } from "arweave-wallet-kit";

export function ClickCricketInterface() {
  const { address, isConnected } = useAccount()
  const actions = useActions<typeof EndpointsContext>();
  const [input, setInput] = useState("")
  const [history, setHistory] = useState<[role: string, content: string][]>([
    ["human", "Hello!"],
    ["ai", "Welcome to Agents Guild! How can I assist you today?"]
  ]);
  const [elements, setElements] = useState<JSX.Element[]>([]);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [score, setScore] = useState(0);
  const [wickets, setWickets] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [currentBall, setCurrentBall] = useState(0);

  const { connected, address: arweaveAddress } = useArweaveWallet();

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [elements]); // This will trigger whenever elements change

  const handleSend = async () => {
    if (!isConnected) {
      // Optionally, you can show a message to the user here
      console.log("Please connect your wallet to chat");
      return;
    }

    const newElements = [...elements];
    
    const humanMessageRef = React.createRef<HTMLDivElement>();
    newElements.push(
      <div className="flex flex-col items-end w-full gap-1 mt-auto" key={history.length} ref={humanMessageRef}>
        <HumanMessageText content={input} />
      </div>
    );
    
    setElements(newElements);
    setInput("");

    // Scroll to the human message
    setTimeout(() => {
      humanMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    const element = await actions.agent({
      chat_history: history,
      input: input
    });

    const aiMessageRef = React.createRef<HTMLDivElement>();
    setElements(prevElements => [
      ...prevElements,
      <div className="flex flex-col gap-1 w-full max-w-fit mr-auto" key={history.length + 1} ref={aiMessageRef}>
        {element.ui}
      </div>
    ]);

    // Scroll to show the top of the AI message
    setTimeout(() => {
      aiMessageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 2000);
  };

  const handleClick = async () => {
    if (!connected) {
      console.log("Please connect your Arweave wallet to play");
      return;
    }
    
    if (gameOver) return;
    
    const runs = Math.floor(Math.random() * 7); // 0-6 runs
    
    if (runs === 0) {
      setWickets(prev => prev + 1);
      if (wickets >= 9) {
        setGameOver(true);
      }
    } else {
      setScore(prev => prev + runs);
    }
    
    setCurrentBall(prev => (prev + 1) % 6);
    
    // You can now use the address for game state persistence
    console.log("Player address:", arweaveAddress);
  };

  return (
    <div className="flex flex-col h-screen bg-green-800 text-white font-mono">
      <nav className="flex justify-between items-center p-4 border-b border-green-700">
        <div className="flex items-center space-x-2">
          <span className="text-xl font-bold">Click Cricket</span>
        </div>
        <ConnectButton 
          showBalance={false}
          className="bg-green-600 hover:bg-green-500 transition-colors"
        />
      </nav>
      
      <div className="flex-1 flex">
        {/* Scoreboard */}
        <div className="w-[30%] bg-green-900 p-4 flex flex-col">
          <h1 className="text-3xl font-bold mb-6">Scoreboard</h1>
          <div className="space-y-4">
            <div className="text-2xl">
              <p>Score: {score}</p>
              <p>Wickets: {wickets}/10</p>
              <p>Ball: {currentBall}/6</p>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            onClick={handleClick}
            disabled={gameOver}
            className="bg-white text-green-800 rounded-full w-32 h-32 text-xl font-bold
                     hover:bg-green-100 transition-colors disabled:opacity-50"
          >
            {gameOver ? "Game Over!" : "Click to Bat!"}
          </button>
          
          {gameOver && (
            <button
              onClick={() => {
                setScore(0);
                setWickets(0);
                setGameOver(false);
                setCurrentBall(0);
              }}
              className="mt-4 bg-green-600 px-4 py-2 rounded hover:bg-green-500"
            >
              New Game
            </button>
          )}
        </div>
      </div>
    </div>
  );
}