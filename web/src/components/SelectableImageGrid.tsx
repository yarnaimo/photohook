/** @jsx jsx */
import { jsx } from '@emotion/core'
import React from 'react'
import { RoundedCheckbox } from './RoundedCheckbox'

interface Props {
    urls: string[]
    selection: boolean[]
    onChange: (newSelection: boolean[]) => void
}

export const SelectableImageGrid: React.FC<Props> = ({ urls, selection, onChange }) => {
    return (
        <ul
            css={{
                border: 'none',
                margin: '0 -8px',
                display: 'grid',
                padding: 0,
                gridTemplateColumns: 'repeat(4, 1fr)',
                gridGap: 4,
            }}
        >
            {[...urls].map((url, i) => {
                const isChecked = selection[i]

                return (
                    <li
                        key={i}
                        css={{
                            margin: 0,
                            position: 'relative',
                            display: 'block',
                            cursor: 'pointer',

                            ':before': {
                                content: '""',
                                display: 'block',
                                paddingTop: '100%',
                            },
                        }}
                        onClick={() =>
                            onChange(
                                selection.map((value, sIndex) => (sIndex === i ? !value : value))
                            )
                        }
                    >
                        <div css={{ position: 'absolute', zIndex: 1, top: 8, left: 8 }}>
                            <RoundedCheckbox checked={isChecked} />
                        </div>
                        <img
                            src={url}
                            alt="Image"
                            css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                            }}
                        />
                        <div
                            css={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                opacity: isChecked ? 0.3 : 0,
                                background: 'var(--mdc-theme-primary)',
                                willChange: 'opacity',
                                transition: 'opacity ease 0.2s',
                            }}
                        />
                    </li>
                )
            })}
        </ul>
    )
}
