'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Code, ExternalLink, Check } from 'lucide-react'
import { publicClient } from '@/walletConnect/siwe'
import { useWalletClient, useAccount } from 'wagmi'
import { contractsArray } from '@/lib/contractCompile'
import { PieChart } from 'react-minimal-pie-chart'

export function SmartContractDisplay({ contractCode }: { contractCode: string }) {
  const [isDeployed, setIsDeployed] = useState(false)
  const [showCode, setShowCode] = useState(true)
  const [deployedAddress, setDeployedAddress] = useState<string>('')
  const [isCopied, setIsCopied] = useState(false)
  const { data: walletClient } = useWalletClient()
  const { address: walletAddress } = useAccount()
  const [solidityScanResults, setSolidityScanResults] = useState<any>(null)
  const [showScanComments, setShowScanComments] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(contractCode)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const useDeployContract = async ({ sourceCode }: { sourceCode: string }) => {
    try {
      const contract = contractsArray.find(contract => contract.contractCode === sourceCode)
      
      if (!contract) {
        throw new Error('Contract not found for the provided source code')
      }
  
      const { abi, bytecode, solidityScanResults } = contract
      setSolidityScanResults(solidityScanResults)
  
      const hash = await walletClient?.deployContract({
        abi,
        //@ts-ignore
        bytecode,
        account: walletAddress,
        args: [],
      })
  
      console.log('Contract deployed. Transaction hash:', hash)
  
      if (hash) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash })
        console.log('Contract deployed at:', receipt.contractAddress)
        return receipt.contractAddress
      }
    } catch (error) {
      console.error('Error deploying contract:', error)
      throw error
    }
  }

  const useHandleDeploy = async () => {
    setIsLoading(true)
    const hashaddress = await useDeployContract({ sourceCode: contractsArray[0].contractCode })

    if (hashaddress) {
      setDeployedAddress(hashaddress)
      setShowCode(false)
      setIsDeployed(true)
    }
    setIsLoading(false)
  }

  const toggleCode = () => {
    setShowCode(!showCode)
  }
 
  useEffect(() => {
    const contract = contractsArray.find(contract => contract.contractCode === contractsArray[0].contractCode)
    if (contract && contract.solidityScanResults) {
      setSolidityScanResults(contract.solidityScanResults)
    }
  }, [contractCode])

  const roundedSecurityScore = Math.round(solidityScanResults?.securityScore || 0);
  const roundedThreatScore = Math.round(solidityScanResults?.threatScore || 0);

  return (
    <div className="w-full max-w-2xl bg-gray-900 text-white rounded-md overflow-hidden border border-white font-mono">
      <div className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">ReusableEscrow Contract</h3>
          {!isDeployed && (
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          )}
        </div>
        {showCode && (
          <ScrollArea className="h-96 w-full border border-white rounded-md p-2">
            <pre className="text-sm">
              <code>{contractsArray[0].contractCode}</code>
            </pre>
          </ScrollArea>
        )}
       {isDeployed && !showCode && (
  <div className="bg-gray-900 p-4 rounded-md border border-[#FFC700] mb-4">
    <div className="space-y-2">
      <p className="text-green-400 font-semibold">Contract deployed successfully!</p>
      <p className="text-sm">
        <span className="text-gray-300">Contract Address:</span>{' '}
        <span className="text-blue-400 break-all cursor-pointer" onClick={() => navigator.clipboard.writeText(deployedAddress)} title="Click to copy">
          {deployedAddress}
        </span>
      </p>
      <div className="mt-4">
        <p className="text-sm text-gray-300 mt-2 mb-2">Audit your deployed contract to get a detailed report:</p>
        <Button onClick={() => window.open(`https://solidityscan.com/quickscan/${deployedAddress}/blockscout/base-sepolia`, '_blank')} className="bg-[#FFC700] text-black rounded-none hover:bg-[#FFC700]/80 transition-colors duration-200">
          SolidityScan
        </Button>
      </div>
    </div>
  </div>
)}
</div>
<div className="bg-[#FFC700] text-black p-4 flex justify-between items-center rounded-b-md">
  {!isDeployed ? (
    <Button 
      onClick={useHandleDeploy} 
      className="bg-black text-white border border-white hover:bg-white hover:text-black transition-colors duration-200"
    >
      {isLoading ? (
        <>
          <span className="animate-pulse mr-2">●</span>
          Deploying...
        </>
      ) : (
        'Deploy Contract'
      )}
    </Button>
  ) : (
    <>
      <Button
        onClick={toggleCode}
        variant="outline"
        size="sm"
        className="bg-black text-white border border-white hover:bg-white hover:text-black transition-colors duration-200 flex items-center"
      >
        <Code className="w-4 h-4 mr-2" />
        {showCode ? 'Hide Code' : 'Show Code'}
      </Button>
      <a
        href={`https://base-sepolia.blockscout.com/address/${deployedAddress}`}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-black text-white px-4 py-2 rounded-md hover:bg-white hover:text-black transition-colors duration-200 flex items-center"
      >
        View Contract <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </>
  )}
</div>
      {solidityScanResults && (
  <div className="p-4 border-t border-white">
    <h4 className="text-lg font-semibold mb-4">SolidityScan Results</h4>
    <div className="flex items-start mb-6">
      <div className="w-1/2 pr-4">
        <div className="w-32 h-32 mx-auto">
          <PieChart
            data={[
              { value: roundedSecurityScore, color: '#FFC700' },
              { value: 100 - roundedSecurityScore, color: '#333' }
            ]}
            totalValue={100}
            lineWidth={20}
            label={() => `${roundedSecurityScore}`}
            labelStyle={{ fontSize: '22px', fill: '#fff' }}
            labelPosition={0}
          />
        </div>
        <p className="text-center mt-2 text-sm">Security Score</p>
      </div>
      <div className="w-1/2 pl-4">
        <div className="w-32 h-32 mx-auto">
          <PieChart
            data={[
              { value: roundedThreatScore, color: '#FF69B4' },
              { value: 100 - roundedThreatScore, color: '#333' }
            ]}
            totalValue={100}
            lineWidth={20}
            label={() => `${roundedThreatScore}` }
            labelStyle={{ fontSize: '22px', fill: '#fff' }}
            labelPosition={0}
          />
        </div>
        <p className="text-center mt-2 text-sm">Threat Score</p>
      </div>
    </div>
    <Button 
      onClick={() => setShowScanComments(!showScanComments)} 
      className="mb-4 bg-black text-white border border-white hover:bg-white hover:text-black transition-colors duration-200 w-full"
    >
      {showScanComments ? 'Hide' : 'Show'} Scan Comments
    </Button>
    {showScanComments && (
      <div className="text-sm mt-2 space-y-4">
        <div className="bg-gray-900 p-3 rounded-md">
          <h5 className="font-semibold mb-2 text-[#FFC700]">Security Score Comments:</h5>
          <p>{solidityScanResults.securityScoreComments}</p>
        </div>
        <div className="bg-gray-900 p-3 rounded-md">
          <h5 className="font-semibold mb-2 text-[#FF69B4]">Security Scan Comments:</h5>
          <p>{solidityScanResults.securityScanComments}</p>
        </div>
      </div>
    )}
  </div>
)}
    </div>
  )
}