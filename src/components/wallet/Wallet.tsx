import styles from './Wallet.module.scss'
import '../../app/variables.scss'
import { Alert, Box, Button, IconButton, Paper, Snackbar, TextField, Typography, styled } from '@mui/material';
import { FC, useEffect, useRef, useState } from 'react';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Image from 'next/image';
import { cutString } from '@/lib/utils/utils';
import ethImage from '../../../public/ethereum-logo.png';
import bnbImage from '../../../public/bnb-logo.png';
import { ethers } from 'ethers';
import Web3 from 'web3';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';

const StyledPaper = styled(Paper)({
    borderRadius: 10,
    height: 300,
    width: 450,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    marginInline: 10,
});

const SmallPaper = styled(Paper)({
    borderRadius: 10,
    height: 50,
    width: 450,
    display: 'flex',
    alignItems: 'center',
    marginInline: 10,
});

declare global {
    interface Window {
      ethereum?: any;
    }
}

declare module 'ethers' {
    export interface ethers {
      providers: any;
    }
}

interface WalletProps {
    account: string | null,
    userBalance: string | null,
}

export const Wallet:FC<WalletProps> = ({ account, userBalance }) => {

    const [ isSnack, setSnack ] = useState(false);
    const [ value, setValue ] = useState('');
    const [ newAddress, setNewAddress ] = useState('');
    const [ ethBalance, setEthBalance ] = useState('0');
    const [ bnbBalance, setBnbBalance ] = useState('0');
    const [ networkType, setNetworkType ] = useState('mainnet');

    const ref = useRef('');

    const { ethers } = require('ethers');

    useEffect(() => {
        if(!window.ethereum) return;

        const updateEthBalance = async () => {
            let provider;
            if (typeof account === 'string') {
              if (networkType === 'mainnet') {
                provider = new ethers.providers.Web3Provider(window.ethereum);
              } else if (networkType === 'testnet') {
                const rinkebyProvider = new ethers.providers.JsonRpcProvider('https://palm-testnet.infura.io/v3/b66dbf5a1e144b0bbbff2935ddb76e54');
                provider = new ethers.providers.Web3Provider(window.ethereum).connect(rinkebyProvider);
              }
          
              const balance = await provider.getBalance(account);
              setEthBalance(Web3.utils.fromWei(balance.toString(), 'ether'));
            } 
          };

          const updateBnbBalance = async () => {
            let web3: any;
            if (typeof account === 'string') {
              if (networkType === 'mainnet') {
                web3 = new Web3(window.ethereum);
              } else if (networkType === 'testnet') {
                web3 = new Web3('https://palm-testnet.infura.io/v3/b66dbf5a1e144b0bbbff2935ddb76e54');
              }
          
              const balance = await web3.eth.getBalance(account);
              setBnbBalance(Web3.utils.fromWei(balance, 'ether'));
            } 
          };

        if (account) {
            updateEthBalance();
            updateBnbBalance();
        }
        if (typeof account === 'string') {
            setNewAddress(account);
            ref.current = account;
        } else if (Array.isArray(account)) {
            setNewAddress(account[0]);
            ref.current = account[0];
        }

        updateProvider();

    }, [account, networkType]);

    const updateProvider = () => {
        if (networkType === 'mainnet') {
          window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } else if (networkType === 'testnet') {
          window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x4',
                chainName: 'Rinkeby Test Network',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://palm-testnet.infura.io/v3/b66dbf5a1e144b0bbbff2935ddb76e54'],
                blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
              },
            ],
          });
        }
      };
      
    const balanceList = [
        {
            title: 'Ethereum',
            balance: ethBalance,
            image: ethImage,
        },
        {
            title: 'BNB',
            balance: bnbBalance,
            image: bnbImage,
        }
    ]

    const handleCopy = () => {
        setSnack(true);
        navigator.clipboard.writeText(ref.current);
    };

    const sendValue = () => {
        if(value.length !== 42) {
            console.log(value.length)
            alert('Адрес должен содержать 42 символа');
        } else {
            setValue('');
        }
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
        setSnack(false);
    };

    const handleTabChange = (event: React.ChangeEvent<{}>, newValue: string) => {
        setNetworkType(newValue);
    }; 

    return (
        <section className={styles.wallet}>
            {account && <SmallPaper elevation={6}>
                            <Typography variant='body1'
                                        className={styles.userBalance}>
                                                Ваш баланс: {userBalance}
                            </Typography>
                        </SmallPaper> }
            <StyledPaper className={styles.container} elevation={6}>
                { account && <Box sx={{ width: '100%', height: '55px', paddingInline: '5px',typography: 'body1', display: 'flex', justifyContent: 'center'}} >
                        <Tabs value={value} onChange={(event, newValue) => handleTabChange(event, newValue)}>
                                    <Tab    value="mainnet" label="Mainnet" 
                                            className={networkType === 'mainnet' ? `${styles.active}` : ''}
                                            />
                                    <Tab    value="testnet" label="Testnet"
                                            className={networkType === 'testnet' ? `${styles.active}` : ''}
                                            />
                        </Tabs>
                </Box> }
                <Box className={styles.addressBlock}>
                    <Typography variant='body1' className={styles.address}>
                        {account ? `Адрес: ${cutString(newAddress)}` : 'Пожалуйста, установите Chrome extension MetaMask'}
                    </Typography>
                    {   account &&  <IconButton onClick={handleCopy} className={styles.iconButton}>
                                        <ContentCopyIcon fontSize='small'/>
                                    </IconButton>
                    }
                </Box>
                <Box className={styles.balances}>
                    {balanceList?.map((item) => {
                        return (
                            <Box key={item.title} className={styles.item}>
                                <Image src={item.image} alt={item.title} width={35} height={35}/>
                                <Typography variant='subtitle2' className={styles.counter}>{item.balance}</Typography>
                            </Box>
                        )
                    })}
                </Box>
                <Box className={styles.actions}>
                    <TextField  label={account ? "Введите публичный адрес (0x)" : "Транзакция невозможна"} 
                                variant="filled" size="small"
                                className={styles.input}
                                disabled={!account}
                                value={value}
                                onChange={(e) => setValue(e.target.value)}/>
                    <Button variant={account ? "contained" : "outlined"} 
                            className={styles.button}
                            disabled={!account}
                            onClick={sendValue}>
                        Отправить
                    </Button>
                </Box>
                <Snackbar   open={isSnack} 
                            autoHideDuration={1500} 
                            onClose={handleClose} 
                            anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                                <Alert
                                    onClose={handleClose}
                                    severity="success"
                                    variant="filled">
                                        Адрес успешно скопирован!
                                </Alert>
                </Snackbar>
            </StyledPaper>
        </section>
    )
}