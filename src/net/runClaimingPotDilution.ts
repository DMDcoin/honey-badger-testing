// this service mimic's the claiming Pot dilution mechanism of DMD chain with expected parameters.

import schedule from 'node-schedule';
import BigNumber from 'bignumber.js';
import BN from 'bn.js';

import { ConfigManager } from '../configManager';
import { ContractManager } from "../contractManager";
import { generateNthAddressFromSeed } from '../utils';
import { sleep } from "../utils/time";

const START_BLOCK_NUMBER = 21000;
const ADDRESS_INDEX = 50;
const D1_TIMER_SECONDS = 133920;
const D2_TIMER_SECONDS = 267840;
const D3_TIMER_SECONDS = 2678400;

async function sendDilutionAmount(
  contractManager: ContractManager,
  caller: string,
  amount: BN
): Promise<void> {
  // diluted amounts are split 50/50 to DAO and ReinsertPot.

  const toBN = contractManager.web3.utils.toBN;

  const reinsertPotAddress = await contractManager.getRewardContractAddress();
  const governanceAddress = await contractManager.getGovernancePotAddress();

  //nconst balance = toBN(await contractManager.web3.eth.getBalance(caller));

  // const dilutionAmount = balance.div(toBN(dilutionFraction));
  console.log(`dilutionAmount: ${amount.toString()}`);

  const reinsertAmount = amount.div(toBN(2));
  const governanceAmount = amount.sub(reinsertAmount);
  
  await contractManager.web3.eth.sendTransaction({
    to: reinsertPotAddress,
    from: caller,
    value: reinsertAmount,
    gas: '100000',
    gasPrice: '1000000000'
  });

  await contractManager.web3.eth.sendTransaction({
    to: governanceAddress,
    from: caller,
    value: governanceAmount,
    gas: '100000',
    gasPrice: '1000000000'
  });
}

async function execute_dillute2() {


  const target_epoch = 1126;
  const contractManager = ContractManager.get();
  const config = ConfigManager.getConfig();
  const keyPair = generateNthAddressFromSeed(config.mnemonic, ADDRESS_INDEX);
  const web3 = contractManager.web3;  
  web3.eth.accounts.wallet.add(keyPair);

  const sendFrom = keyPair.address;
  console.log('send address:', sendFrom);

  while (true) {
    await sleep(10000);
    // format Date.now() to readable format
    let now = new Date(Date.now()).toLocaleString(); // 9/17/2016, 11:18:48 AM
  
    let currentEpoch = await contractManager.getEpoch("latest");
    
    console.log(`${now} current epoch: ${currentEpoch}. waiting for target epoch: ${target_epoch}.`);

    if (currentEpoch == target_epoch) { 
      console.log(`current epoch: ${currentEpoch} is equal to target epoch: ${target_epoch}.`);
      await sendDilutionAmount(contractManager, sendFrom, web3.utils.toBN(web3.utils.toWei('141443', "ether")));

      return;
    }

  }
}

async function setup() {
  const contractManager = ContractManager.get();
  const web3 = contractManager.web3;

  const config = ConfigManager.getConfig();
  const keyPair = generateNthAddressFromSeed(config.mnemonic, ADDRESS_INDEX);
  const sendFrom = keyPair.address;

  console.log('send from:', sendFrom);

  // return;
  let currentBalance = BigNumber(await web3.eth.getBalance(sendFrom));


  // const dillutionTransaction1 = '235739';
  // const dillutionTransaction2 = '141443';
  const dillutionTransaction3 = '330035';

  

  //const amountNotClaimedInPhase1 = '';
  //const amountNotClaimedInPhase1 = '';
  //const amountNotClaimedInPhase1 = '';



  if (currentBalance.isZero()) {
    console.log('feeding dillution account ', sendFrom);
    await web3.eth.sendTransaction({from: web3.eth.defaultAccount!, gas: '21000', to: sendFrom, value: web3.utils.toWei('710000', 'ether')});

  }

  web3.eth.accounts.wallet.add(keyPair);

  let currentBlock = await web3.eth.getBlockNumber();

  // while (currentBlock < START_BLOCK_NUMBER) {
  //   await sleep(1000);
  //   // format Date.now() to readable format
  //   let now = new Date(Date.now()).toLocaleString(); // 9/17/2016, 11:18:48 AM


  //   console.log(`${now} - `,currentBlock);
  //   currentBlock = await web3.eth.getBlockNumber();
  // }

  const startBlockTimestamp = Number((await web3.eth.getBlock(START_BLOCK_NUMBER)).timestamp);
 
  const now = new Date(Date.now());

  
 
  const execTimeThirdDilution = new Date((startBlockTimestamp + D3_TIMER_SECONDS) * 1000);

  console.log(`Scheduling job to execute dilute3() at ${execTimeThirdDilution}`);

  sendDilutionAmount(contractManager, sendFrom,  web3.utils.toBN(web3.utils.toWei(dillutionTransaction3, "ether")));

  // schedule.scheduleJob(execTimeThirdDilution, function () {
  //   sendDilutionAmount(contractManager, sendFrom,  web3.utils.toBN(web3.utils.toWei(dillutionTransaction3, "ether"))).catch((error) => {
  //     console.error(error);
  //     process.exitCode = 1;
  //   });
  // });
}


// execute_dillute2().catch((error) => {
//   console.error(error);
//   process.exitCode = 1;  
// });


setup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
