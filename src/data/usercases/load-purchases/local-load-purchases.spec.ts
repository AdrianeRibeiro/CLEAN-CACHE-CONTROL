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

    test('deve retornar uma lista vazia se o load falhar', async () => {
        const { cacheStore, sut } = makeSut()
        cacheStore.simulateFetchError()
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(purchases).toEqual([])
    })

    test('deve retornar uma lista de compras se o cache é válido', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() + 1)
        const { cacheStore, sut } = makeSut(timestamp)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual(cacheStore.fetchResult.value)
    })

    test('deve retornar uma lista vazia se o cache está expirado', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        timestamp.setSeconds(timestamp.getSeconds() - 1)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    test('deve retornar uma lista vazia se o cache está na data de expiração', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(currentDate)
        cacheStore.fetchResult = {
            timestamp,
            value: mockPurchases()
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })

    test('deve retornar uma lista vazia se o cache for vazio', async () => {
        const currentDate = new Date()
        const timestamp = getCacheExpirationDate(currentDate)
        const { cacheStore, sut } = makeSut(timestamp)
        cacheStore.fetchResult = {
            timestamp,
            value: []
        }
        const purchases = await sut.loadAll()
        expect(cacheStore.actions).toEqual([CacheStoreSpy.Action.fetch])
        expect(cacheStore.fetchKey).toBe('purchases')
        expect(purchases).toEqual([])
    })
})