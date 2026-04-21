import { auth, signIn, signOut } from "@/auth"
import { Button } from "@heroui/react";

export default async function Home() {
  const session = await auth();

  return (
    <div>
      <form
        action={async () => {
          "use server"
          await signIn("github")
        }}
      >
        <Button type="submit">Signin with GitHub</Button>
      </form>
      <br />
      <form
        action={async () => {
          "use server"
          await signOut()
        }}
      >
        <Button type="submit">Signout</Button>
      </form>
      <br />
      <div>{session?.user ? JSON.stringify(session.user) : "Not signed in"}</div>
    </div>
    
  );
}
