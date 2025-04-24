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
            <span className="block text-xl font-bold">(SpeedRunEthereum Challenge #4 extension)</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col sm:flex-row">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} />
          </div>

          <div className="flex items-center flex-col flex-grow pt-10">
            <div className="px-5">
              <h1 className="text-center mb-6">
                <span className="block text-2xl mb-2">SpeedRunEthereum</span>
                <span className="block text-4xl font-bold">Challenge #4: ⚖️ Build a DEX</span>
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
                    This challenge will help you build/understand a simple decentralized exchange, with one token-pair
                    (ERC20 BALLOONS ($BAL) and ETH). This repo is an updated version of the{" "}
                    <a
                      href="https://medium.com/@austin_48503/%EF%B8%8F-minimum-viable-exchange-d84f30bd0c90"
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      original tutorial
                    </a>{" "}
                    and challenge repos before it. Please read the intro for a background on what we are building first!
                  </p>
                  <p className="text-center text-lg">
                    🌟 The final deliverable is an app that allows users to seamlessly trade ERC20 BALLOONS ($BAL) with
                    ETH in a decentralized manner. Users will be able to connect their wallets, view their token
                    balances, and buy or sell their tokens according to a price formula! Submit the url on{" "}
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
