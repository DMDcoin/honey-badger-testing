import { Account } from "web3-core";
import { ConfigManager } from "../../configManager";
import { NodeManager } from "../../net/nodeManager";
import { sleep } from "../../utils/time";
import { Watchdog } from "../../watchdog";
import { ContractManager } from "../../contractManager";
import { stakeOnValidators } from "../../net/stakeOnValidators";
import { toNumber } from "../../utils/numberUtils";


class RestakeObservation {

    public constructor(public epochNumber: number, public rewardBlockNumber: number, public countOfDelegators: number, public timeNeededForBlockCreation: number) {

    }
}

class AutoRestakeTest {

    ///public totalDelegatorsCount = 0;

    public async runTest() {


        console.log("Booting testnetwork for automatic restaking test.");
        console.log("Tests and documents the implication of the automatic reward restaking feature https://github.com/DMDcoin/diamond-contracts-core/issues/43");


        //let nodeManager = await bootNetwork();

        const nodeManager = NodeManager.get();
        const contractManager = ContractManager.get();
        let watchdog = new Watchdog(contractManager, nodeManager);

        console.log("booting network...");
        nodeManager.startRpcNode();
        nodeManager.startAllNodes();

        console.log("waiting...");
        let waitTime = 10;
        console.log(`waiting ${waitTime} seconds for boot`);
        await sleep(waitTime * 1000);

        let results : Array<RestakeObservation> = [];


        let validators = await contractManager.getValidators();
        if (validators.length != 1) {
            console.log("Expected 1 validator, got ", validators.length);
            throw new Error("Expected 1 validator, got " + validators.length);
        }

        watchdog.startWatching();

        let numOfNodes = nodeManager.nodeStates.length;
        let targetNumOfValidators = numOfNodes - 1;

        const web3 = ConfigManager.getWeb3();

        console.log("block at startup:", await web3.eth.getBlockNumber());

        // we stake on all nodes except the 1 MOC.
        stakeOnValidators(numOfNodes - 1);

        validators = await contractManager.getValidators();
        console.log("validators after staking: ", validators);

        let isInitialised = false;
        let isWorkingOnDelegateStaking = false;

        let minStake = await contractManager.getMinStake();

        let totalDelegatorsCount = 0;
        let numOfDelegatorsEachEpoch = 10;

        let stakingContract = await contractManager.getStakingHbbft();

        console.log("getting pool addresses.: ", stakingContract.options.address);

        let poolAddresses: Array<string> = [];

        watchdog.onEpochSwitch = async (epoch: number, blockNumber: number) => {
            isWorkingOnDelegateStaking = true;
            let numOfDelegatorStakesConfirmed = 0;
            let numOfDelegatorStakesSent = 0;

            console.log("!!!!!!!!!!!epoch switch!!!!!!!!!!", epoch);
            validators = await contractManager.getValidators();
            console.log("validators after staking: ", validators);
            if (validators.length == targetNumOfValidators) {
                if (!isInitialised) {
                    console.log("initialised!");

                    for (let validator of validators) {
                        poolAddresses.push(await contractManager.getAddressStakingByMining(validator));
                    }

                    isInitialised = true;
                }

                // track the performance values here.
                let blockForEpochSwitch = await web3.eth.getBlock(blockNumber);
                let blockBeforeEpochSwitch = await web3.eth.getBlock(blockNumber - 1);

                let timeConsumed =  toNumber(blockForEpochSwitch.timestamp) - toNumber(blockBeforeEpochSwitch.timestamp);
                console.log("last epoch switch took: ", timeConsumed, " seconds");

                // block.timestamp;

                let nonce = await web3.eth.getTransactionCount(web3.eth.defaultAccount!);
                console.log("nonce: ", nonce);

                for (let i = 0; i < numOfDelegatorsEachEpoch; i++) {
                    // we could just create an deterministic entropy here, so we would not need to store the accounts.
                    // and still have the ability to recover the private key.
                    // something like: "epoch_i";
                    let account = web3.eth.accounts.create();

                    let minStakeForDelegators = web3.utils.toBN(await stakingContract.methods.delegatorMinStake().call());
                    let minStakeForDelegatorsAndFees = minStakeForDelegators.add(web3.utils.toBN(web3.utils.toWei("1", "milliether")));
                    
                    console.log("funding account with nonce: ", nonce, "address:", account.address);
                    web3.eth.sendTransaction({ from: web3.eth.defaultAccount!, to: account.address, value: minStakeForDelegatorsAndFees.toString(), gas: "21000", nonce: nonce })
                        .once("receipt", (receipt) => {
                            console.log("receipt: did receive funds for ", account.address, " tx: ", receipt.transactionHash);
                        })
                        .once("confirmation", async (payload) => {

                            let targetAddress = poolAddresses[i % poolAddresses.length];
                            let txValue = minStakeForDelegators.toString();
                            let balance = await web3.eth.getBalance(account.address);
                            console.log("confirmed funds for ", account.address, "starting delegate staking on ", targetAddress,"balance:", balance, "value: ", txValue);
                            // round robin - so every pool gets funded the same ways, ok almost...

                            // Get the transaction configuration
                            const transactionConfig = stakingContract.methods.stake(targetAddress).encodeABI();

                            // Sign the transaction
                            const signedTransaction = await web3.eth.accounts.signTransaction({
                                from: account.address,
                                to: stakingContract.options.address,
                                data: transactionConfig,
                                value: txValue,
                                gas: "1000000",
                                nonce: 0 // nonce should be 0, because we are using the wallet nonce.
                            }, account.privateKey, (error, signedTransaction) => {
                                if (error) {
                                    console.log("error on signing transaction: ", error);
                                }
                                // if (signedTransaction) {
                                //     console.log("signed transaction: ", signedTransaction);
                                // }
                            });

                            // Send the signed transaction
                            web3.eth.sendSignedTransaction(signedTransaction.rawTransaction!)
                                .once("receipt", (receipt) => {
                                    console.log("receipt of staking ", minStake.toString(), " on ", targetAddress, " tx: ", receipt.transactionHash);
                                })
                                .once('confirmation', (confirmationNumber, receipt) => {
                                    console.log("staked ", minStake.toString(), " on ", targetAddress, " tx: ", receipt.transactionHash);
                                    numOfDelegatorStakesConfirmed++;
                                    totalDelegatorsCount++;
                                })
                                .once('error', (error) => { 
                                    console.log("error on staking ", minStake.toString(), " on ", targetAddress, " error: ", error);
                                })
                                .once('transactionHash', (hash) => { 
                                    console.log("staking ", account.address, " on ", targetAddress, " transactionHash: ", hash);
                                });

                            numOfDelegatorStakesSent++;
                        })

                    nonce++;
                }

                while (numOfDelegatorStakesConfirmed != numOfDelegatorsEachEpoch) {
                    await sleep(10000);
                    console.log("awaiting stakes. sent: ", numOfDelegatorStakesSent, " confirmed: ", numOfDelegatorStakesConfirmed);
                }
                console.log("total staked now:", totalDelegatorsCount);
                isWorkingOnDelegateStaking = false;

            } else {
                if (isInitialised) {
                    console.log("detected unexpected shrink of the validator set - aborting!", validators.length);
                    process.exit(1);
                }
            }
        };

        let targetMaxDelegators = 100000;
        while( totalDelegatorsCount < targetMaxDelegators) {
            await sleep(1000);
        }

        console.log("Test Finished, reached target delegators count of ", targetMaxDelegators);

    }
}


let test = new AutoRestakeTest();
test.runTest().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(err);
    process.exit(1);
});