import useSWR from "swr";
import { useHushUser } from "../store/user-store";
import { createActor as createStorageActor } from "declarations/storage";
export  function useFetchSecrets({storagePrincipal}:{storagePrincipal: string}) {
    return useSWR("fetch-storages", async () => {
        console.log("Fetching", storagePrincipal);
        const storageActor = createStorageActor(storagePrincipal);
        console.log("Storage Actor", storagePrincipal.toString());
        const username = await storageActor.get_username();
        console.log("Username", username);
        console.log("Storage Actor", storageActor);
        const res = await storageActor.get_storages();
        console.log("Res", res);
        return res;
    });
} 