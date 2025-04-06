import { MultiplayerProvider } from "@/context/multiplayer-context"
import UnoGame from "@/components/uno-game"

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8">
      <MultiplayerProvider>
        <UnoGame />
      </MultiplayerProvider>
    </main>
  )
}

