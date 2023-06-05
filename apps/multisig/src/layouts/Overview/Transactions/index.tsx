import { css } from '@emotion/css'
import { FullScreenDialog } from '@talismn/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'

import { Token } from '../../../domain/chains'
import { FullScreenDialogContents, FullScreenDialogTitle } from './FullScreenSummary'
import TransactionSummaryRow from './TransactionSummaryRow'
import { groupTransactionsByDay } from './utils'

enum Mode {
  Pending,
  History,
}

export enum TransactionType {
  MultiSend,
  Transfer,
  Advanced,
}

export interface Transaction {
  createdTimestamp: Date
  executedTimestamp?: Date
  description: string
  hash: string
  chainId: number
  approvals: {
    [key: string]: string | undefined
  }
  decoded: {
    type: TransactionType
    outgoingToken?: {
      token: Token
      amount: number
      price: number
    }
    recipients: [string, number][]
    yaml: string
  }
  raw: string
}

function extractHash(url: string) {
  const parts = url.split('/')
  const txIndex = parts.indexOf('tx')
  if (txIndex === -1 || txIndex + 1 >= parts.length) {
    return null
  }
  return parts[txIndex + 1]
}

const TransactionsList = ({ transactions }: { transactions: Transaction[] }) => {
  let location = useLocation().pathname
  const navigate = useNavigate()
  const groupedTransactions = useMemo(() => {
    return groupTransactionsByDay(transactions)
  }, [transactions])

  const openTransaction = transactions.find(t => t.hash === extractHash(location))

  // Handle if user clicks a link to a tx that doesn't exist for them
  useEffect(() => {
    if (!openTransaction && location.includes('tx')) {
      navigate('/overview')
    }
  }, [location, openTransaction, navigate])

  return (
    <div
      className={css`
        display: grid;
        gap: 16px;
      `}
    >
      {groupedTransactions.map(([day, transactions]) => (
        <div key={day}>
          <p>{day}</p>
          {transactions.map(t => {
            return (
              <motion.div key={t.hash} whileHover={{ scale: 1.015 }} css={{ padding: '12px 16px', cursor: 'pointer' }}>
                <TransactionSummaryRow onClick={() => navigate(`/overview/tx/${t.hash}`)} t={t} />
              </motion.div>
            )
          })}
        </div>
      ))}
      <Routes>
        <Route
          path="/tx/:hash"
          element={
            <FullScreenDialog
              onRequestDismiss={() => {
                navigate('/overview')
              }}
              onClose={() => {
                navigate('/overview')
              }}
              title={<FullScreenDialogTitle t={openTransaction} />}
              css={{
                header: {
                  margin: '32px 48px',
                },
                height: '100vh',
                background: 'var(--color-grey800)',
                maxWidth: '781px',
                minWidth: '700px',
                width: '100%',
                padding: '0 !important',
              }}
              open={!!openTransaction}
            >
              <FullScreenDialogContents
                t={openTransaction}
                onApprove={() => navigate('/overview')}
                onReject={() => navigate('/overview')}
              />
            </FullScreenDialog>
          }
        />
      </Routes>
    </div>
  )
}

const Transactions = ({ transactions }: { transactions: Transaction[] }) => {
  const pendingTransactions = useMemo(() => {
    return transactions.filter(t => Object.values(t.approvals).some(a => !a))
  }, [transactions])
  const completedTransactions = useMemo(() => {
    return transactions.filter(t => Object.values(t.approvals).every(a => a))
  }, [transactions])

  const [mode, setMode] = useState(Mode.Pending)
  return (
    <section
      className={css`
        grid-area: transactions;
        background-color: var(--color-grey800);
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 24px;
      `}
    >
      <div
        className={css`
          display: flex;
          gap: 12px;
          font-weight: bold !important;
          > h2 {
            cursor: pointer;
          }
        `}
      >
        <h2
          onClick={() => setMode(Mode.Pending)}
          css={{ fontWeight: 'bold', color: mode === Mode.Pending ? 'var(--color-offWhite)' : '' }}
        >
          Pending
        </h2>
        <h2
          onClick={() => setMode(Mode.History)}
          css={{ fontWeight: 'bold', color: mode === Mode.History ? 'var(--color-offWhite)' : '' }}
        >
          History
        </h2>
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <TransactionsList transactions={mode === Mode.Pending ? pendingTransactions : completedTransactions} />
        </motion.div>
      </AnimatePresence>
    </section>
  )
}

export default Transactions