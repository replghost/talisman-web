import { css } from '@emotion/css'
import { useTheme } from '@emotion/react'
import { ExternalLink, Trash } from '@talismn/icons'
import { IconButton, Identicon } from '@talismn/ui'
import { AugmentedAccount } from 'layouts/CreateMultisig'
import truncateMiddle from 'truncate-middle'

const MemberRow = (props: { member: AugmentedAccount; onDelete?: () => void; truncate?: boolean }) => {
  const theme = useTheme()
  return (
    <div
      className={css`
        display: grid;
        grid-template-columns: 24px 1fr 16px 16px;
        gap: 8px;
        justify-items: flex-start;
        align-items: center;
        > p {
          font-size: 16px !important;
          color: var(--color-offWhite) !important;
        }
      `}
    >
      <Identicon
        className={css`
          width: 24px;
          height: auto;
        `}
        value={props.member.address}
      />
      {props.member.you ? (
        <>
          <div
            className={css`
              display: flex;
            `}
          >
            <p>{props.member.nickname}</p>
            &nbsp;
            <p
              className={css`
                color: var(--color-offWhite);
              `}
            >
              (You)
            </p>
          </div>
          <div></div>
        </>
      ) : (
        <>
          <p>{props.truncate ? truncateMiddle(props.member.address, 22, 22, '...') : props.member.address}</p>
          {props.onDelete ? (
            <IconButton
              onClick={props.onDelete}
              className={css`
                cursor: pointer;
              `}
              as="button"
              size="16px"
              contentColor={`rgb(${theme.foreground})`}
            >
              <Trash />
            </IconButton>
          ) : (
            <div></div>
          )}
        </>
      )}
      <a href={`https://subscan.io/account/${props.member.address}`} target="_blank" rel="noreferrer">
        <IconButton
          className={css`
            cursor: pointer;
          `}
          as="button"
          size="16px"
          contentColor={`rgb(${theme.foreground})`}
        >
          <ExternalLink />
        </IconButton>
      </a>
    </div>
  )
}

export default MemberRow