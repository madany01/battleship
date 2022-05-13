import rectUtils from '../../rectUtils'
import arrUtils from '../../arrUtils'

function restrictBoardToFixedShipsLengths(board, shipsLengths) {
	const allowedLengths = new Set(shipsLengths)
	const placedLengths = new Map([...allowedLengths].map(len => [len, 0]))
	const availableLengths = arrUtils.freqMap(shipsLengths)

	function lengthAllowed(len) {
		return allowedLengths.has(len)
	}

	function lengthAvailable(len) {
		return availableLengths.has(len) && availableLengths.get(len) > 0
	}

	function shipPlaced(len) {
		return placedLengths.get(len) > 0
	}

	function placeLength(len) {
		placedLengths.set(len, placedLengths.get(len) + 1)
		availableLengths.set(len, availableLengths.get(len) - 1)
	}

	function unplaceLength(len) {
		placedLengths.set(len, placedLengths.get(len) - 1)
		availableLengths.set(len, availableLengths.get(len) + 1)
	}

	function getAvailableShipsLengths() {
		return arrUtils.freqMapToArr(availableLengths)
	}

	function placeShip(rect) {
		const len = rectUtils.maxDimension(rect)

		if (!lengthAllowed(len)) {
			// eslint-disable-next-line max-len
			throw new Error(`can't placeShip ${rect}, it length ${len} is not allowed to be placed/unplaced`)
		}

		if (!lengthAvailable(len)) {
			// eslint-disable-next-line max-len
			throw new Error(`no available length to place ship ${rect}, available lengths: ${getAvailableShipsLengths()}`)
		}

		board.placeShip(rect)
		placeLength(len)
	}

	function unplaceShip(rect) {
		const len = rectUtils.maxDimension(rect)

		if (!lengthAllowed(len)) {
			// eslint-disable-next-line max-len
			throw new Error(`can't unplaceShip ${rect}, it length ${len} is not allowed to be placed/unplaced`)
		}

		if (!shipPlaced(len)) {
			throw new Error(`can't unplaceShip ${rect}, no ship of length ${len} placed`)
		}

		board.unplaceShip(rect)
		unplaceLength(len)
	}

	function unplaceAllShips() {
		board.unplaceAllShips()
		arrUtils.freqMapToArr(placedLengths).forEach(len => unplaceLength(len))
	}

	function canPlaceShip(rect) {
		const len = rectUtils.maxDimension(rect)

		return lengthAvailable(len) && board.canPlaceShip(rect)
	}

	return {
		...board,
		canPlaceShip,
		placeShip,
		unplaceShip,
		unplaceAllShips,
		getAvailableShipsLengths,
	}
}

export default restrictBoardToFixedShipsLengths
