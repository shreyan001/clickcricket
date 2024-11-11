-- Initialize game state
Games = Games or {}

-- Helper function to create a new game state
function createNewGame(playerId)
  return {
    playerId = playerId,
    score = 0,
    wickets = 0,
    balls = 0,
    isOver = false,
    lastMove = nil
  }
end

-- Handle game initialization
Handlers.add(
  "initialize",
  Handlers.utils.hasMatchingTag("Action", "Initialize"),
  function (msg)
    local gameId = msg.Tags.GameId
    Games[gameId] = createNewGame(msg.From)
    Handlers.utils.reply("Game initialized")(msg)
  end
)

-- Handle player moves
Handlers.add(
  "play_move",
  Handlers.utils.hasMatchingTag("Action", "PlayMove"),
  function (msg)
    local gameId = msg.Tags.GameId
    local game = Games[gameId]
    
    if not game then
      return Handlers.utils.reply("Game not found")(msg)
    end
    
    if game.isOver then
      return Handlers.utils.reply("Game is already over")(msg)
    end
    
    -- Get player choice from tags
    local playerChoice = tonumber(msg.Tags.PlayerChoice)
    if not playerChoice or playerChoice < 1 or playerChoice > 6 then
      return Handlers.utils.reply("Invalid move")(msg)
    end
    
    -- Generate AI choice (1-6)
    local aiChoice = math.random(6)
    
    -- Update game state
    game.balls = game.balls + 1
    game.lastMove = {
      player = playerChoice,
      ai = aiChoice
    }
    
    -- Check if player is out
    if playerChoice == aiChoice then
      game.wickets = game.wickets + 1
      if game.wickets >= 10 then
        game.isOver = true
      end
      return Handlers.utils.reply(json.encode({
        message = "Out! AI bowled " .. aiChoice,
        gameState = game
      }))(msg)
    end
    
    -- Add runs to score
    game.score = game.score + playerChoice
    
    -- Prepare response
    local response = {
      message = "You scored " .. playerChoice .. " runs! AI bowled " .. aiChoice,
      gameState = game
    }
    
    Handlers.utils.reply(json.encode(response))(msg)
  end
)

-- Handle game stats request
Handlers.add(
  "get_stats",
  Handlers.utils.hasMatchingTag("Action", "GetStats"),
  function (msg)
    local playerStats = {
      gamesPlayed = 0,
      totalScore = 0,
      highScore = 0
    }
    
    -- Calculate stats for the player
    for _, game in pairs(Games) do
      if game.playerId == msg.From and game.isOver then
        playerStats.gamesPlayed = playerStats.gamesPlayed + 1
        playerStats.totalScore = playerStats.totalScore + game.score
        playerStats.highScore = math.max(playerStats.highScore, game.score)
      end
    end
    
    Handlers.utils.reply(json.encode(playerStats))(msg)
  end
) 