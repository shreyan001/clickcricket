import { tool } from "@langchain/core/tools";
import { ethers } from "ethers";
import { z } from "zod";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { CUSTOM_UI_YIELD_NAME } from "./server";

const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_ETH_RPC_URL);
const defaultWalletAddress = "0x78160b2c45b0A7FAC6857DC3FED965c4aD55803F";

export const balanceSchema = z.object({
  walletAddress: z.string().optional().describe("The wallet address to fetch the balance for"),
});

export async function fetchBalanceData(input: z.infer<typeof balanceSchema>) {
  const walletAddress = input.walletAddress || defaultWalletAddress;
  const balance = await provider.getBalance(walletAddress);
  const balanceInEth = ethers.formatEther(balance);
  console.log(balanceInEth, "this is the balance in eth");
  return { balanceInEth };
}

export const renderBalanceTool = tool(
  async (input, config) => {
    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <div className="text-center text-gray-500">Loading...</div>,
          type: "append",
        },
      },
      config,
    );

    const data = await fetchBalanceData(input);

    await dispatchCustomEvent(
      CUSTOM_UI_YIELD_NAME,
      {
        output: {
          value: <div className="text-center p-4 bg-gray-100 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-2">Your Wallet Balance</h2>
                    <p className="text-2xl text-green-500">{data.balanceInEth} ETH</p>
                 </div>,
          type: "update",
        },
      },
      config,
    );

    console.log(data, "this is the fetched balance data");
    return JSON.stringify(data, null);
  },
  {
    name: "render_balance",
    description: "A tool to fetch and render the wallet balance.",
    schema: balanceSchema,
  },
);