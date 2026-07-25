import { Dashboard } from "@/components/dashboard/Dashboard";
import { Navbar } from "@/components/layout/Navbar";
import { getClan, getCurrentWar } from "@/lib/clash-api";

export default async function Home() {
  const [clan, currentWar] = await Promise.all([getClan(), getCurrentWar()]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <Dashboard clan={clan} currentWar={currentWar} />
    </main>
  );
}
