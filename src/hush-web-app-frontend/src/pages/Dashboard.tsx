import { useHushUser } from "@/lib/store/user-store";
import { cn, shortenAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { If, Then } from "react-if";
import SecretList from "@/components/dashbaord/SecretList";


function Navbar({ className }: { className?: string }) {
    const { username,clearHushUser } = useHushUser();
    
    return (
      <If condition={username.length>0}>
        <Then>
          <div className={cn("self-end mx-5 inset-x-0 w-fit z-50")}>
            <div className="flex items-center gap-4">
              <div className="bg-muted rounded-md px-3 py-2 text-muted-foreground">
                {shortenAddress(username)}
              </div>
              <Button
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                onClick={() => clearHushUser()}
              >
                Logout
              </Button>
            </div>
          </div>
        </Then>
      </If>
    );
  }

export default function DashboardPage() {
    return (
        <div className="flex flex-col">
            <Navbar />
            <SecretList/>

        </div>
    );
}