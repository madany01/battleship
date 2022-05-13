import coordsUtils from '../../coordsUtils'
import { createGameBoard } from '../../game-board'
import rectUtils from '../../rectUtils'
import createBoardAttacker from '.'

function mockFunction(fn) {
	return jest.fn(`mock${fn.name}`).mockImplementation(fn)
}

function getTestBoard() {
	const gridDimensions = [10, 10]

	const board = createGameBoard(gridDimensions)
	const shipsCoords = [
		[[0, 0], [0, 3]],
		[[0, 5], [0, 7]],
		[[0, 9], [3, 9]],

		[[2, 0], [2, 2]],
		[[2, 4], [2, 6]],

		[[4, 0], [6, 0]],
		[[4, 2], [4, 2]],
		[[4, 4], [7, 4]],
		[[4, 7], [4, 7]],

		[[5, 9], [5, 9]],

		[[6, 6], [6, 7]],

		[[7, 9], [9, 9]],

		[[8, 0], [9, 0]],

		[[9, 4], [9, 4]],
		[[9, 6], [9, 7]],
	]

	shipsCoords.forEach(coords => board.placeShip(coords))

	return {
		gridDimensions,
		board,
		shipsCoords,
	}
}

function getShipsAttackRange(shipsCoords, attacks) {
	return attacks
		.map(attack => shipsCoords.findIndex(shipCoords => rectUtils.contains(shipCoords, attack)))
		.reduce((acc, shipIdx, attackIdx) => {
			if (shipIdx === -1) return acc

			const shipAttackRange = acc[shipIdx]

			shipAttackRange[0] = Math.min(shipAttackRange[0], attackIdx)
			shipAttackRange[1] = Math.max(shipAttackRange[1], attackIdx)

			return acc
		}, new Array(shipsCoords.length).fill(null).map(() => [Infinity, -Infinity]))
}

/**
 * attack order:
 * 1. first attack on some ship side
 * 2. missed attacks on ship adjacent cells (up to three)
 * 3. hit attacks
 * hit attacks count == ship length
 * @param {Array} shipCoords
 * @param {Array} attacks
 * @returns {Boolean}
 */
function attackOnShipSideValid(shipCoords, attacks) {
	if (attacks.length === 0) return false

	const [firstAttack] = attacks

	if (!shipCoords.find(shipSideCoord => coordsUtils.equal([shipSideCoord, firstAttack]))) return false

	const firstAttackMissAdjacent = coordsUtils
		.get4Adjacent(firstAttack)
		.filter(coords => !rectUtils.contains(shipCoords, coords))
		.map(coords => coordsUtils.toString(coords))

	const attackCanonicalForm = attacks.map((coords, idx) => {
		if (idx === 0) return 0

		if (firstAttackMissAdjacent.includes(coordsUtils.toString(coords))) return 1

		if (rectUtils.contains(shipCoords, coords)) return 2

		return null
	})

	if (attackCanonicalForm.includes(null)) return false

	const attackLength = attackCanonicalForm.filter(num => num === 0 || num === 2).length

	const missedLength = attackCanonicalForm.filter(num => num === 1).length

	const attackOrderCorrect = attackCanonicalForm.every(((num, idx) => (
		idx === 0 || num >= attackCanonicalForm[idx - 1]
	)))

	const shipLength = Math.max(shipCoords[1][0] - shipCoords[0][0], shipCoords[1][1] - shipCoords[0][1]) + 1

	return attackLength === shipLength && missedLength <= 3 && attackOrderCorrect
}

function attackInBetweenShipValid(shipCoords, attacks) {
	if (attacks.length === 0) return false

	const [firstAttack] = attacks

	if (
		!rectUtils.contains(shipCoords, firstAttack)
		|| shipCoords.some(shipSide => coordsUtils.equal([shipSide, firstAttack]))
	) return false

	const firstAttackMissAdjacent = coordsUtils
		.get4Adjacent(firstAttack)
		.filter(coords => !rectUtils.contains(shipCoords, coords))
		.map(coords => coordsUtils.toString(coords))

	const attackCanonicalForm = attacks.map((coords, idx) => {
		if (idx === 0) return 0

		if (firstAttackMissAdjacent.includes(coordsUtils.toString(coords))) return 1

		const inShip = rectUtils.contains(shipCoords, coords)

		if (inShip) return 2

		const prevCoords = attacks[idx - 1]

		if (
			!inShip
			&& coordsUtils.onSameAxis([coords, prevCoords, firstAttack])
			&& coordsUtils.areAdjacent4(coords, prevCoords)
			&& shipCoords.some(sideShipCoords => coordsUtils.equal([prevCoords, sideShipCoords]))
		) return 3

		return null
	})

	if (attackCanonicalForm.includes(null)) return false

	if (attackCanonicalForm.filter(num => num === 3).length > 1) return false

	const sideMissingAttackIdx = attackCanonicalForm.findIndex(num => num === 3)

	if (sideMissingAttackIdx !== -1) {
		if (sideMissingAttackIdx === 0 || sideMissingAttackIdx === attackCanonicalForm.length - 1) return false
		attackCanonicalForm.splice(sideMissingAttackIdx, 1)
	}

	const attackLength = attackCanonicalForm.filter(num => num === 0 || num === 2).length

	const missedLength = attackCanonicalForm.filter(num => num === 1).length

	const attackOrderCorrect = attackCanonicalForm.every(((num, idx) => (
		idx === 0 || num >= attackCanonicalForm[idx - 1]
	)))

	const shipLength = Math.max(shipCoords[1][0] - shipCoords[0][0], shipCoords[1][1] - shipCoords[0][1]) + 1

	return attackLength === shipLength && missedLength <= 2 && attackOrderCorrect
}

describe('createBoardAttacker', () => {
	it("doesn't attack the same position twice (board without ships)", () => {
		const gridDimensions = [10, 10]
		const board = createGameBoard(gridDimensions)
		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		const numCells = gridDimensions[0] * gridDimensions[1]

		for (let i = 0; i < numCells; i++) attackBoard()

		const receiveAttackMock = board.receiveAttack

		const calledCoords = receiveAttackMock.mock.calls
			.map(call => call[0])
			.reduce((set, coords) => {
				set.add(coordsUtils.toString(coords))
				return set
			}, new Set())

		expect(calledCoords.size).toBe(receiveAttackMock.mock.calls.length)
	})

	it("doesn't attack the same position twice (board with ships)", () => {
		const { gridDimensions, board } = getTestBoard()
		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		const numCells = gridDimensions[0] * gridDimensions[1]

		for (let i = 0; i < numCells && !board.isFleetSunk(); i++) attackBoard()

		const receiveAttackMock = board.receiveAttack

		const calledCoords = receiveAttackMock.mock.calls
			.map(call => call[0])
			.reduce((set, coords) => {
				set.add(coordsUtils.toString(coords))
				return set
			}, new Set())

		expect(calledCoords.size).toBe(receiveAttackMock.mock.calls.length)
	})

	it('attacks all coords in grid if no ship was found', () => {
		const gridDimensions = [10, 10]
		const board = createGameBoard(gridDimensions)
		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		const numCells = gridDimensions[0] * gridDimensions[1]

		for (let i = 0; i < numCells; i++) attackBoard()

		expect(board.receiveAttack.mock.calls.length).toBe(numCells)
	})

	it('attacks all ships eventually', () => {
		const { gridDimensions, board } = getTestBoard()

		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		for (let i = 0; i < gridDimensions[0] * gridDimensions[1] && !board.isFleetSunk(); i++) attackBoard()

		expect(board.isFleetSunk()).toBe(true)
	})

	test("between any ship's first attack and last attack: only hit or miss attack on the same ship", () => {
		const { gridDimensions, board, shipsCoords } = getTestBoard()

		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		for (let i = 0; i < gridDimensions[0] * gridDimensions[1] && !board.isFleetSunk(); i++) attackBoard()

		const attacks = board.receiveAttack.mock.calls.map(call => call[0])

		const shipsAttackRange = getShipsAttackRange(shipsCoords, attacks)

		expect(
			shipsAttackRange
				.slice()
				.sort(([attackStartIdxA], [attackStartIdxB]) => attackStartIdxA - attackStartIdxB)
				.every(([attackStartIdx], idx, ranges) => idx === 0 || attackStartIdx > ranges[idx - 1][1]),
		).toBe(true)
	})

	test('attacks are valid *', () => {
		/**
		the attacks received at board.receiveAttack function can be grouped into ranges depending on the ship
			that the received attack belongs to or -1 if it is miss attack.

		for each ship, the attacks on the ship from the first hit until the last hit make the range (start, end).
		start/end are indexes of the attacks received at the board.receiveAttack function.

		the attacks ranges must follow specific form.

		if the first hit was on one of the ship end, the attacks on the attack range must be:
			1. first hit
			2. up to 3 valid miss attacks on the adjacent of the first hit
			3. 0 or more hits (until the ship is sunk)

		otherwise if it is in-between ship ends:
			1. first hit
			2. up to 2 valid miss attacks on the adjacent of the first hit
			3. hits
			4. zero or one valid miss attack on the adjacent of the last hit from step.3 if it is valid
			5. hits (until the ship is sunk)

		* invalid attacks are attacks beyond grid, or duplicate attacks

		*/
		const { gridDimensions, board, shipsCoords } = getTestBoard()

		board.receiveAttack = mockFunction(board.receiveAttack)

		const attackBoard = createBoardAttacker(board)

		for (let i = 0; i < gridDimensions[0] * gridDimensions[1] && !board.isFleetSunk(); i++) attackBoard()

		const attacks = board.receiveAttack.mock.calls.map(call => call[0])

		const shipsAttackRange = getShipsAttackRange(shipsCoords, attacks)

		expect(shipsAttackRange.every(([attackStartIdx, attackEndIdx], shipIdx) => (
			attackInBetweenShipValid(shipsCoords[shipIdx], attacks.slice(attackStartIdx, attackEndIdx + 1))
			|| attackOnShipSideValid(shipsCoords[shipIdx], attacks.slice(attackStartIdx, attackEndIdx + 1))
		))).toBe(true)
	})

	it("doesn't attack at the ship adjacent coords after last hit on that ship", () => {
		const { gridDimensions, board, shipsCoords } = getTestBoard()

		const attackBoard = createBoardAttacker(board)

		board.receiveAttack = mockFunction(board.receiveAttack)

		for (let i = 0; i < gridDimensions[0] * gridDimensions[1] && !board.isFleetSunk(); i++) attackBoard()

		const attacks = board.receiveAttack.mock.calls.map(call => call[0])

		const attackCoordsToIdx = attacks.reduce((acc, coords, idx) => {
			acc.set(coordsUtils.toString(coords), idx)
			return acc
		}, new Map())

		const shipsAttackRange = getShipsAttackRange(shipsCoords, attacks)

		const noHitAtAdjacent = shipsCoords.every((shipCoords, shipIdx) => {
			const [, shipLastAttackIdx] = shipsAttackRange[shipIdx]
			const adjacentCoords = rectUtils.getAdjacentCoords(shipCoords).map(coords => coordsUtils.toString(coords))

			return adjacentCoords.every(coordsStr => (
				!attackCoordsToIdx.has(coordsStr) || attackCoordsToIdx.get(coordsStr) <= shipLastAttackIdx
			))
		})

		expect(noHitAtAdjacent).toBe(true)
	})
})
