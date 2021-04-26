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

export type NewValidatorsSet = ContractEventLog<{
  newValidatorSet: string[];
  0: string[];
}>;

export interface KeyGenHistory extends BaseContract {
  constructor(
    jsonInterface: any[],
    address?: string,
    options?: ContractOptions
  ): KeyGenHistory;
  clone(): KeyGenHistory;
  methods: {
    acks(
      arg0: string,
      arg1: number | string | BN
    ): NonPayableTransactionObject<string>;

    numberOfAcksWritten(): NonPayableTransactionObject<string>;

    numberOfPartsWritten(): NonPayableTransactionObject<string>;

    parts(arg0: string): NonPayableTransactionObject<string>;

    validatorSet(
      arg0: number | string | BN
    ): NonPayableTransactionObject<string>;

    validatorSetContract(): NonPayableTransactionObject<string>;

    /**
     * Clears the state (acks and parts of previous validators.
     * @param _prevValidators The list of previous validators.
     */
    clearPrevKeyGenState(
      _prevValidators: string[]
    ): NonPayableTransactionObject<void>;

    initialize(
      _validatorSetContract: string,
      _validators: string[],
      _parts: (string | number[])[],
      _acks: (string | number[])[][]
    ): NonPayableTransactionObject<void>;

    writePart(
      _upcommingEpoch: number | string | BN,
      _part: string | number[]
    ): NonPayableTransactionObject<void>;

    writeAcks(
      _upcommingEpoch: number | string | BN,
      _acks: (string | number[])[]
    ): NonPayableTransactionObject<void>;

    getPart(_val: string): NonPayableTransactionObject<string>;

    getAcksLength(val: string): NonPayableTransactionObject<string>;

    getNumberOfKeyFragmentsWritten(): NonPayableTransactionObject<{
      0: string;
      1: string;
    }>;

    /**
     * Returns a boolean flag indicating if the `initialize` function has been called.
     */
    isInitialized(): NonPayableTransactionObject<boolean>;
  };
  events: {
    NewValidatorsSet(cb?: Callback<NewValidatorsSet>): EventEmitter;
    NewValidatorsSet(
      options?: EventOptions,
      cb?: Callback<NewValidatorsSet>
    ): EventEmitter;

    allEvents(options?: EventOptions, cb?: Callback<EventLog>): EventEmitter;
  };

  once(event: "NewValidatorsSet", cb: Callback<NewValidatorsSet>): void;
  once(
    event: "NewValidatorsSet",
    options: EventOptions,
    cb: Callback<NewValidatorsSet>
  ): void;
}
