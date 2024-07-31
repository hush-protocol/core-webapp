import { Principal } from '@dfinity/principal'
import { create } from 'zustand'
import {persist,createJSONStorage} from 'zustand/middleware'
import {storage} from "declarations/storage"


type Secrets = Awaited<ReturnType<typeof storage.get_storages>>
interface HushUserStae {
    storagePrincipal: Principal,
    setStoragePrincipal: (principal: Principal) => void
    secrets: Secrets,
    setSecrets: (secrets: Secrets) => void,
    addHushUser: (principal: Principal, secrets: Secrets) => void
}
export const useHushUser = create(
    persist<HushUserStae>(
        (set) => ({
            storagePrincipal: Principal.anonymous(),
            setStoragePrincipal: (principal: Principal) => set((state) => ({ ...state, storagePrincipal: principal })),
            secrets: [],
            setSecrets: (secrets: Secrets) => set((state) => ({ ...state, secrets })),
            addHushUser: (principal: Principal, secrets: Secrets) => {
                set((state) => ({ ...state, storagePrincipal: principal, secrets }))
            }
          }),{
            name: 'hush-user',
            storage: createJSONStorage(() => sessionStorage)
          }
    )
)