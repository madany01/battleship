import PubSub from 'pubsub-js'

import PubSubEvents from './PubSubEvents'
import createGameLoopView from './views/createGameLoopView'
import { SHOT_TYPE } from './game-modules/game-board/shotType'

async function delay(ms) {
	await new Promise(resolve => {
		setTimeout(resolve, ms)
	})
}

function createGameLoop(players, mainEl) {
	const view = createGameLoopView(players)
	let connected = true
	let curPlayerIdx = players[0].isActive ? 0 : 1
	let targetedPlayerIdx = curPlayerIdx === 0 ? 1 : 0

	function togglePlayerTurns() {
		[curPlayerIdx, targetedPlayerIdx] = [targetedPlayerIdx, curPlayerIdx]
	}

	function getPlayerState(playerIdx) {
		const player = players[playerIdx]

		return {
			playerIdx,
			missedAttacks: player.board.getMissedAttacks(),
			redundantAdjacent: player.board.getRedundantAdjacent(),
			shipsStatus: player.board.getShipsStatus(),
			lastAttack: player.board.getLastAttack(),
		}
	}

	async function makeMove(_, { coords: attackedCoords = null } = {}) {
		while (true) {
			const curPlayer = players[curPlayerIdx]

			const shotType = curPlayer.isBot ? curPlayer.attackOpponent() : curPlayer.attackOpponent(attackedCoords)

			if (curPlayer.isWinning()) {
				gameOver()
				break
			}

			view.update(getPlayerState(targetedPlayerIdx))

			if (curPlayer.isBot) {
				// eslint-disable-next-line no-await-in-loop
				await delay(400 + (shotType !== SHOT_TYPE.MISS ? 200 : 0))
				if (!connected) return
			}

			if (shotType !== SHOT_TYPE.MISS) {
				if (curPlayer.isBot) continue
				else break
			}

			const opponent = players[targetedPlayerIdx]

			togglePlayerTurns()
			view.toggleTargetedPlayer()

			if (!opponent.isBot) break
		}
	}

	function gameOver() {
		const curPlayer = players[curPlayerIdx]

		curPlayer.increaseScore()

		players.forEach((_, idx) => {
			view.update(getPlayerState(idx), true)
		})

		view.finalize(curPlayerIdx)

		PubSub.publish(PubSubEvents.gameLoop.gameOver, { winner: curPlayer })
		unbindEvents()
	}

	function bindEvents() {
		PubSub.subscribe(PubSubEvents.gameLoop.cellClick, makeMove)
	}

	function unbindEvents() {
		connected = false
		PubSub.unsubscribe(PubSubEvents.gameLoop.cellClick, makeMove)
	}

	((async function init() {
		view.render(mainEl)
		bindEvents()

		if (!players[curPlayerIdx].isBot) return

		await delay(400)

		if (!connected) {
			return
		}

		makeMove()
	}
	)())

	return {
		disconnect: unbindEvents,
	}
}

export default createGameLoop
