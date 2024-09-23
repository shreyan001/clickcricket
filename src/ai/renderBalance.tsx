import { ethers } from "ethers";
import { useState, useEffect } from "react";
import { dispatchCustomEvent } from "@langchain/core/callbacks/dispatch/web";
import { CUSTOM_UI_YIELD_NAME } from "@/app/actions";
const provider = new ethers.JsonRpcProvider(process.env.ETH_RPC_URL);
const defaultWalletAddress = "0x78160b2c45b0A7FAC6857DC3FED965c4aD55803F";

export default function RenderBalance() {
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function fetchBalance() {
            try {
                await dispatchCustomEvent(
                    CUSTOM_UI_YIELD_NAME,
                    {
                        output: {
                            value: <div className="text-center text-gray-500">Loading...</div>,
                            type: "append",
                        },
                    }
                );

                const balance = await provider.getBalance(defaultWalletAddress);
                const balanceInEth = ethers.formatEther(balance);
                setBalance(balanceInEth);

                await dispatchCustomEvent(
                    CUSTOM_UI_YIELD_NAME,
                    {
                        output: {
                            value: (
                                <div className="text-center">
                                    <h3 className="text-xl font-bold">Wallet Balance</h3>
                                    <p className="text-lg">{balanceInEth} ETH</p>
                                </div>
                            ),
                            type: "update",
                        },
                    }
                );
            } catch (error) {
                console.error("Error fetching balance:", error);
                await dispatchCustomEvent(
                    CUSTOM_UI_YIELD_NAME,
                    {
                        output: {
                            value: <div className="text-center text-red-500">Error: {error.message}</div>,
                            type: "update",
                        },
                    }
                );
            } finally {
                setLoading(false);
            }
        }

        fetchBalance();
    }, []);

    if (loading) {
        return <div className="text-center text-gray-500">Loading...</div>;
    }

    return (
        <div className="text-center">
            <h3 className="text-xl font-bold">Wallet Balance</h3>
            <p className="text-lg">{balance} ETH</p>
        </div>
    );
}
