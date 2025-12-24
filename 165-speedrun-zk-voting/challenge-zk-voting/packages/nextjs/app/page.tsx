
"use client";

import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import type { NextPage } from "next";
import Link from "next/link";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
            <span className="block text-xl font-bold">(SpeedRunEthereum ZK Voting extension)</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>
          
  <div className="flex items-center flex-col flex-grow mt-4">
    <div className="px-5 w-[90%]">
      <h1 className="text-center mb-6">
        <span className="block text-4xl font-bold">🚩 Challenge: ZK Voting</span>
      </h1>
      <div className="flex flex-col items-center justify-center">
        <Image
          src="/readme-zk.png"
          width="727"
          height="231"
          alt="ZK Voting challenge banner"
          className="rounded-xl border-4 border-primary"
        />
        <div className="max-w-3xl">
          <p className="text-center text-lg mt-8">
            🗳️ Create a private, Sybil-resistant voting system where anyone can prove they’re eligible and vote
            exactly once, <strong>without revealing who they are</strong>.
          </p>
          <p className="text-center text-lg">
            🔐 You’ll use <strong>zero-knowledge proofs</strong> to keep votes unlinkable to identities while
            keeping results publicly verifiable on-chain. Registered voters generate commitments, produce proofs,
            and submit them to a Solidity verifier contract generated from your Noir circuits.
          </p>
          <p className="text-center text-lg">
            🌟 <strong>Final deliverable:</strong> an app where anyone can create a <em>Yes/No question</em>, and
            registered voters can cast their votes anonymously. Results remain fully transparent and visible live
            on-chain.
          </p>
          <p className="text-center text-lg">
            🚀 Deploy your contracts to a <strong>Sepolia</strong>, publish your app to a <strong>Vercel</strong>,
            and submit your URL on{" "}
            <a href="https://speedrunethereum.com/" target="_blank" rel="noreferrer" className="underline">
              SpeedRunEthereum.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  </div>

        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <BugAntIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/debug" passHref className="link">
                  Debug Contracts
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <MagnifyingGlassIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore your local transactions with the{" "}
                <Link href="/blockexplorer" passHref className="link">
                  Block Explorer
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
