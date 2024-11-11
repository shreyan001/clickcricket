'use client';

import { ArweaveWalletKit } from "arweave-wallet-kit";
import "arweave-wallet-kit/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ArweaveWalletKit
      config={{
        permissions: ["ACCESS_ADDRESS", "SIGN_TRANSACTION"],
        ensurePermissions: true,
        appInfo: {
          name: "Click Cricket",
          logo: "/cricket-logo.png" // Add your logo path here
        }
      }}
    >
      {children}
    </ArweaveWalletKit>
  );
}