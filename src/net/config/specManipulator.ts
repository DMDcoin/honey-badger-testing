import { ConfigManager } from "../../configManager";


export class SpecManipulator {

    public constructor(public spec: any) {

    }

    public addOwnInitialAccountFunds(amount: string) : SpecManipulator{

        let web3 = ConfigManager.getWeb3();
        let defaultAccount = web3.eth.defaultAccount!;
        
        this.addInitialAccountFunds(amount, defaultAccount);

        return this;
    }

    public addInitialAccountFunds(amount: string, account: string) : SpecManipulator {

        this.spec.accounts[account] = amount;
        return this;
    }

    public setNetworkID(networkID: number) : SpecManipulator {
        this.spec.params.networkID = networkID;
        return this;
    }

    //public addFork

    // todo: Move logic for creating forks here.

}