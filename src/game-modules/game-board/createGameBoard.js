import { createShip } from '../ship'
import { SHOT_TYPE } from './shotType'
import { translateShipAtCoordsToIdx, translateShipAtIdxToCoords, getShipDirection } from './utils'
import coordsUtils from '../coordsUtils'
import rectUtils from '../rectUtils'

function createGameBoard([numRows, numCols]) {
	if (Math.min(numRows, numCols) <= 0) {
		throw new Error(`board dimensions must be >= 1, given [${numRows}, ${numCols}]`)
	}

	const dimensions = [numRows, numCols]

	const ships = [] // {...ship, direction (0/1), rect, boundingRect}

	let lastAttack = null
	const missedAttacks = new Set()
	const hitDiagonalAdj = new Set()

	let numSunkShips = 0

	function missedAttacksContains(shotCoords) {
		return missedAttacks.has(coordsUtils.toString(shotCoords))
	}

	function addMissedAttack(shotCoords) {
		missedAttacks.add(coordsUtils.toString(shotCoords))
	}

	function hitDiagonalAdjContains(shotCoords) {
		return hitDiagonalAdj.has(coordsUtils.toString(shotCoords))
	}

	function addToHitDiagonalAdj(...coords) {
		coords.forEach(c => hitDiagonalAdj.add(coordsUtils.toString(c)))
	}

	function shipCauseOverlap(newShipRect) {
		return ships.some(({ boundingRect }) => rectUtils.overlap(newShipRect, boundingRect))
	}

	function validateShipPlacement(rect) {
		if (coordsUtils.compare(rect[0], rect[1]) === +1) {
			throw new Error(`malformed rectangle ${rect}`)
		}

		rect.forEach(coords => {
			if (coordsUtils.withinGrid(coords, dimensions)) return
			throw new Error(`invalid ship rect [${rect}], ship coords must be inside the grid [${dimensions}]`)
		})

		if (!coordsUtils.onSameAxis(rect)) {
			throw new Error(`invalid ship coords [${rect}], ships must be place horizontally or vertically`)
		}

		if (shipCauseOverlap(rect)) {
			throw new Error('invalid ship position, ships must not overlap with each other')
		}
	}

	function validateAttackPosition(shotCoords) {
		if (!coordsUtils.withinGrid(shotCoords, dimensions)) {
			throw new Error(`invalid shot coords [${shotCoords}], shots must be inside grid: [${dimensions}]`)
		}

		if (missedAttacksContains(shotCoords)) throw new Error(`shot coords [${shotCoords}] was attacked previously`)

		if (hitDiagonalAdjContains(shotCoords)) {
			throw new Error(`shot coords [${shotCoords}] exists at adjacent diagonal to hit attack`)
		}

		const shipIdx = ships.findIndex(({ rect }) => rectUtils.contains(rect, shotCoords))

		if (shipIdx === -1) return

		const ship = ships[shipIdx]

		if (ship.wasHit(translateShipAtCoordsToIdx(ship, shotCoords))) {
			throw new Error(`ship was already hit at ${shotCoords}`)
		}
	}

	// exposed

	function canPlaceShip(rect) {
		if (lastAttack !== null) return false
		try {
			validateShipPlacement(rect)
			return true
		} catch (error) {
			return false
		}
	}

	function placeShip(rect) {
		if (lastAttack !== null) throw new Error("can't place/remove any ship after the first attack")

		validateShipPlacement(rect)

		const shipLength = rectUtils.maxDimension(rect)

		ships.push({
			...createShip(shipLength), // getLength, hit, wasHit, getHitPositions, isSunk
			rect,
			direction: getShipDirection(rect),
			boundingRect: rectUtils.boundingRect(rect),
		})
	}

	function unplaceShip(rect) {
		if (lastAttack !== null) throw new Error("can't place/remove any ship after the first attack")

		const shipIdx = ships.findIndex((
			({ rect: existsRect }) => rectUtils.compareByCoords(existsRect, rect) === 0
		))

		if (shipIdx === -1) throw new Error(`unable to find ship: [${rect}]`)

		ships.splice(shipIdx, 1)
	}

	function unplaceAllShips() {
		if (lastAttack !== null) throw new Error("can't place/remove any ship after the first attack")
		ships.splice(0)
	}

	function receiveAttack(shotCoords) {
		validateAttackPosition(shotCoords)

		lastAttack = shotCoords

		const shipIdx = ships.findIndex(({ rect }) => rectUtils.contains(rect, shotCoords))

		if (shipIdx === -1) {
			addMissedAttack(coordsUtils.clone(shotCoords))

			return SHOT_TYPE.MISS
		}

		addToHitDiagonalAdj(...coordsUtils.getDiagonalAdjacentWithinGrid(shotCoords, dimensions))

		const ship = ships[shipIdx]
		const shotIdx = translateShipAtCoordsToIdx(ship, shotCoords)

		ship.hit(shotIdx)

		if (!ship.isSunk()) return SHOT_TYPE.HIT

		numSunkShips++

		addToHitDiagonalAdj(...rectUtils.getAdjacentCoordsWithGrid(ship.rect, dimensions))

		return SHOT_TYPE.SUNK_HIT
	}

	function getGridDimensions() {
		return [...dimensions]
	}

	function isFleetSunk() {
		return numSunkShips === ships.length
	}

	function getMissedAttacks() {
		return [...missedAttacks].map(coords => coordsUtils.fromString(coords))
	}

	function getShipsStatus() {
		return ships.map(ship => {
			const { rect } = ship

			const isSunk = ship.isSunk()
			const hits = ship.getHitPositions().map(posIdx => translateShipAtIdxToCoords(ship, posIdx))

			return {
				isSunk,
				hits,
				coords: rectUtils.clone(rect),
			}
		})
	}

	function getShipsCoords() {
		return ships.map(({ rect }) => rectUtils.clone(rect))
	}

	function getLastAttack() {
		return lastAttack !== null ? coordsUtils.clone(lastAttack) : null
	}

	function isAttackValid(shotCoords) {
		try {
			validateAttackPosition(shotCoords)
			return true
		} catch (e) {
			return false
		}
	}

	function getRedundantAdjacent() {
		return [...hitDiagonalAdj]
			.map(coordsStr => coordsUtils.fromString(coordsStr))
			.filter(coords => !missedAttacksContains(coords))
	}

	return {
		getGridDimensions,

		canPlaceShip,
		placeShip,
		unplaceShip,
		unplaceAllShips,

		getShipsCoords,
		getShipsStatus,

		receiveAttack,
		isAttackValid,
		getLastAttack,
		getMissedAttacks,
		getRedundantAdjacent,

		isFleetSunk,
	}
}

export default createGameBoard
