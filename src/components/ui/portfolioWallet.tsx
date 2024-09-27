import { Button } from "./button"
import { Copy } from "lucide-react"

type Asset = {
    name: string
    symbol: string
    balance: number
    price: number
    value: number
  }
  
  type PortfolioWalletProps = {
    balance?: number
    netWorth?: number
    profit?: number
    address?: string
    assets?: Asset[]
  }
  
  const exampleData: PortfolioWalletProps = {
    balance: 10245.67,
    netWorth: 15789.32,
    profit: 12.5,
    address: "0x1234...5678",
    assets: [
      { name: "Ethereum", symbol: "ETH", balance: 5.5, price: 1800, value: 9900 },
      { name: "USD Coin", symbol: "USDC", balance: 1000, price: 1, value: 1000 },
      { name: "Aave", symbol: "AAVE", balance: 10, price: 80, value: 800 },
    ]
  }
  
  export default function PortfolioWallet({ 
    balance = exampleData.balance, 
    netWorth = exampleData.netWorth, 
    profit = exampleData.profit, 
    assets = exampleData.assets 
  }: PortfolioWalletProps) {
    return (
      <div className="w-[90%] bg-black text-white font-mono p-3 rounded-lg border border-[#FFC700]">
        <h2 className="text-xl font-bold mb-3 text-[#FFC700]">Agent Resources</h2>
        <div className="mb-4 bg-gray-900 p-3 rounded-lg">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>
              <p className="text-xs text-gray-400">Balance</p>
              <p>${balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Net Worth</p>
              <p>${netWorth.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Profit</p>
              <p className="text-[#FF69B4]">+{profit.toFixed(2)}%</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-[#FFC700] mb-1">Available Assets</h3>
          {assets.map((asset, index) => (
            <div key={index} className="bg-gray-900 p-2 rounded-lg text-xs">
              <div className="flex justify-between items-center">
                <p className="font-bold">{asset.symbol}</p>
                <p>${asset.value.toLocaleString()}</p>
              </div>
              <div className="flex justify-between text-gray-400">
                <p>{asset.balance.toLocaleString()}</p>
                <p>${asset.price.toLocaleString()}/token</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }