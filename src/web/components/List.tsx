/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'

interface Props {}

const margin = {
    margin: '0.4375em 0',
}

const withLine = {
    marginLeft: 1,
    borderLeft: 'var(--md-grey-100) 2px solid',

    '@media (max-width: 599px)': {
        paddingLeft: 32,
    },
}

export const UL: React.FC<Props> = props => {
    return <ul css={[margin, withLine]}>{props.children}</ul>
}

export const OL: React.FC<Props> = props => {
    return <ol css={[margin, withLine]}>{props.children}</ol>
}

export const LI: React.FC<Props> = props => {
    return <li css={margin}>{props.children}</li>
}
