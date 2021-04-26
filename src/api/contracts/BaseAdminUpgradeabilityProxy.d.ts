/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import BN from "bn.js";
import { ContractOptions } from "web3-eth-contract";
import { EventLog } from "web3-core";
import { EventEmitter } from "events";
import {
  Callback,
  PayableTransactionObject,
  NonPayableTransactionObject,
  BlockType,
  ContractEventLog,
  BaseContract,
} from "./types";

interface EventOptions {
  filter?: object;
  fromBlock?: BlockType;
  topics?: string[];
}

export type AdminChanged = ContractEventLog<{
  previousAdmin: string;
  newAdmin: string;
  0: string;
  1: string;
}>;
export type Upgraded = ContractEventLog<{
  implementation: string;
  0: string;
}>;

export interface BaseAdminUpgradeabilityProxy extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): BaseAdminUpgradeabilityProxy;
  clone(): BaseAdminUpgradeabilityProxy;
  methods: {
    /**
     * @returns The address of the proxy admin.
     */
    admin(): NonPayableTransactionObject<string>;

    /**
     * @returns The address of the implementation.
     */
    implementation(): NonPayableTransactionObject<string>;

    /**
     * Changes the admin of the proxy. Only the current admin can call this function.
     * @param newAdmin Address to transfer proxy administration to.
     */
    changeAdmin(newAdmin: string): NonPayableTransactionObject<void>;

    /**
     * Upgrade the backing implementation of the proxy. Only the admin can call this function.
     * @param newImplementation Address of the new implementation.
     */
    upgradeTo(newImplementation: string): NonPayableTransactionObject<void>;

    /**
     * Upgrade the backing implementation of the proxy and call a function on the new implementation. This is useful to initialize the proxied contract.
     * @param data Data to send as msg.data in the low level call. It should include the signature and the parameters of the function to be called, as described in https://solidity.readthedocs.io/en/v0.4.24/abi-spec.html#function-selector-and-argument-encoding.
     * @param newImplementation Address of the new implementation.
     */
    upgradeToAndCall(
      newImplementation: string,
      data: string | number[]
    ): PayableTransactionObject<void>;
  };
  events: {
    AdminChanged(cb?: Callback<AdminChanged>): EventEmitter;
    AdminChanged(
      options?: EventOptions,
      cb?: Callback<AdminChanged>
    ): EventEmitter;

    Upgraded(cb?: Callback<Upgraded>): EventEmitter;
    Upgraded(options?: EventOptions, cb?: Callback<Upgraded>): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "AdminChanged", cb: Callback<AdminChanged>): void;
  once(
    event: "AdminChanged",
    options: EventOptions,
    cb: Callback<AdminChanged>
  ): void;

  once(event: "Upgraded", cb: Callback<Upgraded>): void;
  once(event: "Upgraded", options: EventOptions, cb: Callback<Upgraded>): void;
}
