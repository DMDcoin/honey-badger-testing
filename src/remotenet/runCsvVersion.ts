import BigNumber from "bignumber.js";
import Web3 from "web3";
import { ConfigManager } from "../configManager";
import { ContractManager } from "../contractManager";
import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";
import { getNodeVersion } from "./getNodeVersion";

async function run() {

  const nodes = await getNodesFromCliArgs();
  const contracts = ContractManager.get();
  const block = await contracts.web3.eth.getBlockNumber();

  const minStake = await contracts.getMinStake(block);

  
  let allValidators = (await contracts.getValidators()).map(x => x.toLowerCase());

  console.log(`min stake: ${minStake.toString(10)}`);
  const csvLines: Array<String> = [];
  for (const n of nodes) {

    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);



    let version = getNodeVersion(nodeName);

    let isAvailable = false;
    let isStaked = false;


    let totalStake = new BigNumber(0);
    let stakeString = "0";

    let poolAddress = "";
    if (n.address) {
      isAvailable = await contracts.isValidatorAvailable(n.address, block);

      poolAddress = await contracts.getAddressStakingByMining(n.address);
      totalStake = await contracts.getTotalStake(poolAddress);
      stakeString = totalStake.toString(10);
      console.log(`stake: ${stakeString}`);
      isStaked = totalStake.isGreaterThanOrEqualTo(minStake);
    }

    stakeString = totalStake.div(new BigNumber("1000000000000000000")).toString();
    
    let current = "FALSE";
    if (n.address) {

      if (allValidators.includes(n.address.toLowerCase())) {
        current = "TRUE";
      } 

    }

    const sha1binaryDuo = cmdR(nodeName, `sha1sum ~/${ConfigManager.getNetworkConfig().installDir}/diamond-node`);
    const sha1binary = sha1binaryDuo.split(" ")[0];
    csvLines.push(`"${n.sshNodeName()}";"${current}";"${isAvailable}";"${isStaked}";"${stakeString}";"${n.address}";"${poolAddress}";"${sha1binary}";"${version}";`);
  }

  console.log('"node";"current";"available";"staked";"stake";"address";"poolAddress", "sha1binary"; "version";');
  csvLines.forEach(x => console.log(x));
}


run();
