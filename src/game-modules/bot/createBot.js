import { createPlayer } from '../player'
import createBoardAttacker from '../boardPlugins/createBoardAttacker'

function createBot(...args) {
	// place ships immediately
	// on prepare re-place them, update attacker
	const player = createPlayer(...args)
	let attackOpponentFn = null

	player.placeShipsRandomly()

	function prepareToNextRound() {
		attackOpponentFn = null
		player.prepareToNextRound(false)
		player.placeShipsRandomly()
	}

	function attackOpponent() {
		if (attackOpponentFn === null) {
			attackOpponentFn = createBoardAttacker(player.opponent.board)
		}

		return attackOpponentFn()
	}

	return Object.assign(Object.create(player), {
		attackOpponent,
		prepareToNextRound,
		isBot: true,
	})
}

export default createBot
