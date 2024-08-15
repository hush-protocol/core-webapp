// import { CardFooter ,Card,CardContent,CardHeader,CardDescription,CardTitle} from "../components/ui/card";
// import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { hush } from "declarations/hush";
import { useLocation } from "wouter";
import { createActor as createStorageActor,  } from "declarations/storage";
import { toast } from "sonner";
import { useHushUser } from "@/lib/store/user-store";
import { Button } from "@/components/ui/button";
import { UsernameCard } from "./username-card";
// import { Button } from "@nextui-org/react";

// import { Label } from "@radix-ui/react-select";
export default function HomePage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [_, navigate] = useLocation();
  const { addHushUser } = useHushUser();
  const onEnterClick = async () => {
    setLoading(true);
    try {
      console.log("Enter clicked");
      const isExisting = await hush.does_username_exist(username);
      if (isExisting) {
        const storagePrincipal = await hush.get_storage_canister(username);
        if (!storagePrincipal[0] || !storagePrincipal[0]) {
          throw new Error("Error getting storage canister");
        }
        const storageActor = await createStorageActor(storagePrincipal[0]);
        const secrets = await storageActor.get_storages();
        console.log("Secrets", secrets);
        addHushUser(storagePrincipal[0].toText(), secrets,username);
        navigate("/dashboard", {
          replace: true,
        });
      }
      const result = await hush.create_user(username);
      
      if("Err" in result){
        throw new Error(result.Err);
      }
      if("Ok" in result){
        const storagePrincipal = result.Ok;
        const storageActor = await createStorageActor(storagePrincipal);
        const secrets = await storageActor.get_storages();
        addHushUser(storagePrincipal.toText(), secrets,username);
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (e: any) {
      toast.error(e.message);
      throw new Error(e.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="w-screen h-screen grid place-items-center">
      <UsernameCard onEnterClick={onEnterClick} setUsername={setUsername} username={username}/>
    </div>
  );
}
