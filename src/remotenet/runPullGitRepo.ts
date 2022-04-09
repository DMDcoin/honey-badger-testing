import { cmdR } from "../remoteCommand";
import { getNodesFromCliArgs } from "./remotenetArgs";

async function run() {
  const nodes = await getNodesFromCliArgs();
  nodes.forEach(n=> {
    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);
    cmdR(nodeName, `cd ~/dmdv4-testnet && git pull`);
  });
}


//todo find better command, this kind of hard kills it.
run();