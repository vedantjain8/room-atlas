import { Input } from "@nextui-org/input";
import { Button } from "@nextui-org/react";

export default function Login(){
    return (
        <div className="flex items-center justify-center h-screen overflow-y-clip">
        <div className="flex w-64 flex-col gap-4 items-center justify-center register1">
          <h1>Login Page</h1>
          <Input type="text" variant="bordered" label="Username/Email" />
          <Input type="password" variant="bordered" label="Password" />
          <Button>Proceed</Button>
        </div>
        </div>

    );
    
}