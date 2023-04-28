import { IdlAccounts, IdlEvents } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { GambaIdl } from './constants'

export type HouseState = IdlAccounts<GambaIdl>['house']
export type UserState = IdlAccounts<GambaIdl>['user']
export type BetSettledEvent = IdlEvents<GambaIdl>['BetSettledEvent']

export interface GameResult {
  /**
   * The player who made the bet
   */
  player: PublicKey
  /**
   * Amount of lamports the player bet
   */
  wager: number
  /**
   * Amount of lamports the player received
   */
  payout: number
  /**
   * The hashed RNG seed. Should be equal to sha256(result.rngSeed)
   */
  rngSeedHashed: string
  /**
   * The RNG seed
   */
  rngSeed: string
  /**
   * The seed that the was generated by the player
   */
  clientSeed: string
  /**
   *
   */
  nonce: number
  /**
   * The game configuration array
   */
  options: number[]
  /**
   * The index that the bet landed on
   */
  resultIndex: number
}

export interface RecentPlayEvent {
  signature: string
  estimatedTime: number
  creator: PublicKey
  player: PublicKey
  wager: number
  nonce: number
  rngSeed: string
  clientSeed: string
  resultMultiplier: number
  resultIndex: number
}
