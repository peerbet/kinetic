import { INestApplication } from '@nestjs/common'
import { Response } from 'supertest'
import {
  AdminClusters,
  AdminCreateApp,
  AdminMintCreate,
  AdminMintCreateInput,
  UserApp,
  UserAppEnv,
  UserAppEnvCreateInput,
  UserAppEnvStats,
  UserAppMintUpdateInput,
  UserApps,
  UserCluster,
  UserClusters,
  UserCreateAppEnv,
  UserUpdateAppMint,
} from '../generated/api-sdk'
import { ADMIN_USERNAME, initializeE2eApp, runGraphQLQuery, runGraphQLQueryAdmin, runLoginQuery } from '../helpers'
import { uniq, uniqInt } from '../helpers/uniq'

function expectUnauthorized(res: Response) {
  expect(res).toHaveProperty('text')
  const errors = JSON.parse(res.text).errors
  expect(errors[0].message).toEqual('Unauthorized')
}

function randomUsername(): string {
  return uniq('user-')
}

describe('User (e2e)', () => {
  let app: INestApplication
  let userId: string | undefined
  let username: string | undefined
  let token: string | undefined

  beforeAll(async () => {
    app = await initializeE2eApp()
    const res = await runLoginQuery(app, ADMIN_USERNAME)
    token = res.body.data.login.token
    username = randomUsername()
  })

  afterAll(async () => {
    userId = undefined
    username = undefined
    return app.close()
  })

  describe('Expected usage', () => {
    describe('CRUD', () => {
      it('should find a cluster', async () => {
        const clusterId = 'solana-devnet'

        return runGraphQLQueryAdmin(app, token, UserCluster, { clusterId })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.item

            expect(data.id).toBe('solana-devnet')
            expect(data.status).toBe('Active')
            expect(data.type).toBe('SolanaDevnet')
          })
      })

      it('should find a list of clusters', async () => {
        return runGraphQLQueryAdmin(app, token, UserClusters)
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.items

            expect(data.length).toBeGreaterThan(1)
          })
      })

      it('should find a list of Admin Clusters', async () => {
        return runGraphQLQueryAdmin(app, token, AdminClusters)
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.items

            expect(data.length).toBeGreaterThan(1)
          })
      })

      it('should find a list of Apps', async () => {
        return runGraphQLQueryAdmin(app, token, UserApps)
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.items

            expect(data.length).toBeGreaterThan(1)
          })
      })

      it('should find a list of Env Stats', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })

        const appEnvId = createdApp.body.data.created.envs[0].id

        return runGraphQLQueryAdmin(app, token, UserAppEnvStats, { appEnvId })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.stats

            expect(data).toHaveProperty('transactionCount')
          })
      })

      it('should search an AppEnv by appEnvId', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id
        const appEnvId = createdApp.body.data.created.envs[0].id

        return runGraphQLQueryAdmin(app, token, UserAppEnv, { appId, appEnvId })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.item

            expect(data.app.id).toBe(appId)
          })
      })

      it('should search an App by appId', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id

        return runGraphQLQueryAdmin(app, token, UserApp, { appId })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.item

            expect(data.id).toBe(appId)
          })
      })

      it('should create an App Env', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id
        const clusterId = 'solana-devnet'
        const input: UserAppEnvCreateInput = {
          name: 'Solana Devnet',
        }

        return runGraphQLQueryAdmin(app, token, UserCreateAppEnv, { appId, clusterId, input })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.created

            expect(data.app.id).toBe(appId)
            expect(data.cluster.id).toBe(clusterId)
            expect(data.cluster.name).toBe(input.name)
          })
      })

      it('should create an App Mint', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const clusterId = 'solana-devnet'
        const input: AdminMintCreateInput = {
          address: '3SaUThdYFoUX2FYUi9ZPf2TKTu3UYKhNHhXb2Y6najRg',
          clusterId,
          decimals: 9,
          name: 'Hello Token',
          symbol: 'HIT',
        }

        return runGraphQLQueryAdmin(app, token, AdminMintCreate, { input })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const mint = res.body.data?.adminMintCreate.mints.filter((mint) => mint.address === input.address)[0]

            expect(mint.address).toBe(input.address)
            expect(mint.decimals).toBe(input.decimals)
            expect(mint.name).toBe(input.name)
            expect(mint.symbol).toBe(input.symbol)
          })
      })

      it('should update an AppMint', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id

        const clusterId = 'solana-devnet'
        const address = 'GqWbZDQaeJsiscgtGpDrJsNCxxeuHqJCGKs4oWBY1aYQ'
        const inputMint: AdminMintCreateInput = {
          address,
          clusterId,
          decimals: 4,
          name: 'GTA LIVE',
          symbol: 'GTA',
        }
        const createdMint = await runGraphQLQueryAdmin(app, token, AdminMintCreate, { input: inputMint })
        const appMint = createdMint.body.data?.adminMintCreate

        const input: UserAppMintUpdateInput = {
          addMemo: true,
        }

        return runGraphQLQueryAdmin(app, token, UserUpdateAppMint, { appId, appMintId: appMint.id, input })
          .expect(200)
          .expect((res) => {
            expect(res).toHaveProperty('body.data')
            const data = res.body.data?.updated

            expect(data).not.toBeNull()
          })
      })
    })
  })

  describe('Unexpected usage', () => {
    describe('Unauthenticated Access', () => {
      it('should not find a cluster', async () => {
        const clusterId = 'solana-devnet'

        return runGraphQLQuery(app, UserCluster, { clusterId })
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not find a list of clusters', async () => {
        return runGraphQLQuery(app, UserClusters)
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not find a list of Admin Clusters', async () => {
        return runGraphQLQuery(app, AdminClusters)
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not find a list of Apps', async () => {
        return runGraphQLQuery(app, UserApps)
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not find a list of Env Stats', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })

        const appEnvId = createdApp.body.data.created.envs[0].id

        return runGraphQLQuery(app, UserAppEnvStats, { appEnvId })
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not search an AppEnv by appEnvId', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id
        const appEnvId = createdApp.body.data.created.envs[0].id

        return runGraphQLQuery(app, UserAppEnv, { appId, appEnvId })
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })

      it('should not search an App by appId', async () => {
        const name = uniq('app-')
        const index = uniqInt()
        const createdApp = await runGraphQLQueryAdmin(app, token, AdminCreateApp, {
          input: { index, name },
        })
        const appId = createdApp.body.data.created.id

        return runGraphQLQuery(app, UserApp, { appId })
          .expect(200)
          .expect((res) => expectUnauthorized(res))
      })
    })
  })
})
