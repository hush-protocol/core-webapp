
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import useSWR, { Fetcher } from 'swr'
import { Result_1, SecretStorage, } from "declarations/storage/storage.did"
import { createActor as createStorageActor } from "declarations/storage"
import { useHushUser } from "@/lib/store/user-store"

export default function SecretList() {
  const { storagePrincipal } = useHushUser()

  const { data:secrets, error } = useSWR('fetch-storages',async ()=>{
    console.log("Fetching",storagePrincipal)
    const storageActor = createStorageActor(storagePrincipal);
    console.log("Storage Actor",storageActor)   
    return storageActor.get_storages()
  })
  console.log("Error", error)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Secrets</CardTitle>
        <CardDescription>Click On Secrets to retrieve them</CardDescription>
        <Button className="w-auto grid items-center">Add Secret</Button>
      </CardHeader>
      <CardContent>
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
            
          {
            secrets?.map((secret:SecretStorage)=>{
              return <TableRow>
                <TableCell className="font-medium">{secret.name}</TableCell>
                <TableCell className="hidden md:table-cell">{secret.recovery_storage_canisters.length}</TableCell>
                <TableCell className="hidden md:table-cell">{new Date(parseInt(secret.created_at.toString())).toDateString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoveHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
          })}
            {/* // <TableRow>
              
            //   <TableCell className="font-medium">AeroGlow Desk Lamp</TableCell>
            //   <TableCell className="hidden md:table-cell">$39.99</TableCell>
            //   <TableCell className="hidden md:table-cell">2023-11-29 08:15 AM</TableCell>
            //   <TableCell>
            //     <DropdownMenu>
            //       <DropdownMenuTrigger asChild>
            //         <Button aria-haspopup="true" size="icon" variant="ghost">
            //           <MoveHorizontalIcon className="h-4 w-4" />
            //           <span className="sr-only">Toggle menu</span>
            //         </Button>
            //       </DropdownMenuTrigger>
            //       <DropdownMenuContent align="end">
            //         <DropdownMenuLabel>Actions</DropdownMenuLabel>
            //         <DropdownMenuItem>Edit</DropdownMenuItem>
            //         <DropdownMenuItem>Delete</DropdownMenuItem>
            //       </DropdownMenuContent>
            //     </DropdownMenu>
            //   </TableCell>
            // </TableRow> */}
            </TableBody>
          
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-10</strong> of <strong>32</strong> products
        </div>
      </CardFooter>
    </Card>
  )
}

function MoveHorizontalIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 8 22 12 18 16" />
      <polyline points="6 8 2 12 6 16" />
      <line x1="2" x2="22" y1="12" y2="12" />
    </svg>
  )
}
