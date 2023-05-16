import { ConfigManager } from './configManager';
import { ContractManager } from './contractManager';
import createConnectionPool, {sql} from '@databases/pg';
import { insertHeader } from './db/database';

// const createCsvStringifier = require('csv-writer').createObjectCsvStringifier;

async function logHeaders() {
  const web3 = ConfigManager.getWeb3();
  // const testConfig = ConfigManager.getConfig();
  const contractAddresses = ContractManager.getContractAddresses();

  const latestBlock = await web3.eth.getBlockNumber();

  // const numOfBlocksToDisplay = Math.min(latestBlock, 255);

  const writeToDB = true;

  const pw = process.env["DMD_DB_POSTGRES"];

  let connectionString = `postgres://postgres:${pw}@localhost:5432/postgres`;

  let dbConnection = createConnectionPool(connectionString);

  // createConnectionPool();


  const numOfBlocksToDisplay = latestBlock;

  let lastTimeStamp = 0;

  // console.log(``);
  console.log('"block","hash","extraData","timestamp","date","duration","num_of_validators","transaction_count","txs_per_sec"');

  const contractManager = ContractManager.get();

  for (let i = numOfBlocksToDisplay; i >= 0; i--) {
    const blockToAnalyse = i;
    const blockHeader = await web3.eth.getBlock(blockToAnalyse);
    const thisTimeStamp = Number.parseInt(String(blockHeader.timestamp));
    const duration = -(thisTimeStamp - lastTimeStamp);
    const transaction_count = blockHeader.transactions.length;
    const num_of_validators = await (await contractManager.getValidators(blockToAnalyse)).length;
    const txs_per_sec = transaction_count / duration;
    console.log(`"${blockHeader.number}","${blockHeader.hash}","${blockHeader.extraData}","${blockHeader.timestamp}","${new Date(thisTimeStamp * 1000).toISOString()}","${duration}","${num_of_validators}","${transaction_count}","${txs_per_sec.toFixed(4)}"`);
    // console.log( `${blockHeader.number} ${blockHeader.hash} ${blockHeader.extraData} ${blockHeader.timestamp} ${new Date(thisTimeStamp * 1000).toUTCString()} ${lastTimeStamp - thisTimeStamp}`);

    lastTimeStamp = thisTimeStamp;

    if (writeToDB) {
      await insertHeader(dbConnection, blockHeader.number, blockHeader.hash, duration, new Date(thisTimeStamp * 1000), blockHeader.extraData, transaction_count, txs_per_sec);
    }

    // if (blockHeader.timestamp is number)
    // lastTimeStamp = Number.parseInt(blockHeader.timestamp);
  }
}

logHeaders();
