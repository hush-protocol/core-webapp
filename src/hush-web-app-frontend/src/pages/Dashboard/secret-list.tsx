import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Result_1, SecretStorage } from "declarations/storage/storage.did";
import { createActor as createStorageActor } from "declarations/storage";
import { useHushUser } from "@/lib/store/user-store";
import { Label } from "@radix-ui/react-label";
import {
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Checkbox, CheckboxGroup, Input } from "@nextui-org/react";
import { Textarea } from "@/components/ui/textarea";
import { EyeFilledIcon } from "@/components/icons/EyeFilledIcon";
import { EyeSlashFilledIcon } from "@/components/icons/EyeSlashFilledIcon";
import { IBECiphertext, TransportSecretKey } from "ic-vetkd-utils";
import { hex_decode, hex_encode, stringToUint8Array } from "@/lib/utils";
import { Principal } from "@dfinity/principal";
import { toast } from "sonner";
import { canisterId as recoveryCanisterID } from "declarations/recovery_dkim_email_verifier";
import { useFetchSecrets } from "@/lib/hooks/useFetchSecrets";
import { BadgeCheckbox } from "@/components/ui/badge-checkbox";
import { RECOVERY_CANISTERS_OPTIONS } from "@/lib/constant";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";

const options = [{ label: "DKIM Email", value: "bw4dl-smaaa-aaaaa-qaacq-cai" }];

export function AddSecretModal({
  newSecret,
  setNewSecret,
  isVisible,
  toggleVisibility,
  loading,
  registSecret,
}: {
  newSecret: string;
  setNewSecret: (value: string) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  loading: boolean;
  registSecret: () => void;
}) {
  const [groupSelected, setGroupSelected] = useState<any[]>([]);
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          setNewSecret("");
        }
      }}
    >
      <DialogTrigger asChild>
        <Button className="w-auto grid items-center">Add Secret</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register Secret</DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="recovery-methods" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="recovery-methods">Recovery Methods</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          <TabsContent value="recovery-methods">
            <div className="grid gap-4 py-4">
              {" "}
              <CheckboxGroup
                className="gap-1"
                label="Select Recovery Methods"
                orientation="horizontal"
                value={groupSelected}
                onChange={setGroupSelected}
              >
                {RECOVERY_CANISTERS_OPTIONS.map((option) => (
                  <BadgeCheckbox key={option.key} value={option.key}>
                    {option.label}
                  </BadgeCheckbox>
                ))}
              </CheckboxGroup>
              <p className="mt-4 ml-1 text-default-500">
                Selected: {groupSelected.join(", ")}
              </p>
            </div>
          </TabsContent>
          <TabsContent value="password">
            <Input
              variant="bordered"
              placeholder="Enter your secret"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label="toggle password visibility"
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              onChange={(event) => setNewSecret(event.target.value)}
              value={newSecret}
              className="max-w-xs placeholder:text-white"
            />
          </TabsContent>
        </Tabs>
      
        <DialogFooter>
          <Button onClick={registSecret}>
            {loading ? "Loading" : "Register"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
export function SecretTable({ secrets }: { secrets: SecretStorage[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Steps In Recovery</TableHead>
          <TableHead className="hidden md:table-cell">Created at</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {secrets?.map((secret: SecretStorage, index) => {
          return (
            <TableRow key={secret.name}>
              <TableCell className="font-medium">{secret.name}</TableCell>
              <TableCell className="hidden md:table-cell">
                {secret.recovery_storage_canisters.length}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(
                  parseInt(secret.created_at.toString())
                ).toDateString()}
              </TableCell>
              <TableCell>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-auto grid items-center">
                      See Secret
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Register Secret</DialogTitle>
                      <DialogDescription></DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <Badge>DKIM Verifier Selected</Badge>
                      <div className="grid w-full gap-1.5">
                        <Label htmlFor="message">Your Raw Email</Label>
                        {/* <Textarea
                            placeholder="Type your message here."
                            value={rawEmail}
                            onChange={(event) =>
                              setRawEmail(event.target.value)
                            }
                            id="message"
                          /> */}
                      </div>
                      {/* {retrieveSecret && (
                          <Input
                            variant="bordered"
                            placeholder="Enter your secret"
                            endContent={
                              <button
                                className="focus:outline-none"
                                type="button"
                                onClick={toggleVisibility}
                                aria-label="toggle password visibility"
                              >
                                {isVisible ? (
                                  <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                ) : (
                                  <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                                )}
                              </button>
                            }
                            type={isVisible ? "text" : "password"}
                            value={retrieveSecret}
                            className="max-w-xs placeholder:text-white"
                          />
                        )} */}
                    </div>
                    <DialogFooter>
                      {/* <Button loading={loading} onClick={() => verifySecret(index)}>
                          {loading ? "Loading" : "Verify"}
                        </Button> */}
                      <Button>Verify</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

export default function SecretList() {
  const { storagePrincipal, username } = useHushUser();
  const { data: secrets, error } = useFetchSecrets({ storagePrincipal });
  const [isVisible, setIsVisible] = useState(false);
  const [rawEmail, setRawEmail] = useState<string>("");
  const [retrieveSecret, setRetrieveSecret] = useState<string>();
  const toggleVisibility = () => setIsVisible(!isVisible);
  console.log("Error", error);
  const [newSecret, setNewSecret] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const registSecret = async () => {
    try {
      if (!secrets) {
        throw new Error("Error fetchingg secrets");
      }
      console.log("Registering Secret");
      const storageActor = createStorageActor(storagePrincipal);
      const pk_bytes_hex_result = await storageActor.get_public_key();
      if ("Err" in pk_bytes_hex_result) {
        throw new Error(pk_bytes_hex_result.Err);
      }
      const pk_bytes_hex = pk_bytes_hex_result.Ok;
      console.log("Public Key", pk_bytes_hex);
      console.log("Public Key", pk_bytes_hex);
      const message = new TextEncoder().encode(newSecret);
      console.log("Message", message);
      const seed = window.crypto.getRandomValues(new Uint8Array(32));
      const derivation_path = `${username}#${newSecret.length}`;
      console.log({ derivation_path });
      const ciphertext_bytes = IBECiphertext.encrypt(
        hex_decode(pk_bytes_hex),
        Principal.fromText(storagePrincipal).toUint8Array(),
        message,
        seed
      );
      console.log("Ciphertext", ciphertext_bytes);
      const ciphertext = hex_encode(ciphertext_bytes.serialize());

      console.log("Ciphertext", ciphertext);

      console.log("Ciphertext", ciphertext);
      const result = await storageActor.add_secret(
        {
          name: "My First Secret",
          secret: ciphertext,
          created_at: BigInt(Date.now()),
          recovery_storage_canisters: [Principal.fromText(recoveryCanisterID)],
        },
        [rawEmail]
      );
      console.log("Result", result);
      if ("Err" in result) {
        toast.error(result.Err);
        console.log("Error", result.Err);
        throw new Error(result.Err);
      }
      toast.success("Secret Registered");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const verifySecret = async (index: number) => {
    try {
      setLoading(true);
      if (!secrets) {
        throw new Error("Error fetchingg secrets");
      }
      const storageActor = createStorageActor(storagePrincipal);
      const tsk_seed = window.crypto.getRandomValues(new Uint8Array(32));
      const tsk = new TransportSecretKey(tsk_seed);
      const secretStorage = secrets[index];

      const secret_decryption_key = await storageActor.verify_secret(
        BigInt(index),
        tsk.public_key(),
        [rawEmail]
      );
      const pk_bytes_hex_result = await storageActor.get_public_key();
      if ("Err" in pk_bytes_hex_result) {
        throw new Error(pk_bytes_hex_result.Err);
      }
      if ("Err" in secret_decryption_key) {
        throw new Error(secret_decryption_key.Err);
      }
      const pk_bytes_hex = pk_bytes_hex_result.Ok;
      console.log("Public Key", pk_bytes_hex);
      const derivation_path = `${username}#${index}`;
      console.log({ derivation_path });
      console.log("Secret Decryption Key", secret_decryption_key.Ok);
      const sk = secret_decryption_key.Ok;
      const tskNew = new TransportSecretKey(tsk_seed);
      const secret_bytes = tskNew.decrypt(
        hex_decode(sk),
        hex_decode(pk_bytes_hex),
        Principal.fromText(storagePrincipal).toUint8Array()
      );
      console.log("Secret Bytes", secret_bytes);
      const ibe_ciphertext = IBECiphertext.deserialize(
        hex_decode(secretStorage.secret)
      );
      console.log(ibe_ciphertext);
      const plaintext_hex = ibe_ciphertext.decrypt(secret_bytes);
      console.log("Plaintext", plaintext_hex);
      const plaintext = new TextDecoder("utf-8").decode(plaintext_hex);
      console.log("Plaintext", plaintext);

      setRetrieveSecret(plaintext);
      console.log("Secret", plaintext);
      toast.success("Secret Verified");
    } catch (e: any) {
      console.log(e);
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  console.log("Secrets", secrets);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Secrets</CardTitle>
        <CardDescription>Click On Secrets to retrieve them</CardDescription>
        <AddSecretModal
          isVisible={isVisible}
          loading={loading}
          newSecret={newSecret}
          registSecret={registSecret}
          setNewSecret={setNewSecret}
          toggleVisibility={toggleVisibility}
        />
      </CardHeader>
      <CardContent>
        <SecretTable secrets={secrets ?? []} />
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  );
}
