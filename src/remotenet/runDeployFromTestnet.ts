

import * as child from 'child_process';
import { cmdR } from '../remoteCommand';
import { NodeManager } from "../regression/nodeManager";


function cmd(command: string) : string {
  console.log(command);
  const result = child.execSync(command);
  const txt = result.toString();
  console.log(txt);
  return txt;
}

async function run() {


  const pwdResult = child.execSync("pwd");

  console.log('operating in: ' + pwdResult.toString());

  const nodeManager = NodeManager.get();

  let deleteExistingServers 
    : boolean | undefined = undefined;

  const passedArgument = process.argv[2];
  let numberOfNodes = Number(passedArgument);

  if (isNaN(numberOfNodes)) {
    numberOfNodes = nodeManager.nodeStates.length;
  }

  // todo: option for "failsafe script".
  const startCommand = './openethereum -c node.toml';

  const nodesSubdir = 'testnet/nodes';
  const nodesDirAbsolute = process.cwd() + '/' + nodesSubdir;

  console.log('Looking up local nodes directory:', nodesDirAbsolute);

  for(let i = 1; i <= numberOfNodes; i++) {
    console.log(`=== Node ${i} ===`);

    const nodeName = `hbbft${i}`;
    const remoteMainDir = '~/hbbft_testnet';

    console.log(`ensure main directory: ${remoteMainDir} on ${nodeName}`);
    cmdR(nodeName, `mkdir -p ${remoteMainDir}`);

    const scpCommand = `scp -pr ${nodesDirAbsolute}/node${i}/* ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpCommand);

    const scpTemplateCommand = `scp -pr ${process.cwd()}/templates/* ${nodeName}:~/hbbft_testnet/node`;
    cmd(scpTemplateCommand);

  }

}


run();