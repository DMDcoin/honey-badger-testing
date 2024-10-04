import { ConfigManager } from '../configManager';
import { NodeState } from '../net/nodeManager';
import { cmdR, cmdRemoteAsync } from '../remoteCommand';
import { getBuildFromSourceCmd } from './buildFromSource';
import { getNodesFromCliArgs } from './remotenetArgs';

async function doRunBuildFromSource(n: NodeState): Promise<string> {

    const nodeName = `hbbft${n.nodeID}`;
    console.log(`=== ${nodeName} ===`);

    let installDir = ConfigManager.getRemoteInstallDir()
    return cmdRemoteAsync(n.sshNodeName(), `cd ${installDir} && ./build-from-source-fast.sh`);

}

async function runAllNodes() {



    let nodes = await getNodesFromCliArgs();
    let finished = 0;
    let error = 0;
    let results = nodes.map( (n) => {
         let result = doRunBuildFromSource(n);
         result.then(
            (result) => {
                finished++;
                console.log("finished: ", n.sshNodeName());
                console.log(result);
                console.log(" === end: ", n.sshNodeName(), " === ");
                console.log("finished: ", finished);
                console.log("error: ", error);
                console.log("finalized: ", finished + error);
                console.log("progress: ", (finished + error / nodes.length) * 100);
            }, (error) => {
                error++;
                console.log("Error: ", n.sshNodeName());
                console.log(error);
                console.log(" === end: ", n.sshNodeName(), " === ");
                console.log("finished: ", finished);
                console.log("error: ", error);
                console.log("finalized: ", finished + error);
                console.log("progress: ", (finished + error / nodes.length) * 100);
            });
         return result; 
    } );

    console.log("did start all build from source processes");
    console.log("awaiting results...");

    
    for (const n of results) {
        await n;    
    }

    console.log("all jobs done...");
}


runAllNodes();