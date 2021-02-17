import { LocalLoadPurchases } from '@/data/usercases'
import { mockPurchases, CacheStoreSpy, getCacheExpirationDate } from '@/data/tests'

type SutTypes = {
    sut: LocalLoadPurchases
    cacheStore: CacheStoreSpy
}

const makeSut = (timestamp = new Date()): SutTypes => {
    const cacheStore = new CacheStoreSpy()
    const sut = new LocalLoadPurchases(cacheStore, timestamp)

    return {
        sut,
        cacheStore
    }
}

describe('LocalSavePurchases', () => {
    test('não deve deletar ou inserir cache no init', () => {
        const { cacheStore } = makeSut()
        expect(cacheStore.actions).toEqual([])
    })

    test('deve deletar o cache se o load falhar', () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateFetchError()
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    test('não deve fazer nada se o load tiver sucesso', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timestamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
    })

    test('deve deletar o cache se ele estiver expirado', () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timestamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })

    test('deve deletar o cache na data de expiraçãodo', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = { timestamp }
        sut.validate()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch, CacheStoreSpy.Action.delete])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(cacheStore.deleteKey).toBe('purchases')
    })
})