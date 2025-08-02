"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        {/* Profile Section */}
        <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8 mb-16 px-5 max-w-4xl mx-auto">
          <div className="flex-shrink-0">
            <div className="w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
              <Image
                src="/ted3.png"
                alt="PY Chou Profile Picture"
                width={256}
                height={256}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center text-center md:text-left">
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-4">
              Hi! I am PY Chou, a software developer.
            </h1>
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-2 mb-4">
              <p className="text-base md:text-lg font-medium text-gray-600">Connected Address:</p>
              <Address address={connectedAddress} />
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="grow bg-base-300 w-full px-8 py-12">
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
