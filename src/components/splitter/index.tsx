/*
 * Copyright (c) 2022, Ben Jilks <benjyjilks@gmail.com>
 *
 * SPDX-License-Identifier: BSD-2-Clause
 */

import styles from './index.module.css'

type Props = {
    children: JSX.Element[],
}

export default function Splitter({ children }: Props) {
    return (
        <div className={ styles.splitter }>
            { children }
        </div>
    )
}

