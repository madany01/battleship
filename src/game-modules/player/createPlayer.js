import {
	placeShipsRandomly,
	restrictBoardToFixedShipsLengths,
} from '../boardPlugins'
import { createGameBoard } from '../game-board'

function composeGameBoard(gridDimensions, shipsLengths) {
	return restrictBoardToFixedShipsLengths(createGameBoard(gridDimensions), shipsLengths)
}

function createPlayer({
	name,
	isActive: isActiveArg,
	shipsLengths,
	gridDimensions,
}) {
	let board = composeGameBoard(gridDimensions, shipsLengths)

	let score = 0
	let isActive = isActiveArg
	let opponent = null

	function toggleActive() {
		isActive = !isActive
	}

	function isWinning() {
		return opponent.board.isFleetSunk()
	}

	function increaseScore() {
		score++
	}

	function setOpponent(opponent_) {
		opponent = opponent_
	}

	function prepareToNextRound(preserveShipsPlacement = true) {
		if (!preserveShipsPlacement) {
			board = composeGameBoard(gridDimensions, shipsLengths)
			return
		}

		const shipsCoords = board.getShipsCoords()
		board = composeGameBoard(gridDimensions, shipsLengths)
		shipsCoords.forEach(rect => board.placeShip(rect))
	}

	function playerPlaceShipsRandomly() {
		return placeShipsRandomly(board.getAvailableShipsLengths(), board)
	}

	function attackOpponent(coords) {
		return opponent.board.receiveAttack(coords)
	}

	function geGridDimensions() {
		return [...gridDimensions]
	}

	function getShipLengths() {
		return shipsLengths.slice()
	}

	return {
		toggleActive,
		isWinning,
		get score() { return score },
		get name() { return name },
		get board() { return board },
		get shipsLengths() { return getShipLengths() },
		get gridDimensions() { return geGridDimensions() },
		get isActive() { return isActive },
		get opponent() { return opponent },
		increaseScore,
		setOpponent,
		prepareToNextRound,
		placeShipsRandomly: playerPlaceShipsRandomly,
		attackOpponent,
	}
}

export default createPlayer
