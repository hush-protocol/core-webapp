import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

const UsernameCardHeader = () => (
  <CardHeader>
    <CardTitle>Enter Username</CardTitle>
    <CardDescription>
      Enter your existing username or create a new one
    </CardDescription>
  </CardHeader>
);

const UsernameBody = ({
  username,
  setUsername,
}: {
  username: string;
  setUsername: (newUsername: string) => void;
}) => {
  return (
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
  );
};

const UsernameFooter = (props: Omit<ButtonProps, "children">) => {
  return (
    <CardFooter className="flex justify-center items-center my-4">
      <Button {...props}>Enter</Button>
    </CardFooter>
  );
};
export const UsernameCard = ({
  username,
  setUsername,
  onEnterClick,
  loading = false
}: {
  username: string;
  setUsername: (newUsername: string) => void;
  onEnterClick: React.MouseEventHandler<HTMLButtonElement>;
  loading:boolean
}) => {
  return (
    <>
      <Card className="w-[350px]">
        <UsernameCardHeader />
        <UsernameBody username={username} setUsername={setUsername} />
        <UsernameFooter onClick={onEnterClick}  loading={loading}/>
      </Card>
    </>
  );
};
