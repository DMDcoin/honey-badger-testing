/**
 * !!! This file is autogenerated do not edit by hand !!!
 *
 * Generated by: @databases/pg-schema-print-types
 * Checksum: BoJuRVJ92+zJn5d/0vZ9aht8tMuho5pB2p8QVJfyM+gWRBGtFD7YTbz90iKtWTzK+ztqouAUQiA78lOPseoSog==
 */

/* eslint-disable */
// tslint:disable

interface PendingValidatorStateEvent {
  on_enter_block_number: (number) | null
  on_exit_block_number: (number) | null
  state: (number) | null
}
export default PendingValidatorStateEvent;

interface PendingValidatorStateEvent_InsertParameters {
  on_enter_block_number?: (number) | null
  on_exit_block_number?: (number) | null
  state?: (number) | null
}
export type {PendingValidatorStateEvent_InsertParameters}