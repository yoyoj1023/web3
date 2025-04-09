"use client";

import Image from "next/image";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2</span>
            <span className="block text-xl font-bold">(SpeedRunEthereum Challenge #0 extension)</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="flex items-center flex-col flex-grow mt-4">
            <div className="px-5 w-[90%]">
              <h1 className="text-center mb-6">
                <span className="block text-4xl font-bold">Challenge #0: Simple NFT</span>
              </h1>
              <div className="flex flex-col items-center justify-center">
                <Image
                  src="/hero.png"
                  width="727"
                  height="231"
                  alt="challenge banner"
                  className="rounded-xl border-4 border-primary"
                />
                <div className="max-w-3xl">
                  <p className="text-center text-lg mt-8">
                    🎫 Create a simple NFT to learn basics of 🏗️ Scaffold-ETH 2. You'll use 👷‍♀️
                    <a
                      href="https://hardhat.org/getting-started/"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      HardHat
                    </a>{" "}
                    to compile and deploy smart contracts. Then, you'll use a template React app full of important
                    Ethereum components and hooks. Finally, you'll deploy an NFT to a public network to share with
                    friends! 🚀
                  </p>
                  <p className="text-center text-lg">
                    🌟 The final deliverable is an app that lets users purchase and transfer NFTs. Deploy your contracts
                    to a testnet then build and upload your app to a public web server. Submit the url on{" "}
                    <a href="https://speedrunethereum.com/" target="_blank" rel="noreferrer" className="underline">
                      SpeedRunEthereum.com
                    </a>{" "}
                    !
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
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
