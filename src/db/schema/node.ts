/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: +6HnBaMo245r7KYkRyz0ZbB7Imq/zgkTRyvFWh7ScezwEoraP/WWj2UgW7AYfFsLMqXPo9mtIQASU0Js3r43Lg==
 */

/* eslint-disable */
// tslint:disable

import Headers from './headers'

interface Node {
  added_block: (Headers['block_number']) | null
  diamond_name: (string) | null
  ens_name: (string) | null
  mining_address: Buffer
  mining_public_key: Buffer
  pool_address: Buffer & {readonly __brand?: 'node_pool_address'}
}
export default Node;

interface Node_InsertParameters {
  added_block?: (Headers['block_number']) | null
  diamond_name?: (string) | null
  ens_name?: (string) | null
  mining_address: Buffer
  mining_public_key: Buffer
  pool_address: Buffer & {readonly __brand?: 'node_pool_address'}
}
export type {Node_InsertParameters}
