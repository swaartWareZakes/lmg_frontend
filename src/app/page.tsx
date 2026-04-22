// --- ./src/app/page.tsx ---
import { redirect } from "next/navigation";

export default function Home() {
  // We don't want a landing page right now; go straight to the Muni Fleet Dashboard
  redirect("/dashboard"); 
}