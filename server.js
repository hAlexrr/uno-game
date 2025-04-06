const express = require("express")
const http = require("http")
const { Server } = require("socket.io")
const next = require("next")
const cors = require("cors")

const dev = process.env.NODE_ENV !== "production"
const app = next({ dev })
const handle = app.getRequestHandler()

// Store active games
const activeGames = {}

// Card colors and values
const cardColors = ["red", "blue", "green", "yellow"]
const cardValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "skip", "reverse", "draw2"]
const wildCards = ["wild", "wild4"]

// Generate a random card
function generateRandomCard(gameSettings) {
  const isWild = Math.random() > 0.8
  const color = isWild ? "wild" : cardColors[Math.floor(Math.random() * cardColors.length)]
  const value = isWild
    ? wildCards[Math.floor(Math.random() * wildCards.length)]
    : cardValues[Math.floor(Math.random() * cardValues.length)]
  const type = isWild ? "wild" : ["skip", "reverse", "draw2"].includes(value) ? "action" : "number"

  return {
    id: Math.floor(Math.random() * 10000),
    color,
    value,
    type,
  }
}

// Generate a hand of cards
function generateHand(count = 7) {
  const hand = []
  for (let i = 0; i < count; i++) {
    hand.push(generateRandomCard({ specialSwapHands: false, blankCards: false }))
  }
  return hand
}

// Function to reset the game state
function resetGameState(gameState) {
  // Deal cards to all players
  gameState.players = gameState.players.map((p) => ({
    ...p,
    cards: generateHand(),
    isCurrentTurn: false,
    calledUno: false,
  }))

  // Set the first player's turn
  gameState.players[0].isCurrentTurn = true
  gameState.currentPlayerId = gameState.players[0].id

  // Set a random card as the top card
  const initialCard = generateRandomCard(gameState.gameSettings)
  // Make sure the initial card is not a wild card or special card
  if (initialCard.type === "wild" || initialCard.type === "special") {
    initialCard.color = ["red", "blue", "green", "yellow"][Math.floor(Math.random() * 4)]
    initialCard.type = "number"
    initialCard.value = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"][Math.floor(Math.random() * 9)]
  }

  gameState.topCard = initialCard
  gameState.currentColor = initialCard.color
  gameState.gameStarted = true

  // Calculate a more realistic card count:
  // Standard UNO deck has 108 cards
  // Subtract the cards dealt to players and the top card
  const totalDealtCards = gameState.players.length * 7 + 1
  gameState.cardsRemaining = 108 - totalDealtCards

  // Initialize scores if not already done
  gameState.players.forEach((p) => {
    if (!gameState.scores[p.name]) {
      gameState.scores[p.name] = 0
    }
  })
}

// Add this function to handle bot turns
function handleBotTurn(gameState, botIndex) {
  const bot = gameState.players[botIndex]

  // Bot AI logic - find a playable card
  const playableCards = bot.cards.filter(
    (card) =>
      !gameState.topCard ||
      card.type === "wild" ||
      card.type === "special" ||
      gameState.topCard.color === card.color ||
      gameState.currentColor === card.color ||
      gameState.topCard.value === card.value,
  )

  if (playableCards.length > 0) {
    // Choose a card to play based on difficulty
    let cardToPlay

    switch (bot.difficulty || "medium") {
      case "easy":
        // Play a random valid card
        cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)]
        break

      case "medium":
        // Prefer action cards and wild cards
        const actionCards = playableCards.filter(
          (card) => card.type === "action" || card.type === "wild" || card.type === "special",
        )

        if (actionCards.length > 0 && Math.random() > 0.3) {
          cardToPlay = actionCards[Math.floor(Math.random() * actionCards.length)]
        } else {
          cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)]
        }
        break

      case "hard":
        // Strategic play - prioritize number cards first, save special cards
        const numberCards = playableCards.filter((card) => card.type === "number")
        const specialCards = playableCards.filter(
          (card) => card.type === "action" || card.type === "wild" || card.type === "special",
        )

        if (numberCards.length > 0) {
          cardToPlay = numberCards[Math.floor(Math.random() * numberCards.length)]
        } else {
          cardToPlay = specialCards[Math.floor(Math.random() * specialCards.length)]
        }
        break

      default:
        cardToPlay = playableCards[Math.floor(Math.random() * playableCards.length)]
    }

    // Remove the card from the bot's hand
    const cardIndex = bot.cards.findIndex((c) => c.id === cardToPlay.id)
    bot.cards.splice(cardIndex, 1)

    // Handle wild cards
    if (cardToPlay.type === "wild" || (cardToPlay.type === "special" && cardToPlay.value === "blank")) {
      // Choose a color
      const colors = ["red", "blue", "green", "yellow"]
      const colorCounts = {}

      // Count the colors in the bot's hand
      bot.cards.forEach((card) => {
        if (card.color !== "wild") {
          colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
        }
      })

      // Choose the most common color in hand, or random if none
      let chosenColor = colors[Math.floor(Math.random() * colors.length)]
      let maxCount = 0

      Object.entries(colorCounts).forEach(([color, count]) => {
        if (count > maxCount) {
          maxCount = count
          chosenColor = color
        }
      })

      // Set the chosen color
      gameState.currentColor = chosenColor

      // Log the action
      return {
        action: "play_wild",
        card: cardToPlay,
        color: chosenColor,
      }
    }

    // Update the top card and current color
    gameState.topCard = cardToPlay

    if (cardToPlay.type !== "wild" && cardToPlay.type !== "special") {
      gameState.currentColor = cardToPlay.color
    }

    // Check for winner
    if (bot.cards.length === 0) {
      return {
        action: "win",
        card: cardToPlay,
      }
    }

    // Handle card effects
    if (cardToPlay.value === "skip" || cardToPlay.value === "reverse" || cardToPlay.value === "draw2") {
      return {
        action: "play_action",
        card: cardToPlay,
      }
    }

    // Regular card play
    return {
      action: "play",
      card: cardToPlay,
    }
  } else {
    // No playable cards, draw a card
    const newCard = generateRandomCard(gameState.gameSettings)
    bot.cards.push(newCard)
    gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)

    // Check if the drawn card can be played
    const canPlay =
      !gameState.topCard ||
      newCard.type === "wild" ||
      newCard.type === "special" ||
      gameState.topCard.color === newCard.color ||
      gameState.currentColor === newCard.color ||
      newCard.value === gameState.topCard.value

    if (canPlay && gameState.gameSettings.playDrawnCard) {
      // Play the drawn card
      bot.cards.pop() // Remove the card we just added

      // Handle wild cards
      if (newCard.type === "wild" || (newCard.type === "special" && newCard.value === "blank")) {
        // Choose a color
        const colors = ["red", "blue", "green", "yellow"]
        const colorCounts = {}

        // Count the colors in the bot's hand
        bot.cards.forEach((card) => {
          if (card.color !== "wild") {
            colorCounts[card.color] = (colorCounts[card.color] || 0) + 1
          }
        })

        // Choose the most common color in hand, or random if none
        let chosenColor = colors[Math.floor(Math.random() * colors.length)]
        let maxCount = 0

        Object.entries(colorCounts).forEach(([color, count]) => {
          if (count > maxCount) {
            maxCount = count
            chosenColor = color
          }
        })

        // Set the chosen color
        gameState.currentColor = chosenColor

        // Return the action
        return {
          action: "play_drawn_wild",
          card: newCard,
          color: chosenColor,
        }
      }

      // Update the top card and current color
      gameState.topCard = newCard

      if (newCard.type !== "wild" && newCard.type !== "special") {
        gameState.currentColor = newCard.color
      }

      // Handle card effects
      if (newCard.value === "skip" || newCard.value === "reverse" || newCard.value === "draw2") {
        return {
          action: "play_drawn_action",
          card: newCard,
        }
      }

      // Regular card play
      return {
        action: "play_drawn",
        card: newCard,
      }
    } else {
      // Can't play the drawn card
      return {
        action: "draw",
        card: newCard,
      }
    }
  }
}

// Add a function to process the bot turn after a player's turn
function processBotTurns(gameState, roomCode) {
  // Check if the current player is a bot
  const currentPlayerIndex = gameState.players.findIndex((p) => p.id === gameState.currentPlayerId)

  if (currentPlayerIndex !== -1 && gameState.players[currentPlayerIndex].isBot) {
    // Add a small delay to make it feel more natural
    setTimeout(() => {
      const bot = gameState.players[currentPlayerIndex]
      console.log(`Bot ${bot.name} is taking its turn`)

      // Handle the bot's turn
      const result = handleBotTurn(gameState, currentPlayerIndex)

      // Process the result
      if (result) {
        switch (result.action) {
          case "play":
          case "play_action":
          case "play_wild":
            // Log the action
            io.to(roomCode).emit("game_log", `${bot.name} played ${result.card.color} ${result.card.value}`)

            if (result.action === "play_wild") {
              io.to(roomCode).emit("game_log", `${bot.name} chose ${result.color}`)
            }

            // Handle card effects
            handleCardEffects(gameState, result.card, currentPlayerIndex)
            break

          case "play_drawn":
          case "play_drawn_action":
          case "play_drawn_wild":
            // Log the action
            io.to(roomCode).emit("game_log", `${bot.name} drew and played ${result.card.color} ${result.card.value}`)

            if (result.action === "play_drawn_wild") {
              io.to(roomCode).emit("game_log", `${bot.name} chose ${result.color}`)
            }

            // Handle card effects
            handleCardEffects(gameState, result.card, currentPlayerIndex)
            break

          case "draw":
            // Log the action
            io.to(roomCode).emit("game_log", `${bot.name} drew a card`)

            // Move to the next player
            const nextPlayerIndex = getNextPlayerIndex(gameState, currentPlayerIndex)

            gameState.players.forEach((p, i) => {
              p.isCurrentTurn = i === nextPlayerIndex
            })

            gameState.currentPlayerId = gameState.players[nextPlayerIndex].id
            break

          case "win":
            // Update scores
            gameState.scores[bot.name] = (gameState.scores[bot.name] || 0) + 1

            // Broadcast winner
            io.to(roomCode).emit("game_winner", { playerId: bot.id, playerName: bot.name })
            io.to(roomCode).emit("game_log", `${bot.name} wins the game!`)

            // End the game
            gameState.gameStarted = false
            break
        }

        // Broadcast the updated game state
        io.to(roomCode).emit("game_state_update", gameState)

        // If the game is still going and the next player is a bot, process their turn
        if (gameState.gameStarted) {
          const nextPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)

          if (nextPlayer) {
            io.to(roomCode).emit("game_log", `${nextPlayer.name}'s turn`)

            if (nextPlayer.isBot) {
              // Process the next bot's turn
              processBotTurns(gameState, roomCode)
            }
          }
        }
      }
    }, 1000) // 1 second delay for bot turns
  }
}

// Add this function to the server.js file to directly trigger bot turns
// This should be added right after the processBotTurns function
// Add this function to manually trigger a bot turn
function triggerBotTurn(roomCode) {
  const gameState = activeGames[roomCode]

  if (!gameState || !gameState.gameStarted) return

  // Find the current player
  const currentPlayerIndex = gameState.players.findIndex((p) => p.id === gameState.currentPlayerId)

  if (currentPlayerIndex !== -1 && gameState.players[currentPlayerIndex].isBot) {
    console.log(`Manually triggering bot turn for ${gameState.players[currentPlayerIndex].name}`)
    processBotTurns(gameState, roomCode)
  }
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    handle(req, res)
  })

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  })

  // Socket.io logic
  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`)

    // Handle creating a new game room
    socket.on("create_game", (playerName, callback) => {
      try {
        // Generate a random 6-character room code
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase()

        // Create a new player
        const player = {
          id: socket.id,
          name: playerName,
          cards: [],
          isCurrentTurn: true,
          isHuman: true,
          isHost: true,
          calledUno: false,
        }

        // Create a new game state
        const gameState = {
          roomCode,
          players: [player],
          gameStarted: false,
          topCard: null,
          currentColor: null,
          currentPlayerId: socket.id,
          cardsRemaining: 40,
          direction: 1, // 1 for clockwise, -1 for counter-clockwise
          gameSettings: {
            stackingEnabled: false,
            jumpInEnabled: false,
            drawUntilMatch: false,
            forcePlay: true,
            sevenORule: false, // Changed from true to false
            blankCards: false,
            challengeRule: true,
            playDrawnCard: true,
            specialSwapHands: false,
            gameSpeed: "normal",
          },
          scores: {
            [playerName]: 0,
          },
        }

        // Store the game state
        activeGames[roomCode] = gameState

        // Join the socket to the room
        socket.join(roomCode)

        console.log(`Game created with room code: ${roomCode} by ${playerName}`)

        // Send the room code back to the client
        callback({ success: true, roomCode, playerId: socket.id })

        // Broadcast the updated game state to all clients in the room
        io.to(roomCode).emit("game_state_update", gameState)
      } catch (error) {
        console.error("Error creating game:", error)
        callback({ success: false, error: "Failed to create game" })
      }
    })

    // Handle joining an existing game
    socket.on("join_game", (data, callback) => {
      try {
        const { roomCode, playerName } = data

        console.log(`Player ${playerName} attempting to join room ${roomCode}`)

        if (!activeGames[roomCode]) {
          console.log(`Room ${roomCode} not found`)
          callback({ success: false, error: "Game not found" })
          return
        }

        if (activeGames[roomCode].gameStarted) {
          console.log(`Game in room ${roomCode} already started`)
          callback({ success: false, error: "Game already started" })
          return
        }

        // Create a new player
        const player = {
          id: socket.id,
          name: playerName,
          cards: [],
          isCurrentTurn: false,
          isHuman: true,
          isHost: false,
          calledUno: false,
        }

        // Add the player to the game
        activeGames[roomCode].players.push(player)

        // Initialize score for the new player
        activeGames[roomCode].scores[playerName] = 0

        // Join the socket to the room
        socket.join(roomCode)

        console.log(`Player ${playerName} joined room ${roomCode}`)

        // Send success response back to the client
        callback({ success: true, roomCode, playerId: socket.id })

        // Broadcast the updated game state to all clients in the room
        io.to(roomCode).emit("game_state_update", activeGames[roomCode])
        io.to(roomCode).emit("game_log", `${playerName} joined the game`)
      } catch (error) {
        console.error("Error joining game:", error)
        callback({ success: false, error: "Failed to join game" })
      }
    })

    // Handle updating game settings
    socket.on("update_game_settings", (data) => {
      const { roomCode, settings } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Check if the player is the host
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player || !player.isHost) return

      // Update the game settings
      gameState.gameSettings = {
        ...gameState.gameSettings,
        ...settings,
      }

      // Broadcast the updated game state to all clients in the room
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", "Game settings updated")
    })

    socket.on("start_game", (roomCode) => {
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Check if the player is the host
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player || !player.isHost) return

      // Reset the game state
      resetGameState(gameState)

      // Broadcast the updated game state to all clients in the room
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", "Game started")
      io.to(roomCode).emit("game_log", `Initial card: ${gameState.topCard.color} ${gameState.topCard.value}`)
      io.to(roomCode).emit("game_log", `${gameState.players[0].name}'s turn`)

      // Check if the first player is a bot, and if so, trigger their turn
      if (gameState.players[0].isBot) {
        setTimeout(() => {
          processBotTurns(gameState, roomCode)
        }, 1000)
      }
    })

    // Handle playing a card
    socket.on("play_card", (data) => {
      const { roomCode, cardId } = data
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the player
      const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)
      if (playerIndex === -1) return

      const player = gameState.players[playerIndex]

      // Check if it's the player's turn
      if (player.id !== gameState.currentPlayerId) return

      // Find the card
      const cardIndex = player.cards.findIndex((c) => c.id === cardId)
      if (cardIndex === -1) return

      const card = player.cards[cardIndex]

      // Check if the card can be played
      const canPlay =
        !gameState.topCard ||
        card.type === "wild" ||
        card.type === "special" ||
        gameState.topCard.color === card.color ||
        gameState.currentColor === card.color ||
        gameState.topCard.value === card.value

      if (!canPlay) return

      // Handle special cards
      if (card.type === "special") {
        if (card.value === "swap") {
          // Swap hands with a random player
          const otherPlayers = gameState.players.filter((p) => p.id !== player.id)
          const randomPlayer = otherPlayers[Math.floor(Math.random() * otherPlayers.length)]

          // Swap cards
          const playerCards = [...player.cards]
          player.cards = [...randomPlayer.cards]

          // Find the random player and update their cards
          const randomPlayerIndex = gameState.players.findIndex((p) => p.id === randomPlayer.id)
          if (randomPlayerIndex !== -1) {
            gameState.players[randomPlayerIndex].cards = playerCards
          }

          io.to(roomCode).emit("game_log", `${player.name} swapped hands with ${randomPlayer.name}!`)
        }

        if (card.value === "blank") {
          // For blank cards, client will send a follow-up color selection
          io.to(socket.id).emit("select_color", { cardId })
          return
        }
      }

      // Handle wild cards
      if (card.type === "wild") {
        // Client will send a follow-up color selection
        io.to(socket.id).emit("select_color", { cardId })
        return
      }

      // Remove the card from the player's hand
      player.cards.splice(cardIndex, 1)

      // Update the top card
      gameState.topCard = card

      // Update the current color if not a wild card
      if (card.type !== "wild" && card.type !== "special") {
        gameState.currentColor = card.color
      }

      // Check for winner
      if (player.cards.length === 0) {
        // Update scores
        gameState.scores[player.name] = (gameState.scores[player.name] || 0) + 1

        // Broadcast winner
        io.to(roomCode).emit("game_winner", { playerId: player.id, playerName: player.name })
        io.to(roomCode).emit("game_log", `${player.name} wins the game!`)
        return
      }

      // Handle card effects
      handleCardEffects(gameState, card, playerIndex)

      // Decrease cards remaining
      gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", `${player.name} played ${card.color} ${card.value}`)

      // Notify next player
      const nextPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
      if (nextPlayer) {
        io.to(roomCode).emit("game_log", `${nextPlayer.name}'s turn`)
      }

      // After updating the game state and broadcasting it:
      processBotTurns(gameState, roomCode)
    })

    // Handle card effects
    function handleCardEffects(gameState, card, playerIndex) {
      // Handle skip
      if (card.value === "skip") {
        // Find the next player
        const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

        // Skip to the player after the next
        const nextNextPlayerIndex = getNextPlayerIndex(gameState, nextPlayerIndex)

        // Set the next player's turn
        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextNextPlayerIndex
        })

        gameState.currentPlayerId = gameState.players[nextNextPlayerIndex].id

        return
      }

      // Handle reverse
      if (card.value === "reverse") {
        // Reverse the direction
        gameState.direction *= -1

        // In a 2-player game, reverse acts like skip
        if (gameState.players.length === 2) {
          // Skip to the player after the next (which is the same player in a 2-player game)
          gameState.players.forEach((p, i) => {
            p.isCurrentTurn = i === playerIndex
          })

          gameState.currentPlayerId = gameState.players[playerIndex].id

          return
        }
      }

      // Handle draw 2
      if (card.value === "draw2") {
        // Find the next player
        const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

        // Make the next player draw 2 cards
        for (let i = 0; i < 2; i++) {
          const newCard = generateRandomCard(gameState.gameSettings)
          gameState.players[nextPlayerIndex].cards.push(newCard)
          gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)
        }

        // Skip the next player's turn
        const nextNextPlayerIndex = getNextPlayerIndex(gameState, nextPlayerIndex)

        // Set the next player's turn
        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextNextPlayerIndex
        })

        gameState.currentPlayerId = gameState.players[nextNextPlayerIndex].id

        return
      }

      // Handle seven-o rule
      if (gameState.gameSettings.sevenORule) {
        if (card.value === "7") {
          // Player who played 7 chooses someone to swap hands with
          // For simplicity, we'll choose the next player
          const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

          // Swap cards
          const playerCards = [...gameState.players[playerIndex].cards]
          gameState.players[playerIndex].cards = [...gameState.players[nextPlayerIndex].cards]
          gameState.players[nextPlayerIndex].cards = playerCards
        }

        if (card.value === "0") {
          // Everyone passes their hand to the next player
          // This is complex to implement, so we'll just log it
          // We would need to implement a more complex rotation here
        }
      }

      // Set the next player's turn for normal cards
      const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

      gameState.players.forEach((p, i) => {
        p.isCurrentTurn = i === nextPlayerIndex
      })

      gameState.currentPlayerId = gameState.players[nextPlayerIndex].id
    }

    // Helper function to get the next player index based on direction
    function getNextPlayerIndex(gameState, currentIndex) {
      const numPlayers = gameState.players.length
      return (currentIndex + gameState.direction + numPlayers) % numPlayers
    }

    // Handle selecting a color for wild cards
    socket.on("select_color", (data) => {
      const { roomCode, cardId, color } = data
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the player
      const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)
      if (playerIndex === -1) return

      const player = gameState.players[playerIndex]

      // Check if it's the player's turn
      if (player.id !== gameState.currentPlayerId) return

      // Find the card
      const cardIndex = player.cards.findIndex((c) => c.id === cardId)
      if (cardIndex === -1) return

      const card = player.cards[cardIndex]

      // Remove the card from the player's hand
      player.cards.splice(cardIndex, 1)

      // Update the top card and current color
      gameState.topCard = card
      gameState.currentColor = color

      // Check for winner
      if (player.cards.length === 0) {
        // Update scores
        gameState.scores[player.name] = (gameState.scores[player.name] || 0) + 1

        // Broadcast winner
        io.to(roomCode).emit("game_winner", { playerId: player.id, playerName: player.name })
        io.to(roomCode).emit("game_log", `${player.name} wins the game!`)
        return
      }

      // Handle card effects (for wild+4)
      if (card.value === "wild4") {
        // Find the next player
        const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

        // Make the next player draw 4 cards
        for (let i = 0; i < 4; i++) {
          const newCard = generateRandomCard(gameState.gameSettings)
          gameState.players[nextPlayerIndex].cards.push(newCard)
          gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)
        }

        // Skip the next player's turn
        const nextNextPlayerIndex = getNextPlayerIndex(gameState, nextPlayerIndex)

        // Set the next player's turn
        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextNextPlayerIndex
        })

        gameState.currentPlayerId = gameState.players[nextNextPlayerIndex].id

        io.to(roomCode).emit("game_log", `${gameState.players[nextPlayerIndex].name} draws 4 cards and is skipped`)
      } else {
        // Set the next player's turn
        const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextPlayerIndex
        })

        gameState.currentPlayerId = gameState.players[nextPlayerIndex].id
      }

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", `${player.name} played ${card.value} and chose ${color}`)

      // Notify next player
      const nextPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
      if (nextPlayer) {
        io.to(roomCode).emit("game_log", `${nextPlayer.name}'s turn`)
      }

      // After updating the game state and broadcasting it:
      processBotTurns(gameState, roomCode)
    })

    // Handle drawing a card
    socket.on("draw_card", (roomCode) => {
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the player
      const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)
      if (playerIndex === -1) return

      const player = gameState.players[playerIndex]

      // Check if it's the player's turn
      if (player.id !== gameState.currentPlayerId) return

      // Generate a new card
      const newCard = generateRandomCard(gameState.gameSettings)

      // Add the card to the player's hand
      player.cards.push(newCard)

      // Decrease cards remaining
      gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)

      // Check if the drawn card can be played
      const canPlay =
        !gameState.topCard ||
        newCard.type === "wild" ||
        newCard.type === "special" ||
        gameState.topCard.color === newCard.color ||
        gameState.currentColor === newCard.color ||
        gameState.topCard.value === newCard.value

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", `${player.name} drew a card`)

      // If the card can be played and the setting allows it, ask if they want to play it
      if (canPlay && gameState.gameSettings.playDrawnCard) {
        io.to(socket.id).emit("can_play_drawn_card", { cardId: newCard.id })
      } else if (gameState.gameSettings.drawUntilMatch && !canPlay) {
        // If draw until match is enabled and the card can't be played, ask if they want to draw again
        io.to(socket.id).emit("draw_again")
      } else {
        // Set the next player's turn
        const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

        gameState.players.forEach((p, i) => {
          p.isCurrentTurn = i === nextPlayerIndex
        })

        gameState.currentPlayerId = gameState.players[nextPlayerIndex].id

        // Broadcast the updated game state
        io.to(roomCode).emit("game_state_update", gameState)

        // Notify next player
        const nextPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
        if (nextPlayer) {
          io.to(roomCode).emit("game_log", `${nextPlayer.name}'s turn`)
        }
      }

      // After updating the game state and broadcasting it:
      processBotTurns(gameState, roomCode)
    })

    // Add a new handler for drawing again
    socket.on("draw_again", (roomCode) => {
      // Simply call the draw_card handler again
      socket.emit("draw_card", roomCode)
    })

    // Handle end turn (after drawing a card and not playing it)
    socket.on("end_turn", (roomCode) => {
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the player
      const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)
      if (playerIndex === -1) return

      // Check if it's the player's turn
      if (gameState.players[playerIndex].id !== gameState.currentPlayerId) return

      // Set the next player's turn
      const nextPlayerIndex = getNextPlayerIndex(gameState, playerIndex)

      gameState.players.forEach((p, i) => {
        p.isCurrentTurn = i === nextPlayerIndex
      })

      gameState.currentPlayerId = gameState.players[nextPlayerIndex].id

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)

      // Notify next player
      const nextPlayer = gameState.players.find((p) => p.id === gameState.currentPlayerId)
      if (nextPlayer) {
        io.to(roomCode).emit("game_log", `${nextPlayer.name}'s turn`)
      }

      // After updating the game state and broadcasting it:
      processBotTurns(gameState, roomCode)
    })

    // Handle calling UNO
    socket.on("call_uno", (roomCode) => {
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the player
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player) return

      // Mark that the player has called UNO
      player.calledUno = true

      // Broadcast UNO call
      io.to(roomCode).emit("uno_called", { playerId: player.id, playerName: player.name })
      io.to(roomCode).emit("game_log", `${player.name} called UNO!`)

      // Update game state to reflect the UNO call
      io.to(roomCode).emit("game_state_update", gameState)
    })

    // Handle calling UNO on another player
    socket.on("call_uno_on_player", (data) => {
      const { roomCode, targetPlayerId } = data
      const gameState = activeGames[roomCode]

      if (!gameState || !gameState.gameStarted) return

      // Find the caller and target players
      const caller = gameState.players.find((p) => p.id === socket.id)
      const targetPlayer = gameState.players.find((p) => p.id === targetPlayerId)

      if (!caller || !targetPlayer) return

      // Check if the target player has exactly one card and hasn't called UNO
      if (targetPlayer.cards.length === 1 && !targetPlayer.calledUno) {
        // Penalize the player by making them draw 2 cards
        for (let i = 0; i < 2; i++) {
          const newCard = generateRandomCard(gameState.gameSettings)
          targetPlayer.cards.push(newCard)
          gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)
        }

        // Broadcast the penalty
        io.to(roomCode).emit(
          "game_log",
          `${caller.name} caught ${targetPlayer.name} not saying UNO! ${targetPlayer.name} draws 2 cards.`,
        )
        io.to(roomCode).emit("game_state_update", gameState)
      } else {
        // If the player called UNO incorrectly, they draw a card
        const newCard = generateRandomCard(gameState.gameSettings)
        caller.cards.push(newCard)
        gameState.cardsRemaining = Math.max(0, gameState.cardsRemaining - 1)

        // Broadcast the penalty
        io.to(roomCode).emit("game_log", `${caller.name} called UNO incorrectly and draws a card.`)
        io.to(roomCode).emit("game_state_update", gameState)
      }
    })

    // Handle sending emoji reactions
    socket.on("send_emoji", (data) => {
      const { roomCode, emoji } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Find the player
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player) return

      // Broadcast emoji reaction
      io.to(roomCode).emit("emoji_reaction", { playerId: player.id, emoji })
      io.to(roomCode).emit("game_log", `${player.name} reacted with ${emoji}`)
    })

    // Handle chat messages
    socket.on("send_chat_message", (data) => {
      const { roomCode, message } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Find the player
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player) return

      // Broadcast the chat message to all players in the room
      io.to(roomCode).emit("chat_message", {
        playerId: player.id,
        playerName: player.name,
        message,
        timestamp: new Date().toISOString(),
      })
    })

    // Handle play again request
    socket.on("play_again", (roomCode) => {
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Check if the player is the host
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player || !player.isHost) return

      // Reset the game state but keep the players and scores
      resetGameState(gameState)

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", "New game started")
    })

    // Handle player explicitly leaving a game
    socket.on("player_leave", (data) => {
      const { roomCode, playerId } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Find the player
      const playerIndex = gameState.players.findIndex((p) => p.id === playerId)

      if (playerIndex !== -1) {
        const player = gameState.players[playerIndex]

        // Remove the player from the game
        gameState.players.splice(playerIndex, 1)

        // If the game is empty, remove it
        if (gameState.players.length === 0) {
          delete activeGames[roomCode]
          return
        }

        // If the player was the host, assign a new host
        if (player.isHost && gameState.players.length > 0) {
          gameState.players[0].isHost = true
        }

        // If the game has started and it was the player's turn, move to the next player
        if (gameState.gameStarted && player.id === gameState.currentPlayerId) {
          const nextPlayerIndex = playerIndex % gameState.players.length

          gameState.players.forEach((p, i) => {
            p.isCurrentTurn = i === nextPlayerIndex
          })

          gameState.currentPlayerId = gameState.players[nextPlayerIndex].id
        }

        // Broadcast the updated game state
        io.to(roomCode).emit("game_state_update", gameState)
        io.to(roomCode).emit("game_log", `${player.name} has left the game`)

        // If the game has started and there's only one player left, end the game
        if (gameState.gameStarted && gameState.players.length === 1) {
          const lastPlayer = gameState.players[0]

          // Update scores
          gameState.scores[lastPlayer.name] = (gameState.scores[lastPlayer.name] || 0) + 1

          // Broadcast winner
          io.to(roomCode).emit("game_winner", { playerId: lastPlayer.id, playerName: lastPlayer.name })
          io.to(roomCode).emit("game_log", `${lastPlayer.name} wins the game by default!`)
        }
      }
    })

    // Handle adding a bot
    socket.on("add_bot", (data) => {
      const { roomCode, difficulty } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Check if the player is the host
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player || !player.isHost) return

      // Generate a bot name
      const botNumber = gameState.players.filter((p) => p.isBot).length + 1
      const botName = `Bot ${botNumber}`

      // Create a new bot player
      const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`
      const bot = {
        id: botId,
        name: botName,
        cards: [],
        isCurrentTurn: false,
        isHuman: false,
        isBot: true,
        calledUno: false,
        difficulty: difficulty || "medium",
      }

      // Add the bot to the game
      gameState.players.push(bot)

      // Initialize score for the new bot
      gameState.scores[botName] = 0

      // Broadcast the updated game state
      io.to(roomCode).emit("game_state_update", gameState)
      io.to(roomCode).emit("game_log", `${botName} (${difficulty}) joined the game`)
    })

    // Handle removing a bot
    socket.on("remove_bot", (data) => {
      const { roomCode, botId } = data
      const gameState = activeGames[roomCode]

      if (!gameState) return

      // Check if the player is the host
      const player = gameState.players.find((p) => p.id === socket.id)
      if (!player || !player.isHost) return

      // Find the bot
      const botIndex = gameState.players.findIndex((p) => p.id === botId && p.isBot)

      if (botIndex !== -1) {
        const bot = gameState.players[botIndex]

        // Remove the bot from the game
        gameState.players.splice(botIndex, 1)

        // Broadcast the updated game state
        io.to(roomCode).emit("game_state_update", gameState)
        io.to(roomCode).emit("game_log", `${bot.name} was removed from the game`)
      }
    })

    // Add a new socket event handler for triggering bot turns
    socket.on("trigger_bot_turn", (roomCode) => {
      triggerBotTurn(roomCode)
    })

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`)

      // Find all games the player is in
      Object.entries(activeGames).forEach(([roomCode, gameState]) => {
        const playerIndex = gameState.players.findIndex((p) => p.id === socket.id)

        if (playerIndex !== -1) {
          const player = gameState.players[playerIndex]

          // Remove the player from the game
          gameState.players.splice(playerIndex, 1)

          // If the game is empty, remove it
          if (gameState.players.length === 0) {
            delete activeGames[roomCode]
            return
          }

          // If the player was the host, assign a new host
          if (player.isHost && gameState.players.length > 0) {
            gameState.players[0].isHost = true
          }

          // If the game has started and it was the player's turn, move to the next player
          if (gameState.gameStarted && player.id === gameState.currentPlayerId) {
            const nextPlayerIndex = playerIndex % gameState.players.length

            gameState.players.forEach((p, i) => {
              p.isCurrentTurn = i === nextPlayerIndex
            })

            gameState.currentPlayerId = gameState.players[nextPlayerIndex].id
          }

          // Broadcast the updated game state
          io.to(roomCode).emit("game_state_update", gameState)
          io.to(roomCode).emit("game_log", `${player.name} has left the game`)

          // If the game has started and there's only one player left, end the game
          if (gameState.gameStarted && gameState.players.length === 1) {
            const lastPlayer = gameState.players[0]

            // Update scores
            gameState.scores[lastPlayer.name] = (gameState.scores[lastPlayer.name] || 0) + 1

            // Broadcast winner
            io.to(roomCode).emit("game_winner", { playerId: lastPlayer.id, playerName: lastPlayer.name })
            io.to(roomCode).emit("game_log", `${lastPlayer.name} wins the game by default!`)
          }
        }
      })
    })
  })

  const PORT = process.env.PORT || 3000
  server.listen(PORT, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${PORT}`)
  })
})

