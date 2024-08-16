import SecretList from "./secret-list";
import { Navbar } from "./navbar";




export default function DashboardPage() {
    return (
        <div className="flex flex-col">
            <Navbar />
            <SecretList/>
        </div>
    ); 
}