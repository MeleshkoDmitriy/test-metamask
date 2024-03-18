"use client"

import Image from "next/image";
import styles from "./page.module.scss";
import { Wallet } from "@/components/wallet/Wallet";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { ethers } from 'ethers';

export default function Home() {

  const [ isConnected, setConnected ] = useState(false);
  const [ account, setAccount ] = useState<null | string>(null);
  const [ userBalance, setUserBalance ] = useState<null | string>(null);
  const { ethers, formatUnits } = require('ethers');

  const handlerConnect = async () => {
    if (window.ethereum) {
      window.ethereum.request({ method: "eth_requestAccounts" })
        .then((accounts:string | Array<string>) => {
          accountChanger(accounts[0]);
        });
    } else {
      setAccount(null);
      setUserBalance(null);
      setConnected(true);
    }
  }

  const accountChanger = (newAcc: string) => {
    setAccount(newAcc);
    getBalance(newAcc);
    setConnected(prev => !prev);
  }

  const getBalance = (address: string) => {
    window.ethereum.request({ method: 'eth_getBalance', params: [ address, 'latest' ] })
      .then((balance: string) => {
        setUserBalance(formatUnits(balance, 'ether'));
      })
  }

  useEffect(() => {
    if(window.ethereum) {
      window.ethereum.on('accountsChanged', accountChanger);
    } 
  }, []);


  return (
    <main className={styles.main}>
      {isConnected  ? <Wallet account={account} userBalance={userBalance}/>
                    : <Button variant="contained" 
                        className={styles.connect}
                        onClick={handlerConnect}>
                          Подключить кошелек
                      </Button>}
    </main>
  );
}
