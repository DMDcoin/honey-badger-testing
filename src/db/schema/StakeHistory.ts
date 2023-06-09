/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: URINP0aZjEuayNludgOJmH4t38T69HsV1murpF1lLDhGZySEiio/vBiuDdKo9QTLcYWpG0hbLqdAIWjzoAXrtw==
 */

/* eslint-disable */
// tslint:disable

import Headers from './headers'
import Node from './node'

interface StakeHistory {
  from_block: (Headers['block_number']) | null
  node: (Node['pool_address']) | null
  stake_amount: string
  to_block: (Headers['block_number']) | null
}
export default StakeHistory;

interface StakeHistory_InsertParameters {
  from_block?: (Headers['block_number']) | null
  node?: (Node['pool_address']) | null
  stake_amount: string
  to_block?: (Headers['block_number']) | null
}
export type {StakeHistory_InsertParameters}