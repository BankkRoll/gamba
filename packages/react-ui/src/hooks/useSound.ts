import { signal } from '@preact/signals-react'
import React from 'react'
import { Gain, Player, getContext, start } from 'tone'

const masterGain = signal(0.5)

interface PlaySoundParams {
  playbackRate?: number
  gain?: number
}

export interface GambaAudioStore {
  masterGain: number
  set: (gain: number) => void
}

export const useGambaAudioStore = () => ({
  masterGain: masterGain.value,
  set: (gain: number) => (masterGain.value = gain),
})

class GambaSound {
  player?: Player
  gain?: Gain
  ready = false
  private url: string

  constructor(url: string) {
    this.url = url
    this.initSound()
  }

  async initSound(autoPlay = false) {
    await start()
    this.player = new Player(this.url).toDestination()
    this.gain = new Gain().toDestination()
    try {
      await this.player.load(this.url)
      this.ready = true
      if (this.player && this.gain) {
        this.player.connect(this.gain)
        if (autoPlay) {
          this.player.loop = true
          this.player.start()
        }
      }
    } catch (err) {
      console.error('Failed to load audio', err)
    }
  }

  play({ playbackRate = 1, gain = 0.1 }: PlaySoundParams = {}) {
    if (this.ready && this.player && this.gain) {
      this.player.playbackRate = playbackRate
      this.gain.gain.value = gain
      this.player.start()
    } else {
      console.warn('Sound not ready or AudioContext not resumed yet')
    }
  }
}

export function useSound<T extends { [s: string]: string }>(definition: T) {
  const [isContextReady, setContextReady] = React.useState(false)

  React.useEffect(() => {
    const resumeContext = async () => {
      await getContext().resume()
      setContextReady(true)
    }
    resumeContext()
  }, [])

  const sounds = React.useMemo(
    () =>
      Object.entries(definition)
        .map(([id, url]) => ({ id, sound: new GambaSound(url) }))
        .reduce(
          (prev, { id, sound }) => ({ ...prev, [id]: sound }),
          {} as Record<keyof T, GambaSound>,
        ),
    [definition, isContextReady],
  )

  const play = React.useCallback(
    (s: keyof typeof sounds, params?: PlaySoundParams) => {
      if (isContextReady && sounds[s]) {
        sounds[s].play(params)
      } else {
        console.warn('AudioContext is not ready. User interaction needed to resume.')
      }
    },
    [sounds, isContextReady],
  )

  return { play, sounds }
}
