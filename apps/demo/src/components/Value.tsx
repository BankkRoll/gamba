import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.span<{$flash?: boolean}>`
  background: transparent;
  transition: background .5s;
  border-radius: 5px;
  ${({ $flash }) => $flash && `
    background: currentColor;
    transition: none;
  `}
`

export function Value({ children }: React.PropsWithChildren) {
  const [flash, set] = React.useState(false)

  React.useEffect(() => {
    set(true)
    setTimeout(() => {
      set(false)
    }, 250)
  }, [children])

  return (
    <Wrapper $flash={flash}>
      {children}
    </Wrapper>
  )
}