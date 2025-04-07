"use client"

import { useState } from "react"
import { Paintbrush, Check, Palette } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import UnoCardComponent from "../uno-card"

// Card themes
const CARD_THEMES = [
  { id: "classic", name: "Classic", primaryColor: "#E53935", secondaryColor: "#1E88E5" },
  { id: "neon", name: "Neon", primaryColor: "#FF00FF", secondaryColor: "#00FFFF" },
  { id: "pastel", name: "Pastel", primaryColor: "#FFB6C1", secondaryColor: "#ADD8E6" },
  { id: "dark", name: "Dark", primaryColor: "#212121", secondaryColor: "#424242" },
  { id: "nature", name: "Nature", primaryColor: "#4CAF50", secondaryColor: "#8BC34A" },
  { id: "ocean", name: "Ocean", primaryColor: "#0288D1", secondaryColor: "#03A9F4" },
  { id: "sunset", name: "Sunset", primaryColor: "#FF9800", secondaryColor: "#F44336" },
  { id: "galaxy", name: "Galaxy", primaryColor: "#673AB7", secondaryColor: "#3F51B5" },
]

// Card backs
const CARD_BACKS = [
  { id: "classic", name: "Classic", color: "#1565C0" },
  { id: "spiral", name: "Spiral", color: "#6A1B9A" },
  { id: "stars", name: "Stars", color: "#283593" },
  { id: "dots", name: "Dots", color: "#00695C" },
  { id: "stripes", name: "Stripes", color: "#4E342E" },
  { id: "gradient", name: "Gradient", color: "#D84315" },
  { id: "geometric", name: "Geometric", color: "#0097A7" },
  { id: "minimalist", name: "Minimalist", color: "#37474F" },
]

// Table themes
const TABLE_THEMES = [
  { id: "classic", name: "Classic Green", color: "#2E7D32", borderColor: "#1B5E20" },
  { id: "blue", name: "Ocean Blue", color: "#1565C0", borderColor: "#0D47A1" },
  { id: "red", name: "Ruby Red", color: "#C62828", borderColor: "#B71C1C" },
  { id: "purple", name: "Royal Purple", color: "#6A1B9A", borderColor: "#4A148C" },
  { id: "dark", name: "Midnight", color: "#263238", borderColor: "#1A237E" },
  { id: "wood", name: "Wooden", color: "#795548", borderColor: "#5D4037" },
  { id: "space", name: "Space", color: "#212121", borderColor: "#311B92" },
  { id: "beach", name: "Beach", color: "#FFB74D", borderColor: "#F57C00" },
]

export default function AppearanceSettings() {
  const { cardTheme, setCardTheme, cardBack, setCardBack } = useMultiplayerContext()
  const [previewTheme, setPreviewTheme] = useState(cardTheme)
  const [previewBack, setPreviewBack] = useState(cardBack)
  const [tableTheme, setTableTheme] = useState("classic")
  const [previewTable, setPreviewTable] = useState("classic")

  // Sample cards for preview
  const sampleCards = [
    { id: 1, color: "red", value: "7", type: "number" },
    { id: 2, color: "blue", value: "skip", type: "action" },
    { id: 3, color: "wild", value: "wild", type: "wild" },
  ]

  // Apply changes
  const applyChanges = () => {
    setCardTheme(previewTheme)
    setCardBack(previewBack)
    setTableTheme(previewTable)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="fixed bottom-44 right-4 flex items-center gap-2">
          <Paintbrush size={16} />
          <span>Appearance</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette size={18} />
            Customize Appearance
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="cards">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="cards">Card Themes</TabsTrigger>
            <TabsTrigger value="backs">Card Backs</TabsTrigger>
            <TabsTrigger value="table">Table</TabsTrigger>
          </TabsList>

          <TabsContent value="cards" className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2">
              {CARD_THEMES.map((theme) => (
                <div
                  key={theme.id}
                  className={`p-2 border rounded-md cursor-pointer transition-all ${
                    previewTheme === theme.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setPreviewTheme(theme.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium">{theme.name}</span>
                    {previewTheme === theme.id && <Check size={14} className="text-primary" />}
                  </div>
                  <div className="flex gap-1">
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.primaryColor }} />
                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: theme.secondaryColor }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-2 pt-2">
              {sampleCards.map((card) => (
                <div key={card.id} className="transform hover:scale-110 transition-transform">
                  <UnoCardComponent card={card} onClick={() => {}} disabled={true} theme={previewTheme} />
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="backs" className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2">
              {CARD_BACKS.map((back) => (
                <div
                  key={back.id}
                  className={`p-2 border rounded-md cursor-pointer transition-all ${
                    previewBack === back.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setPreviewBack(back.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium">{back.name}</span>
                    {previewBack === back.id && <Check size={14} className="text-primary" />}
                  </div>
                  <div className="w-full h-10 rounded-md" style={{ backgroundColor: back.color }} />
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <div
                className="w-14 h-20 rounded-lg flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: CARD_BACKS.find((b) => b.id === previewBack)?.color || "#1565C0" }}
              >
                UNO
              </div>
            </div>
          </TabsContent>

          <TabsContent value="table" className="space-y-4 pt-4">
            <div className="grid grid-cols-3 gap-2">
              {TABLE_THEMES.map((table) => (
                <div
                  key={table.id}
                  className={`p-2 border rounded-md cursor-pointer transition-all ${
                    previewTable === table.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setPreviewTable(table.id)}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium">{table.name}</span>
                    {previewTable === table.id && <Check size={14} className="text-primary" />}
                  </div>
                  <div
                    className="w-full h-10 rounded-md border-2"
                    style={{
                      backgroundColor: table.color,
                      borderColor: table.borderColor,
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-2">
              <div
                className="w-40 h-24 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: TABLE_THEMES.find((t) => t.id === previewTable)?.color || "#2E7D32",
                  border: `2px solid ${TABLE_THEMES.find((t) => t.id === previewTable)?.borderColor || "#1B5E20"}`,
                }}
              >
                <span className="text-white text-xs">Table Preview</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button onClick={applyChanges}>Apply Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

