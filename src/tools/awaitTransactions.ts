import Web3 from "web3";
import { sleep } from "../utils/time";



export async function awaitTransactions(web3: Web3, blockBeforeTxSend: number, transactions: Array<string>) : Promise<number> {

  let lastAnalysedBlock = blockBeforeTxSend;
  const totalTxs =  transactions.length;
  let txsConfirmed = 0;

  while ( transactions.length > 0 ) {
    await sleep(200);
    // console.log("awaiting confirmation of txs: ", transactions.length);
    let currentBlock = await web3.eth.getBlockNumber(); 

    for (let blockToAnalyse = lastAnalysedBlock + 1; blockToAnalyse <= currentBlock; blockToAnalyse ++) {
      console.log('analysing block', blockToAnalyse);

      const block = await web3.eth.getBlock(blockToAnalyse, false);

      // transactions.forEach(x => console.log);
      console.log(`transactions in Block#  ${blockToAnalyse} : ${block.transactions.length}`);

      //console.log('interesting transactions:',transactions);

      
      const txCountBeforeFilter = transactions.length;
      transactions = transactions.filter(x => !block.transactions.includes(x));
      const txCountAfterFilter = transactions.length;
      const txCountConfirmed = txCountBeforeFilter - txCountAfterFilter;
      txsConfirmed += txCountConfirmed;
      console.log(`block ${blockToAnalyse} proccessed. confirmed txs this block: ${txCountConfirmed}. ${txsConfirmed}/${totalTxs} (${(txsConfirmed*100/totalTxs).toPrecision(3)} %)`);
    }

    lastAnalysedBlock = currentBlock;
  }
  
  console.log('all transactions confirmed at block:', lastAnalysedBlock);

  return lastAnalysedBlock;
}