import { Principal } from '@dfinity/principal'
import { create } from 'zustand'
import {persist,createJSONStorage} from 'zustand/middleware'
import {storage} from "declarations/storage"
import { bigint } from 'ts-pattern/dist/patterns'


type Secrets = Awaited<ReturnType<typeof storage.get_storages>>
interface HushUserStae {
    username: string,
    storagePrincipal: string,
    setStoragePrincipal: (principal: string) => void
    secrets: Secrets,
    setSecrets: (secrets: Secrets) => void,
    addHushUser: (principal: string, secrets: Secrets,username: string) => void,
    clearHushUser: () => void
}
export const useHushUser = create(
    persist<HushUserStae>(
        (set) => ({
            username: '',
            storagePrincipal: '',
            setUsername: (username: string) => set((state) => ({ ...state, username })),
            setStoragePrincipal: (principal: string) => set((state) => ({ ...state, storagePrincipal: principal })),
            secrets: [],
            setSecrets: (secrets: Secrets) => set((state) => ({ ...state, secrets })),
            addHushUser: (principal: string, secrets: Secrets,username: string) => {
                set((state) => ({ ...state, storagePrincipal: principal, secrets ,username}))
            },
            clearHushUser: () => {
                set((state) => ({ ...state, storagePrincipal: '', secrets: [] }))
            }
          }),{
            name: 'hush-user',
            storage: createJSONStorage(() => sessionStorage,{
                replacer(key, value) {
                    console.log(value)
                    if (typeof value === 'bigint') {
                        console.log(value)
                        return { type: 'number', value: value.toString()}
                    }
                    return value
                },
            }),
            
          }
    )
)