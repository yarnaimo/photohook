/** @jsx jsx */
import { jsx } from '@emotion/core'
import MaterialIcon from '@material/react-material-icon'
import React from 'react'

interface Props {
    checked: boolean
    onClick?: () => void
}

export const RoundedCheckbox: React.FC<Props> = ({ checked, onClick }) => {
    return (
        <span
            // className="mdc-elevation--z1"
            onClick={onClick}
            css={[
                {
                    display: 'inline-flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 20,
                    height: 20,
                    marginRight: 16,
                    borderRadius: '50%',
                    border: 'solid 2px var(--md-grey-300)',
                    cursor: 'pointer',
                    background: 'white',
                    willChange: 'background, border-color',
                    transition: 'all .2s',
                },
                checked && {
                    background: 'var(--mdc-theme-primary)',
                    borderColor: 'transparent',
                },
            ]}
        >
            <MaterialIcon icon="check" css={[{ fontSize: 16, color: 'white' }]} />
        </span>
    )
}
