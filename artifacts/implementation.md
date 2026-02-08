### Description

A web-based multiplayer guessing game where players predict whether the next number will be higher or lower than the current number. Numbers are provided by the host (from their own source or set manually) and announced out loud in a live group setting.

### Game Setup

**Starting a Game:** Players visit the site and choose between two options: **Start New Game as Host** or **Join Game as Player**.

- **Host:** Selecting "Start New Game as Host" creates a new game session and generates a unique 6-digit code that others can use to join. The host only manages the game and does not play as a participant.
- **Players:** Selecting "Join Game as Player" allows players to enter the 6-digit code to join an existing game. If players enter a code that does not exist, they are told that code does not exist and prompted to enter a new one. Players cannot join a game without a valid code.

All participants set their display names. Once everyone has joined, the host starts the game. Joining is locked once the game begins.

**Optional Timer:** The host has the option to set a 30-second timer at the start of each round. When enabled, the timer starts when the host opens guessing and serves as a visual reference only. Players can see the countdown timer on their screen.

**Staying Connected:** If a player refreshes the page on the same device/browser, they will auto-reconnect using their stored session and continue playing from where they left off.

**Host Disconnection:** If the host disconnects or refreshes, they can rejoin on the same device and continue managing the game.

**Network Issues:** Brief network disconnections are handled by giving players a chance to reconnect and keep playing based on whether they were in or eliminated. Reconnecting restores their prior status. If a player doesn't reconnect before the host selects the next correct answer, they will be eliminated.

### Gameplay

**Leaderboard:** Both the host and players can view a live leaderboard showing each player's status (in/out) and the number of rounds guessed correctly.

**Round Counter:** A visible round counter is displayed to both the host and all players throughout the game.

**Round Flow:**

1. The host announces the current number out loud to the group (from their own source or a number they set)
2. The host opens guessing and prompts everyone to guess whether the next number will be "higher" or "lower". Players cannot change their guess once submitted
3. The host can see who has submitted their guess and who is still pending
4. The host announces the next number out loud (from their own source or a number they set), then selects "higher" or "lower" on their device to confirm the correct answer
5. Players see an animation indicating whether they guessed correctly or incorrectly
6. Correct guesses: Players remain in the game
7. Incorrect guesses: Players are eliminated
8. No guess submitted: If a player hasn't selected higher or lower before the host selects the answer, they will be eliminated

### Winning Conditions

The game continues until one player remains as the winner. If a round ends with all remaining players eliminated, both players and the host receive a message that the eliminated players are being revived to keep playing. Revived players return to the "in" state for the next round and play continues until a single winner emerges.

### Eliminated Players

Eliminated players can continue playing for fun. They remain marked as "out" on the leaderboard and cannot win, but their correct guess count continues to update so they can play along.

### Ending the Game

The host can end the game at any time, which releases the 6-digit code for future reuse. If the host disconnects and does not return within 30 minutes, the game will automatically end.

### Game Requirements

Minimum players: 1 host and 1 player
