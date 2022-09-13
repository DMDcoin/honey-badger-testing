
import Web3 from 'web3';
import fs from 'fs';

import { generateAddressesFromSeed } from './utils';
import { ContinuousTransactionsSender } from './continuousTransactionsSender';
import { Account } from 'web3-core';


export interface TestConfig {

    networkUrl: string,
    networkGitBranch: string,
    networkGitRepo: string,
    nodesDir: string,
    installDir: string,
    openEthereumProfile: string,
    continuousSenderIntervalMin: number,
    continuousSenderIntervalMax: number,
    testDurationMs: number,
    mnemonic: string,
    mnemonicAccountIndex: number,
    calcNonceEveryTurn: boolean,
    trackPerformance: boolean,
    logToTerminal: boolean | undefined,
    logToFile: boolean | undefined,
    maximumPoolSize: number | undefined
}


//const mnemonic = "easy stone plastic alley faith duty away notice provide sponsor amount excuse grain scheme symbol";

const config = require('config') as TestConfig;
console.log('config: ', config);



function verifyExists(value: string) {
    if (value.length == 0) {
        throw new Error('This value must be set.');
    }
}
export class ConfigManager {


    
    public static getConfig(): TestConfig {
        const result = config;

        let mnemonic = config.mnemonic;

        if (!mnemonic) {
            // no mnemonic configured in config.
            // read mnemonic from .mnemonic file.
            const mnemonicFilename = '.mnemonic';

            if (!fs.existsSync(mnemonicFilename)) {
                throw Error('No mnemonic in config file found. No .mnemonic file found.');
            }

            const fileContent = fs.readFileSync(mnemonicFilename)
            result.mnemonic = fileContent.toString('utf8');
        }

        verifyExists(config.installDir);

        return result;
    }

    public static getWeb3(): Web3 {

        const web3Config = this.getConfig();
        const result = new Web3(config.networkUrl);
        result.eth.transactionConfirmationBlocks = 0;
        const addressPairs = generateAddressesFromSeed(web3Config.mnemonic, web3Config.mnemonicAccountIndex + 1);
        const addAddress = {
            address: addressPairs[config.mnemonicAccountIndex].address,
            privateKey: addressPairs[config.mnemonicAccountIndex].privateKey
        }

        const addedWalletAccount = result.eth.accounts.wallet.add(addAddress);
        result.eth.defaultAccount = addedWalletAccount.address;
        result.defaultAccount = addedWalletAccount.address;

        // console.log('default account: ', addedWalletAccount.address);

        return result;
    }

    public static insertWallets(web3: Web3, count = 30) {

        const addressPairs = generateAddressesFromSeed(config.mnemonic, count);


        console.log('calculated pairs: ', addressPairs.length);
        // web3.eth.accounts.wallet.add
        // web3.eth.accounts.wallet.add(addAddress);

        let wallets: Account[] = [];
        for (let i = 0; i < web3.eth.accounts.wallet.length; i++) {
            wallets.push(web3.eth.accounts.wallet[i]);
        }

        console.log("wallets:", wallets.length);

        for (let i = 0; i < count; i++) {

            console.log('inserting wallet: ', i);
            const pair = addressPairs[i];
            

            if (wallets.map(x => x.address).indexOf(pair.address) >= 0) {
                console.log('already found: ', pair.address);
                continue;
            }

            const addedWalletAccount = web3.eth.accounts.wallet.add(pair);

        console.log(`added wallet: `, addedWalletAccount.address);


        }



}
}