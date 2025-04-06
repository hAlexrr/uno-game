import { MultiplayerProvider } from "@/context/multiplayer-context"
import UnoGame from "@/components/uno-game"

export default function Home() {
  return (
    <div className="h-full w-full overflow-hidden">
      <MultiplayerProvider>
        <UnoGame />
      </MultiplayerProvider>
    </div>
  )
}

