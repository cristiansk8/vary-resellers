"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function HeaderLogoutButton() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const clickHandler = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/sign-in");
      window.location.href = "/sign-in";
    }
  };
  return (
    <Button onClick={clickHandler} className="bg-red-600 hover:bg-red-700 text-white ml-2">
      Logout
    </Button>
  );
}
