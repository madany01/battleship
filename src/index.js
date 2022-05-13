import PubSub from 'pubsub-js'

import PubSubEvents from './PubSubEvents'

import createGameModeView from './views/createGameModeView'
import createShipPlacementView from './views/createShipPlacementView'

import { createPlayer } from './game-modules/player'
import { createBot } from './game-modules/bot'
import createGameLoop from './createGameLoop'

const resetBtn = document.querySelector('.reset-game-btn')
const restartBtn = document.querySelector('.restart-game-btn')
const roundNumberCtr = document.querySelector('.round-number-ctr')
const roundNumberValueEl = document.querySelector('.round-number')
const mainEl = document.querySelector('#main-content')

const GAME_OPTS = [
	{ gridDimensions: [10, 10], shipsLengths: [1, 1, 1, 1, 2, 2, 2, 4, 4, 5] },
	{ gridDimensions: [8, 8], shipsLengths: [1, 1, 2, 2, 4, 5] },
	{ gridDimensions: [6, 6], shipsLengths: [1, 1, 2, 4] },
]

const playerFactories = Object.freeze({
	single: [createPlayer, createBot],
	multi: [createPlayer, createPlayer],
	bots: [createBot, createBot],
})

let roundNumber = 1
let gameMode = null
let players = null
let playerWhoPlaceShipsNow = null
let gameLoop = null
let gameOpts = null

function handleGameModeDone({ gameMode: gameModeArg, playerNames, opts }) {
	gameMode = gameModeArg
	gameOpts = opts

	const factories = playerFactories[gameMode]

	players = playerNames
		.map((name, idx) => [name, idx, factories[idx]])
		.map(([name, idx, factory]) => factory({
			name,
			isActive: idx === 0,
			shipsLengths: gameOpts.shipsLengths,
			gridDimensions: gameOpts.gridDimensions,
		}))

	players[0].setOpponent(players[1])
	players[1].setOpponent(players[0])

	resetBtn.classList.remove('hidden')

	if (gameMode === 'bots') {
		handleShipPlacementDone()
		return
	}

	[playerWhoPlaceShipsNow] = players
	createShipPlacementView(players[0]).render(mainEl)
}

function handleShipPlacementDone() {
	if (gameMode === 'multi' && playerWhoPlaceShipsNow !== players[1]) {
		[, playerWhoPlaceShipsNow] = players
		createShipPlacementView(players[1]).render(mainEl)
		return
	}

	roundNumberCtr.classList.remove('hidden')
	roundNumberValueEl.textContent = roundNumber++

	restartBtn.classList.remove('hidden')

	gameLoop = createGameLoop(players, mainEl)
}

function handleGameOver() {
	restartBtn.classList.add('hidden')
}

function handleGameLoopDone() {
	restartBtn.classList.add('hidden')
	roundNumberValueEl.textContent = roundNumber

	players.forEach(player => {
		player.prepareToNextRound()
		player.toggleActive()
	})

	if (gameMode === 'bots') {
		handleShipPlacementDone()
		return
	}

	[playerWhoPlaceShipsNow] = players
	createShipPlacementView(players[0]).render(mainEl)
}

function resetGame() {
	if (gameLoop) gameLoop.disconnect()

	roundNumber = 1
	gameMode = null
	players = null
	playerWhoPlaceShipsNow = null
	gameLoop = null

	roundNumberCtr.classList.add('hidden')
	restartBtn.classList.add('hidden')
	resetBtn.classList.add('hidden')
	createGameModeView(GAME_OPTS).render(mainEl)
}

function restartGame() {
	if (gameLoop) gameLoop.disconnect()
	mainEl.replaceChildren()
	players.forEach(player => player.prepareToNextRound())
	gameLoop = createGameLoop(players, mainEl)
}

function bindEvents() {
	resetBtn.addEventListener('click', () => resetGame())
	restartBtn.addEventListener('click', () => restartGame())

	PubSub.subscribe(PubSubEvents.gameMode.done, (_, data) => handleGameModeDone(data))

	PubSub.subscribe(PubSubEvents.shipPlacement.done, (_, data) => handleShipPlacementDone(data))

	PubSub.subscribe(PubSubEvents.gameLoop.gameOver, handleGameOver)
	PubSub.subscribe(PubSubEvents.gameLoop.againButtonClick, (_, data) => handleGameLoopDone(data))
}

((function init() {
	bindEvents()
	createGameModeView(GAME_OPTS).render(mainEl)
}
)())
