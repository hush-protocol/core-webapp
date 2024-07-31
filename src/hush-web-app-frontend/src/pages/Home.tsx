import BannerImage from "../../public/banner.png";
// import { CardFooter ,Card,CardContent,CardHeader,CardDescription,CardTitle} from "../components/ui/card";
// import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { hush ,idlFactory} from "declarations/hush";
import { useLocation, useRouter } from "wouter";
import { createActor as createStorageActor,  } from "declarations/storage";
import { toast } from "sonner";
import { useHushUser } from "@/lib/store/user-store";
import { match } from "ts-pattern";

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
        addHushUser(storagePrincipal[0], secrets,username);
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
        addHushUser(storagePrincipal, secrets,username);
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
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Enter Username</CardTitle>
          <CardDescription>
            Enter your existing username or create a new one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-4">
                <Label>Username</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Usually its email"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center items-center my-4">
          <Button onClick={onEnterClick}>Enter</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
