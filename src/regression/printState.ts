// the RPC Nodes holds the data, 
// all other nodes get deleted the caches.

import { ContractManager } from "../contractManager";
import { NodeManager } from "./nodeManager";

export async function printState(nodeManager: NodeManager, contractManager: ContractManager) {
  

  const validatorSet = contractManager.getValidatorSetHbbft();
  const staking =  await contractManager.getStakingHbbft();

  const epochStartTime = new Date(Number.parseInt(await staking.methods.stakingEpochStartTime().call()) * 1000);
  const phaseTransition = new Date(Number.parseInt(await staking.methods.startTimeOfNextPhaseTransition().call()) * 1000);

  console.log(`epoch start time UTC: ${epochStartTime.toUTCString()}`);
  console.log(`next Phase Transition UTC: ${phaseTransition.toUTCString()}`);

  nodeManager.nodeStates.forEach(async (s) => {
    if (s.address) {
      
      const stakingAddress =  await validatorSet.methods.stakingByMiningAddress(s.address).call();
      const encodedABI = validatorSet.methods.validatorAvailableSince(stakingAddress).encodeABI();
      // console.log(`call Encoded for ${s.address}:`, encodedABI);
      const callResult = await validatorSet.methods.validatorAvailableSince(stakingAddress).call();
      console.log(`${s.address} available since: `, callResult);
      //s.address
    }
  
  })

}