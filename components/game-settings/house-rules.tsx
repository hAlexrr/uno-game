"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { PowerIcon as Gear, BookOpen, HelpCircle } from "lucide-react"
import { useMultiplayerContext } from "@/context/multiplayer-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function HouseRules() {
  const { gameState, updateGameSettings, isHost } = useMultiplayerContext()
  const [openPresets, setOpenPresets] = useState(false)

  // New rule presets
  const ruleSets = [
    {
      name: "Classic",
      description: "Original UNO rules, nothing fancy",
      rules: {
        stackingEnabled: false,
        jumpInEnabled: false,
        drawUntilMatch: false,
        forcePlay: true,
        sevenORule: false,
        blankCards: false,
        challengeRule: true,
        playDrawnCard: true,
        specialSwapHands: false,
        progressive: false,
        keepDrawing: false,
        bluffing: false,
        tradeHands: false,
        noBluffChallenges: true,
        teamPlay: false,
        callOutForgetting: true,
      },
    },
    {
      name: "House Party",
      description: "Fun, chaotic rules for parties",
      rules: {
        stackingEnabled: true,
        jumpInEnabled: true,
        drawUntilMatch: true,
        forcePlay: false,
        sevenORule: true,
        blankCards: true,
        challengeRule: true,
        playDrawnCard: true,
        specialSwapHands: true,
        progressive: true,
        keepDrawing: true,
        bluffing: true,
        tradeHands: true,
        noBluffChallenges: false,
        teamPlay: false,
        callOutForgetting: true,
      },
    },
    {
      name: "Challenge Mode",
      description: "Competitive rules for skilled players",
      rules: {
        stackingEnabled: true,
        jumpInEnabled: true,
        drawUntilMatch: false,
        forcePlay: true,
        sevenORule: false,
        blankCards: false,
        challengeRule: true,
        playDrawnCard: true,
        specialSwapHands: false,
        progressive: false,
        keepDrawing: false,
        bluffing: true,
        tradeHands: false,
        noBluffChallenges: false,
        teamPlay: false,
        callOutForgetting: true,
      },
    },
    {
      name: "Team Play",
      description: "Play in pairs with teammates",
      rules: {
        stackingEnabled: true,
        jumpInEnabled: false,
        drawUntilMatch: false,
        forcePlay: true,
        sevenORule: false,
        blankCards: false,
        challengeRule: true,
        playDrawnCard: true,
        specialSwapHands: false,
        progressive: true,
        keepDrawing: false,
        bluffing: false,
        tradeHands: false,
        noBluffChallenges: true,
        teamPlay: true,
        callOutForgetting: false,
      },
    },
  ]

  const applyRulePreset = (preset: (typeof ruleSets)[0]) => {
    updateGameSettings(preset.rules)
    setOpenPresets(false)
  }

  // Rule descriptions for tooltips
  const ruleDescriptions = {
    stackingEnabled: "Players can stack +2 and +4 cards, forcing the next player to draw the cumulative amount",
    jumpInEnabled: "Players can play an identical card out of turn, then play continues from them",
    drawUntilMatch: "Players must keep drawing until they get a playable card",
    forcePlay: "Players must play a card if they have a valid one",
    sevenORule:
      "When a 7 is played, you swap hands with another player. When a 0 is played, all players pass hands to the next player",
    blankCards: "Includes blank cards that can be any color (but not wild cards)",
    challengeRule: "Players can challenge a Wild +4 if they think it was played illegally",
    playDrawnCard: "Players can play a card immediately after drawing it",
    specialSwapHands: "Includes special swap hands cards",
    progressive:
      "If a player plays a +2/+4 and the next player also has a +2/+4, they can play it and the next player draws the combined amount",
    keepDrawing: "If a player draws a playable card, they must keep drawing until they get a non-playable card",
    bluffing: "Players can bluff about having to play a Wild +4 (and can be challenged)",
    tradeHands: "When a player has only 2 cards left, they can choose to trade hands with another player",
    noBluffChallenges: "A player who incorrectly challenges a Wild +4 must draw 6 cards instead of 4",
    teamPlay: "Players team up and work together to win",
    callOutForgetting: "If a player forgets to say UNO, other players can call them out and they draw 2 cards",
  }

  if (!isHost || !gameState) return null

  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Gear size={16} />
            House Rules
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Gear size={18} />
              House Rules
            </DialogTitle>
            <DialogDescription>Customize game rules to match your preferred way of playing</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="special">Special</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 pt-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="stacking-toggle" className="text-sm">
                        Stacking (+2/+4):
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.stackingEnabled}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="stacking-toggle"
                      checked={gameState?.gameSettings.stackingEnabled}
                      onCheckedChange={(checked) => updateGameSettings({ stackingEnabled: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="jumpin-toggle" className="text-sm">
                        Jump-In Rule:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.jumpInEnabled}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="jumpin-toggle"
                      checked={gameState?.gameSettings.jumpInEnabled}
                      onCheckedChange={(checked) => updateGameSettings({ jumpInEnabled: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="drawuntil-toggle" className="text-sm">
                        Draw Until Match:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.drawUntilMatch}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="drawuntil-toggle"
                      checked={gameState?.gameSettings.drawUntilMatch}
                      onCheckedChange={(checked) => updateGameSettings({ drawUntilMatch: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="forceplay-toggle" className="text-sm">
                        Force Play:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.forcePlay}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="forceplay-toggle"
                      checked={gameState?.gameSettings.forcePlay}
                      onCheckedChange={(checked) => updateGameSettings({ forcePlay: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="playdrawn-toggle" className="text-sm">
                        Play Drawn Card:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.playDrawnCard}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="playdrawn-toggle"
                      checked={gameState?.gameSettings.playDrawnCard}
                      onCheckedChange={(checked) => updateGameSettings({ playDrawnCard: checked })}
                    />
                  </div>
                </TooltipProvider>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 pt-4">
              <div className="space-y-2">
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="seveno-toggle" className="text-sm">
                        Seven-O Rule:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>{ruleDescriptions.sevenORule}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="seveno-toggle"
                      checked={gameState?.gameSettings.sevenORule}
                      onCheckedChange={(checked) => updateGameSettings({ sevenORule: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="blank-toggle" className="text-sm">
                        Blank Cards:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.blankCards}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="blank-toggle"
                      checked={gameState?.gameSettings.blankCards}
                      onCheckedChange={(checked) => updateGameSettings({ blankCards: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="challenge-toggle" className="text-sm">
                        Challenge Rule:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.challengeRule}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="challenge-toggle"
                      checked={gameState?.gameSettings.challengeRule}
                      onCheckedChange={(checked) => updateGameSettings({ challengeRule: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="swap-toggle" className="text-sm">
                        Swap Hands Card:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.specialSwapHands}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="swap-toggle"
                      checked={gameState?.gameSettings.specialSwapHands}
                      onCheckedChange={(checked) => updateGameSettings({ specialSwapHands: checked })}
                    />
                  </div>
                </TooltipProvider>
              </div>
            </TabsContent>

            <TabsContent value="special" className="space-y-4 pt-4">
              <div className="space-y-2">
                {/* New special rules */}
                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="progressive-toggle" className="text-sm">
                        Progressive UNO:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.progressive}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="progressive-toggle"
                      checked={gameState?.gameSettings.progressive}
                      onCheckedChange={(checked) => updateGameSettings({ progressive: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="bluffing-toggle" className="text-sm">
                        Bluffing:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.bluffing}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="bluffing-toggle"
                      checked={gameState?.gameSettings.bluffing}
                      onCheckedChange={(checked) => updateGameSettings({ bluffing: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="teamplay-toggle" className="text-sm">
                        Team Play:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.teamPlay}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="teamplay-toggle"
                      checked={gameState?.gameSettings.teamPlay}
                      onCheckedChange={(checked) => updateGameSettings({ teamPlay: checked })}
                    />
                  </div>
                </TooltipProvider>

                <TooltipProvider>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Label htmlFor="callout-toggle" className="text-sm">
                        Call Out Forgetting UNO:
                      </Label>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle size={14} className="text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{ruleDescriptions.callOutForgetting}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Switch
                      id="callout-toggle"
                      checked={gameState?.gameSettings.callOutForgetting}
                      onCheckedChange={(checked) => updateGameSettings({ callOutForgetting: checked })}
                    />
                  </div>
                </TooltipProvider>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={() => setOpenPresets(true)}>
              Load Preset
            </Button>
            <Button
              onClick={() =>
                updateGameSettings({
                  stackingEnabled: false,
                  jumpInEnabled: false,
                  drawUntilMatch: false,
                  forcePlay: true,
                  sevenORule: false,
                  blankCards: false,
                  challengeRule: true,
                  playDrawnCard: true,
                  specialSwapHands: false,
                  progressive: false,
                  keepDrawing: false,
                  bluffing: false,
                  tradeHands: false,
                  noBluffChallenges: true,
                  teamPlay: false,
                  callOutForgetting: true,
                })
              }
            >
              Reset to Default
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rule Presets Dialog */}
      <Dialog open={openPresets} onOpenChange={setOpenPresets}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen size={18} />
              Rule Presets
            </DialogTitle>
            <DialogDescription>Choose a predefined set of rules</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {ruleSets.map((ruleSet, index) => (
              <div
                key={index}
                className="border rounded-md p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => applyRulePreset(ruleSet)}
              >
                <h4 className="font-medium mb-1">{ruleSet.name}</h4>
                <p className="text-sm text-gray-500">{ruleSet.description}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

