import { Principal } from '@dfinity/principal'
import { create } from 'zustand'
import {persist,createJSONStorage} from 'zustand/middleware'
import {storage} from "declarations/storage"


type Secrets = Awaited<ReturnType<typeof storage.get_storages>>
interface HushUserStae {
    username: string,
    storagePrincipal: Principal,
    setStoragePrincipal: (principal: Principal) => void
    secrets: Secrets,
    setSecrets: (secrets: Secrets) => void,
    addHushUser: (principal: Principal, secrets: Secrets,username: string) => void,
    clearHushUser: () => void
}
export const useHushUser = create(
    persist<HushUserStae>(
        (set) => ({
            username: '',
            storagePrincipal: Principal.anonymous(),
            setUsername: (username: string) => set((state) => ({ ...state, username })),
            setStoragePrincipal: (principal: Principal) => set((state) => ({ ...state, storagePrincipal: principal })),
            secrets: [],
            setSecrets: (secrets: Secrets) => set((state) => ({ ...state, secrets })),
            addHushUser: (principal: Principal, secrets: Secrets,username: string) => {
                set((state) => ({ ...state, storagePrincipal: principal, secrets ,username}))
            },
            clearHushUser: () => {
                set((state) => ({ ...state, storagePrincipal: Principal.anonymous(), secrets: [] }))
            }
          }),{
            name: 'hush-user',
            storage: createJSONStorage(() => sessionStorage)
          }
    )
)