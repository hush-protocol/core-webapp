// import { CardFooter ,Card,CardContent,CardHeader,CardDescription,CardTitle} from "../components/ui/card";
// import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { hush } from "declarations/hush";
import { useLocation } from "wouter";
import { createActor as createStorageActor,  } from "declarations/storage";
import {reclaim_verifier_unofficial} from "declarations/reclaim_verifier_unofficial"
import { toast } from "sonner";
import { useHushUser } from "@/lib/store/user-store";
import { UsernameCard } from "./username-card";
import { Button } from "@/components/ui/button";


interface ClaimData {
  provider: string;
  parameters: string;
  owner: string;
  timestampS: number;
  context: string;
  identifier: string;
  epoch: number;
}

interface Witness {
  id: string;
  url: string;
}

interface Proof {
  identifier: string;
  claimData: ClaimData;
  witnesses: Witness[];
  signatures: string[];
}

interface ClaimInfo {
  context: string;
  parameters: string;
  provider: string;
}

interface Claim {
  epoch: number;
  identifier: string;
  owner: string;
  timestampS: number;
}

interface SignedClaim {
  claim: Claim;
  signatures: string[];
}

interface OnChainProof {
  claimInfo: ClaimInfo;
  signedClaim: SignedClaim;
}


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
  const reclaim = async ()=>{
    console.log('hi')
    await reclaim_verifier_unofficial.add_epoch(
      [
        {
          address:"0x244897572368Eadf65bfBc5aec98D8e5443a9072",
          host:"https://reclaim-node.questbook.app"
        }
      ],
      BigInt(1)
    ).then((res)=>{
      console.log(res)
      console.log("added first epoch")
    })

    await reclaim_verifier_unofficial.add_epoch(
      [
        {
          address:"0x244897572368Eadf65bfBc5aec98D8e5443a9072",
          host:"https://reclaim-node.questbook.app"
        }
      ],
      BigInt(1)
    )
    .then((res)=>{
      console.log(res)
      console.log("added second epoch")
    })
    
    const RECLAIM_ON_CHAIN_PROOF = "{\"claimInfo\":{\"context\":\"{\\\"contextAddress\\\":\\\"0x0\\\",\\\"contextMessage\\\":\\\"\\\",\\\"extractedParameters\\\":{\\\"URL_PARAMS_1_GRD\\\":\\\"115577285913\\\",\\\"black_player\\\":\\\"dipanshuhappy\\\",\\\"result\\\":\\\"1-0\\\",\\\"white_paper\\\":\\\"bolsheviz\\\"},\\\"providerHash\\\":\\\"0x92aa966ab7b5b53d19d926cc49808499ef37ba458938ee5fb58de33db599f628\\\"}\",\"parameters\":\"{\\\"body\\\":\\\"\\\",\\\"geoLocation\\\":\\\"\\\",\\\"method\\\":\\\"GET\\\",\\\"paramValues\\\":{\\\"URL_PARAMS_1_GRD\\\":\\\"115577285913\\\",\\\"black_player\\\":\\\"dipanshuhappy\\\",\\\"result\\\":\\\"1-0\\\",\\\"white_paper\\\":\\\"bolsheviz\\\"},\\\"responseMatches\\\":[{\\\"type\\\":\\\"contains\\\",\\\"value\\\":\\\"\\\\\\\"Black\\\\\\\":\\\\\\\"{{black_player}}\\\\\\\"\\\"},{\\\"type\\\":\\\"contains\\\",\\\"value\\\":\\\"\\\\\\\"White\\\\\\\":\\\\\\\"{{white_paper}}\\\\\\\"\\\"},{\\\"type\\\":\\\"contains\\\",\\\"value\\\":\\\"\\\\\\\"Result\\\\\\\":\\\\\\\"{{result}}\\\\\\\"\\\"}],\\\"responseRedactions\\\":[{\\\"jsonPath\\\":\\\"$.game.pgnHeaders.Black\\\",\\\"regex\\\":\\\"\\\\\\\"Black\\\\\\\":\\\\\\\"(.*)\\\\\\\"\\\",\\\"xPath\\\":\\\"\\\"},{\\\"jsonPath\\\":\\\"$.game.pgnHeaders.White\\\",\\\"regex\\\":\\\"\\\\\\\"White\\\\\\\":\\\\\\\"(.*)\\\\\\\"\\\",\\\"xPath\\\":\\\"\\\"},{\\\"jsonPath\\\":\\\"$.game.pgnHeaders.Result\\\",\\\"regex\\\":\\\"\\\\\\\"Result\\\\\\\":\\\\\\\"(.*)\\\\\\\"\\\",\\\"xPath\\\":\\\"\\\"}],\\\"url\\\":\\\"https://www.chess.com/callback/live/game/{{URL_PARAMS_1_GRD}}\\\"}\",\"provider\":\"http\"},\"signedClaim\":{\"claim\":{\"epoch\":1,\"identifier\":\"0x03d4391292bcb444988f103291d3ca067930cbc08db0f93b0d25e3f118d20efc\",\"owner\":\"0xe719f9a3f443855d06b2afacfba8fe6af6a074da\",\"timestampS\":1724931438},\"signatures\":[\"0x1c940708bcdb582699d3d514501ac25b6308a5ab312194234ed553d3cbccb1720a563c5489f477fc922863e4058894ebee9afa29e0525cc2510b67ba2931f15a1b\"]}}"

    const proof : OnChainProof = JSON.parse(RECLAIM_ON_CHAIN_PROOF)

    const result = await reclaim_verifier_unofficial.verify_proof({
      context: proof.claimInfo.context,
      parameters: proof.claimInfo.parameters,
      provider:proof.claimInfo.provider
    },{
      claim:{
        epoch:BigInt(proof.signedClaim.claim.epoch),
        identifier:proof.signedClaim.claim.identifier,
        owner:proof.signedClaim.claim.owner,
        timestampS:BigInt(proof.signedClaim.claim.timestampS)
      },
      signatures: proof.signedClaim.signatures
    }).then((res)=>{
      console.log(res)
      console.log("result")
      return res
    })
    console.log({result})

  }
  return (
    <div className="w-screen h-screen grid place-items-center">
      <Button onClick={reclaim}>Recliam</Button>
      {/* <UsernameCard loading={loading} onEnterClick={onEnterClick} setUsername={setUsername} username={username}/> */}
    </div>
  );
}
