import { PurchaseModel } from '@/domain/models'

export interface LoadPurchases {
    loadAll: (purchases: Array<LoadPurchases.Result>) => Promise<void>
}

export namespace LoadPurchases {
    export type Result = PurchaseModel
}

