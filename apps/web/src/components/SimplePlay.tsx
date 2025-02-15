import styled from '@emotion/styled'
import { ReactComponent as PauseCircle } from '@icons/pause-circle.svg'
import { ReactComponent as PlayCircle } from '@icons/play-circle.svg'
import { useAudio } from '@util/useAudio'

export const SimplePlay = styled(({ className, src }: { className?: string; src: string }) => {
  const { isPlaying, togglePlay } = useAudio(src)
  return (
    <button className={className} onClick={togglePlay}>
      {isPlaying ? <PauseCircle /> : <PlayCircle />}
    </button>
  )
})`
  padding: 0;
  border: 0;
  background: inherit;
  cursor: pointer;
  display: flex;

  svg {
    width: 3rem;
    height: auto;
  }
`
