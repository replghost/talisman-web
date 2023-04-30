import { css } from '@emotion/css'
import { ArrowUp, Check, Share2 } from '@talismn/icons'
import { Tooltip } from '@talismn/ui'
import { formatUsd } from '@util/numbers'

import { formattedHhMm } from './utils'
import { Transaction, TransactionType } from '.'

const TransactionSummaryRow = ({ t, onClick }: { t: Transaction; onClick?: () => void }) => {
  const threshold = 2
  const signedCount = Object.values(t.approvals).filter(Boolean).length
  return (
    <div
      onClick={onClick}
      className={css`
        display: grid;
        align-items: center;
        grid-template-columns: 44px 1fr auto auto;
        grid-template-rows: 16px 16px;
        grid-template-areas:
          'icon description tokenAmount executedInfo'
          'icon time usdAmount executedInfo';
        p {
          margin-top: 4px;
        }
      `}
    >
      <div
        className={css`
          grid-area: icon;
          display: grid;
          align-items: center;
          justify-content: center;
          height: 32px;
          width: 32px;
          border-radius: 100px;
          background-color: var(--color-backgroundLighter);
          svg {
            height: 15px;
            width: 15px;
            color: var(--color-primary);
          }
        `}
      >
        {t.decoded.type === TransactionType.MultiSend ? <Share2 /> : <ArrowUp />}
      </div>
      <span
        css={{
          gridArea: 'description',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--color-offWhite)',
        }}
      >
        <p>{t.description}</p>
        {threshold !== signedCount && (
          <div
            className={css`
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 12px;
              background-color: var(--color-backgroundLighter);
              padding: 0 6px;
              font-size: 11px;
              color: var(--color-foreground);
              height: 16px;
              padding-top: 2px;
              cursor: inherit;
            `}
          >
            {signedCount}/{threshold}
          </div>
        )}
      </span>
      <p css={{ gridArea: 'time', fontSize: '14px', paddingTop: '4px' }}>{formattedHhMm(t.createdTimestamp)}</p>
      <p css={{ gridArea: 'tokenAmount', textAlign: 'right', color: 'var(--color-offWhite)' }}>
        {t.decoded.outgoingToken.amount} {t.decoded.outgoingToken.token.symbol}
      </p>
      <p css={{ gridArea: 'usdAmount', textAlign: 'right', fontSize: '14px', paddingTop: '4px' }}>
        {formatUsd(t.decoded.outgoingToken.amount * t.decoded.outgoingToken.price)}
      </p>
      {t.executedTimestamp && (
        <Tooltip content={`Executed: ${t.executedTimestamp}`}>
          {tooltipProps => (
            <a
              {...tooltipProps}
              href="https://subscan.com/tx123"
              target="_blank"
              rel="noreferrer"
              className={css`
                height: 100%;
                grid-area: executedInfo;
                color: #38d448;
                background: #345132;
                margin-left: 24px;
                display: grid;
                align-items: center;
                justify-content: center;
                height: 24px;
                width: 24px;
                border-radius: 100px;
                svg {
                  width: 11px;
                  height: auto;
                  color: var(--color-primary);
                }
              `}
            >
              <Check />
            </a>
          )}
        </Tooltip>
      )}
    </div>
  )
}

export default TransactionSummaryRow
