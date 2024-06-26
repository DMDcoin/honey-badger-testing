
import fs from "fs";
import * as path from 'path';
import { LocalnetBuilder } from "../localnet/localnet-builder";
import Web3 from "web3";
import { copyFolderRecursiveSync } from "../utils/fs";
import { ConfigManager } from "../configManager";
import { getHttpsString } from "../utils/web";
/// https://github.com/DMDcoin/honey-badger-testing/issues/94



export class ForkedNetworkBuilder {

    public portsBase = 30300;
    public portsBaseRPC = 8540;
    public portsBaseWS = 9540;

    constructor(public workingDirectory: string) {
        
    }

    /// creates a forked network builder
    /// with in a new empty temp directory
    public static async new() : Promise<ForkedNetworkBuilder> {

        let tmp = path.join("/tmp", await fs.promises.mkdtemp('hbbft_network_fork'));
        return new ForkedNetworkBuilder(tmp);
    }

    /// creates a fresh network and a fork network that will fork from this fresh network.
    public async createFreshNetworkWithFork(baseNetNumOfNodes: number, forkNumOfNodes: number, forkBlockStart: number, deleteExisting: boolean = false)  {
         //buildNodeFiles()
         

        if (fs.existsSync(this.workingDirectory)) {
            if (deleteExisting) {
                fs.rmdirSync(this.workingDirectory, {recursive: true});
            } else {
                let existingFiles = fs.readdirSync(this.workingDirectory);
                if (existingFiles.length > 0) {
                    console.log("a network already exists in working directory:", this.workingDirectory);
                    console.log("aborting.");
                    return;
                };
            }
        }
        
        let bootNetBuilder = new LocalnetBuilder(baseNetNumOfNodes, baseNetNumOfNodes);

        await bootNetBuilder.build(path.join(this.workingDirectory, "nodeFilesBoot"))
        //bootNetBuilder.buildNodeFiles();
        //bootNetBuilder.copyNodeFilesToTargetDirectory(path.join(this.workingDirectory, "nodeFilesBoot"));
        console.log("node files created in tmp directory: ", this.workingDirectory);

        let forkNetBuilder = new LocalnetBuilder(forkNumOfNodes, forkNumOfNodes);
        // we use different ports for the foked network,
        // that makes merging the reserved peers files easier.

        forkNetBuilder.portBase = 40300;
        forkNetBuilder.portBaseRPC = 18540;
        forkNetBuilder.portBaseWS = 19540;
        forkNetBuilder.metricsPortBase = 48705;

        //forkNetBuilder.buildNodeFiles();
        await forkNetBuilder.build(path.join(this.workingDirectory, "nodeFilesFork"));
        console.log("node files created in tmp directory: ", this.workingDirectory);

        // create a merged reserved peers files.

        let bootReservedPeersFile = fs.readFileSync(path.join(this.workingDirectory, "nodeFilesBoot", "node1", "reserved-peers"), {encoding: 'utf-8'});
        let forkReservedPeersFile = fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "node1", "reserved-peers"), {encoding: 'utf-8'});


        let mergedReservedPeersFile = bootReservedPeersFile + "\n" + forkReservedPeersFile;
        let reservedPeersOutputFile = path.join(this.workingDirectory, "reserved-peers");
        fs.writeFileSync(reservedPeersOutputFile, mergedReservedPeersFile, {encoding: 'utf-8'});

        console.log("reserved peers file created: ", reservedPeersOutputFile);

        // create an adapted spec with a fork specification for the fork network.

        let originalSpec = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesBoot", "node1", "spec.json"), {encoding: 'utf-8'}));
        let forkFiles = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "nodes_info.json"), {encoding: 'utf-8'}));

        let adaptedSpec = this.createForkAdaptedSpec(originalSpec, forkFiles,  forkBlockStart);

        
        // replace the exiting spec with tha adapted spec for every node in the forked network.
        for (let i = 1; i <= forkNumOfNodes; i++) {
            let nodeSpecFile = path.join(this.workingDirectory, "nodeFilesFork", "node" + i, "spec.json");
            fs.writeFileSync(nodeSpecFile, JSON.stringify(adaptedSpec), {encoding: 'utf-8'});
        }

        
        // create the final network directory
        //fs.mkdirSync(path.join(this.workingDirectory, "final"), {recursive: true});

        console.log("copy the original nodes from the boot network as it is.");
        // nodeFilesBoot is a directory, fs.rmdir(
        // we need to copy the files from the directory to the final directory.
        
        copyFolderRecursiveSync(path.join(this.workingDirectory, "nodeFilesBoot"), this.workingDirectory);
       
    
        console.log("create the forked nodes.");
        // copy the nodes from the fork network, but with new node Ids.
        for (let i = 1; i <= forkNumOfNodes; i++) {
            let targetId = baseNetNumOfNodes + i;
            let nodeDir = path.join(this.workingDirectory, "nodeFilesFork", "node" + i);
            let targetNodeDir = path.join(this.workingDirectory, "node" + (targetId));
            fs.mkdirSync(targetNodeDir);
            copyFolderRecursiveSync(nodeDir, targetNodeDir);
            fs.copyFileSync(reservedPeersOutputFile, path.join(targetNodeDir, "reserved-peers"));
        }

        let bootNodesFile = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesBoot", "nodes_info.json"), {encoding: 'utf-8'}));
        let forkNodesFile = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "nodes_info.json"), {encoding: 'utf-8'}));
        

        let forkedNodeInfo = this.createForkedNodeInfos(bootNodesFile, forkNodesFile);
        fs.writeFileSync(path.join(this.workingDirectory, "nodes_info.json"), JSON.stringify(forkedNodeInfo), {encoding: 'utf-8'});

        // let forkFiles = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodeFilesFork", "nodes_info.json"), {encoding: 'utf-8'}));

    }

    

    public async createForkedNodesFromMainnet(forkNumOfNodes: number, forkBlockDelay: number) {

        // let web3 = ConfigManager.getWeb3();
        // let blockNumber = await web3.eth.getBlockNumber();
        // let targetBlock = blockNumber + forkBlockDelay;

        // we need to download the current chainspec from  the mainnet.

        let repo = ConfigManager.getNetworkRepo();
        let branch = ConfigManager.getNetworkBranch();

        // let specUri = `${repo}/blob/${branch}/spec.json`;

        let specUri = "https://raw.githubusercontent.com/DMDcoin/dmdv4-testnet/main/spec.json";
        let specJson = await getHttpsString(specUri); 
    
        let ForkNetBuilder = new LocalnetBuilder(forkNumOfNodes,forkNumOfNodes);
        await ForkNetBuilder.build(path.join(this.workingDirectory));

        let nodeInfosObject = JSON.parse(fs.readFileSync(path.join(this.workingDirectory, "nodes_info.json"), {encoding: 'utf-8'}));

        let spec = JSON.parse(specJson);
        //let spec = JSON.parse(specJson);
        let adaptedSpec = this.createForkAdaptedSpec(spec, nodeInfosObject,  10000);
        
        let adaptedSpecJson = JSON.stringify(adaptedSpec);

        // replace the exiting spec with tha adapted spec for every node in the forked network.
        for (let i = 1; i <= forkNumOfNodes; i++) {
            let nodeSpecFile = path.join(this.workingDirectory, "node" + i, "spec.json");
            fs.writeFileSync(nodeSpecFile, adaptedSpecJson, {encoding: 'utf-8'});
        }

    }

    private createForkedNodeInfos(bootNodesFile: any, forkNodesFile: any) : any {
        
        let result = JSON.parse(JSON.stringify(bootNodesFile));

        result["validators"].push(...forkNodesFile["validators"]);
        result["public_keys"].push(...forkNodesFile["public_keys"]);
        result["ip_addresses"].push(...forkNodesFile["ip_addresses"]);
        
        return result;
    }

    private createForkAdaptedSpec(originalSpec: any, nodeInfoForForkRaw: any, forkBlockStart: number) : string {

        // make a copy of the original spec.
        let result = JSON.parse(JSON.stringify(originalSpec));
        let forks : any[] = [];
        let fork: any = {};

        fork["blockNumberStart"] = forkBlockStart;

        let validators: any[] = [];
        let parts: string[] = [];
        let acks: string[][] = [];


        for (let publicKey_ of nodeInfoForForkRaw["public_keys"]) {
            let publicKey : string = publicKey_;
            validators.push(publicKey.substring(2));
        }
        fork["validators"] = validators;


        for (let parts_ of nodeInfoForForkRaw["parts"]) {
            let partsFromInfo: [] = parts_;
            
            let partsAsHex = Web3.utils.bytesToHex(partsFromInfo);
            parts.push(partsAsHex.substring(2));
        }
        fork["parts"] = parts;

        for (let acksArray_ of nodeInfoForForkRaw["acks"]) {

            let thisAcks: string[] = [];
            for (let acksFromInfo_ of acksArray_) {
                let acksFromInfo : [] = acksFromInfo_;
                let acksAsHex = Web3.utils.bytesToHex(acksFromInfo);
                thisAcks.push(acksAsHex.substring(2));
            }

            acks.push(thisAcks);
        }

        fork["acks"] = acks;
        forks.push(fork);

        result.engine.hbbft.params["forks"] = forks;

        return result;
        // fork.
    }


    // private async generateLocalNetwork() {
    //     let localnetBuilder = new LocalnetBuilder("");
    // }

    // private async adaptNetwork() {
    // }

}



