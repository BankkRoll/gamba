import { GambaUi, TokenValue, useSound } from 'gamba-react-ui-v2'
import { useGamba } from 'gamba-react-v2'
import React from 'react'
import styled from 'styled-components'
import { Chip } from './Chip'
import { Results } from './Results'
import { Table } from './Table'
import { CHIPS, SOUND_LOSE, SOUND_PLAY, SOUND_WIN } from './constants'
import { bet, clearChips, selectedChip, totalChipValue, addResult } from './signals'

const Wrapper = styled.div`
  display: grid;
  gap: 20px;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
  color: white;
`

export default function Roulette() {
  const game = GambaUi.useGame()
  const token = GambaUi.useCurrentToken()
  const pool = GambaUi.useCurrentPool()
  const balance = GambaUi.useUserBalance()
  const gamba = useGamba()

  const sounds = useSound({
    win: SOUND_WIN,
    lose: SOUND_LOSE,
    play: SOUND_PLAY,
  })

  const wager = totalChipValue.value * token.baseWager / 10_000

  const multiplier = Math.max(...bet.value)
  const maxPayout = multiplier * wager
  const maxPayoutExceeded = maxPayout > pool.maxPayout
  const balanceExceeded = wager > (balance.balance + balance.bonusBalance)

  const play = async () => {
    await game.play({
      bet: bet.value,
      wager,
    })
    sounds.play('play')
    const result = await gamba.result()
    addResult(result.resultIndex)
    if (result.payout > 0) {
      sounds.play('win')
    } else {
      sounds.play('lose')
    }
  }

  return (
    <>
      <GambaUi.Portal target="screen">
        <GambaUi.Responsive>
          <Wrapper onContextMenu={(e) => e.preventDefault()}>
            <div style={{ textAlign: 'center', display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                {balanceExceeded ? (
                  <span style={{ color: '#ff0066' }}>
                    TOO HIGH
                  </span>
                ) : (
                  <>
                    <TokenValue amount={wager} />
                  </>
                )}
                <div>Wager</div>
              </div>
              <div>
                <div>
                  {maxPayoutExceeded ? (
                    <span style={{ color: '#ff0066' }}>
                      TOO HIGH
                    </span>
                  ) : (
                    <>
                      <TokenValue amount={maxPayout} />
                      ({multiplier.toFixed(2)}x)
                    </>
                  )}
                </div>
                <div>Potential win</div>
              </div>
            </div>
            <Results />
            <Table />
          </Wrapper>
        </GambaUi.Responsive>
      </GambaUi.Portal>
      <GambaUi.Portal target="controls">
        <GambaUi.Select
          options={CHIPS}
          value={selectedChip.value}
          onChange={(value) => selectedChip.value = value}
          label={(value) => (
            <>
              <Chip value={value} /> = <TokenValue amount={token.baseWager * value} />
            </>
          )}
        />
        <GambaUi.Button
          disabled={!wager}
          onClick={clearChips}
        >
          Clear
        </GambaUi.Button>
        <GambaUi.PlayButton disabled={!wager || balanceExceeded || maxPayoutExceeded} onClick={play}>
          Spin
        </GambaUi.PlayButton>
      </GambaUi.Portal>
    </>
  )
}