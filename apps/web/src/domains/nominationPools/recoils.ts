import { substrateAccountsState } from '@domains/accounts/recoils'
import { chainsState } from '@domains/chains'
import { useSubstrateApiEndpoint } from '@domains/common'
import { chainReadIdState, substrateApiState } from '@domains/common/recoils'
import type { AnyNumber } from '@polkadot/types-codec/types'
import DotPoolSelector, { ValidatorSelector, defaultOptions } from '@talismn/dot-pool-selector'
import { selectorFamily, type SerializableParam } from 'recoil'

export const allPendingPoolRewardsState = selectorFamily({
  key: 'AllPendingRewards',
  get:
    (endpoint: string) =>
    async ({ get }) => {
      get(chainReadIdState)

      const api = get(substrateApiState(endpoint))
      const accounts = get(substrateAccountsState)

      return await Promise.all(
        accounts.map(
          async ({ address }) =>
            await api.call.nominationPoolsApi.pendingRewards(address).then(result => [address, result] as const)
        )
      )
    },
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
  // NOTE: polkadot.js returned codec object includes reference to the registry
  // which shouldn't be freezed
  dangerouslyAllowMutability: true,
})

export const useAllPendingRewardsState = () => allPendingPoolRewardsState(useSubstrateApiEndpoint())

// TODO: refactor to selector that can read all storage entries
export const eraStakersState = selectorFamily({
  key: 'EraStakers',
  get:
    ({ endpoint, era }: { endpoint: string; era: Extract<AnyNumber, SerializableParam> }) =>
    async ({ get }) => {
      const api = get(substrateApiState(endpoint))

      return await api.query.staking.erasStakers.entries(era)
    },
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
  // NOTE: polkadot.js returned codec object includes reference to the registry
  // which shouldn't be freezed
  dangerouslyAllowMutability: true,
})

export const useEraStakersState = (era: Extract<AnyNumber, SerializableParam>) =>
  eraStakersState({ endpoint: useSubstrateApiEndpoint(), era })

export const recommendedPoolsState = selectorFamily({
  key: 'Staking/BondedPools',
  get:
    (endpoint: string) =>
    async ({ get }) => {
      const chains = get(chainsState)
      const api = get(substrateApiState(endpoint))

      const chain = chains.find(x => x.genesisHash === api.genesisHash.toHex())

      const recommendedPoolIds = await new DotPoolSelector(new ValidatorSelector(api), api, {
        ...defaultOptions,
        numberOfPools: Infinity,
      })
        .getPoolsMeetingCriteria()
        .then(x => x.map(({ poolId }) => poolId))

      const pools = await api.query.nominationPools.bondedPools
        .entries()
        .then(x => x.map(y => ({ poolId: y[0].args[0].toNumber() ?? 0, bondedPool: y[1] })))

      const names = await api.query.nominationPools.metadata.multi(pools.map(({ poolId }) => poolId))

      return pools
        .map((pool, index) => ({ ...pool, name: names[index]?.toUtf8() }))
        .filter(pool => pool.bondedPool.isSome)
        .map(pool => ({ ...pool, bondedPool: pool.bondedPool.unwrap() }))
        .sort((a, b) =>
          a.poolId === chain?.priorityPool && b.poolId !== chain.priorityPool
            ? -1
            : b.poolId === chain?.priorityPool && a.poolId !== chain.priorityPool
            ? 1
            : recommendedPoolIds.includes(a.poolId) && !recommendedPoolIds.includes(b.poolId)
            ? -1
            : recommendedPoolIds.includes(b.poolId) && !recommendedPoolIds.includes(a.poolId)
            ? 1
            : b.bondedPool.points.cmp(a.bondedPool.points)
        )
    },
  cachePolicy_UNSTABLE: { eviction: 'most-recent' },
  // NOTE: polkadot.js returned codec object includes reference to the registry
  // which shouldn't be freezed
  dangerouslyAllowMutability: true,
})

export const useRecommendedPoolsState = () => recommendedPoolsState(useSubstrateApiEndpoint())
