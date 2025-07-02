"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const supabase = createClientComponentClient();
  const route = useRouter();
  const clickHandler = async () => {
    const { error } = await supabase.auth.signOut();
    // Forzar limpieza de cookies y recarga para que el middleware detecte el logout
    if (!error) {
      // Redirige y recarga la página para limpiar la sesión en el middleware
      route.push("/sign-in");
      window.location.href = "/sign-in";
    }
  };
  return <Button onClick={clickHandler}> Log out</Button>;
}
