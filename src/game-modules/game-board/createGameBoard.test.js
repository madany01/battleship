import { createGameBoard, SHOT_TYPE } from '.'
import coordsUtils from '../coordsUtils'
import rectUtils from '../rectUtils'
import arrUtils from '../arrUtils'
import randoms from '../randoms'

function getOverlappingPlacements(shipRect, gridDimensions) {
	const boundingRect = {
		i1: shipRect[0][0] - 1,
		j1: shipRect[0][1] - 1,
		i2: shipRect[1][0] + 1,
		j2: shipRect[1][1] + 1,
	}

	const [nRows, nCols] = gridDimensions

	const invalidRowPlacements = []

	for (let i = boundingRect.i1; i <= boundingRect.i2; i++) {
		for (let j1 = 0; j1 <= boundingRect.j2; j1++) {
			for (let j2 = Math.max(j1, boundingRect.j1); j2 < nCols; j2++) {
				invalidRowPlacements.push([[i, j1], [i, j2]])
			}
		}
	}

	const invalidColsPlacements = []

	for (let j = boundingRect.j1; j <= boundingRect.j2; j++) {
		for (let i1 = 0; i1 <= boundingRect.i2; i1++) {
			for (let i2 = Math.max(i1, boundingRect.i1); i2 < nRows; i2++) {
				invalidColsPlacements.push([[i1, j], [i2, j]])
			}
		}
	}

	return [...invalidRowPlacements, ...invalidColsPlacements]
}

function getTestBoard({ placeShips = true } = {}) {
	const gridDimensions = [10, 10]

	const board = createGameBoard(gridDimensions)
	const shipsRect = [
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

	if (placeShips) shipsRect.forEach(coords => board.placeShip(coords))

	return {
		gridDimensions,
		board,
		shipsRect,
	}
}

describe('createGameBoard', () => {
	it('throws when grid dimensions are not >= 1', () => {
		expect(() => createGameBoard([0, 0])).toThrow()
		expect(() => createGameBoard([-1, 0])).toThrow()
		expect(() => createGameBoard([0, -1])).toThrow()
		expect(() => createGameBoard([0, 5])).toThrow()
		expect(() => createGameBoard([-4, 5])).toThrow()
		expect(() => createGameBoard([1, 1])).not.toThrow()
	})

	describe('placeShip', () => {
		it('throws when ship rectangle argument is not sorted from left to right (in case of row ships)', () => {
			const board = createGameBoard([3, 3])
			expect(() => board.placeShip([[0, 1], [0, 0]])).toThrow()
		})

		it('throws when ship rectangle argument is not sorted from top to bottom (in case of col ships)', () => {
			const board = createGameBoard([3, 3])
			expect(() => board.placeShip([[1, 0], [0, 0]])).toThrow()
		})

		it('throws when coordinates beyond grid edges', () => {
			const board = createGameBoard([5, 5])
			const invalidCoords = [
				[[0, 0], [0, 5]],
				[[0, 0], [5, 0]],
				[[1, -1], [5, 5]],
				[[0, -1], [0, -1]],
				[[0, 5], [0, 5]],
				[[-1, 0], [-1, 0]],
				[[5, 0], [5, 0]],
				[[-1, -1], [1, 1]],
				[[2, 3], [2, 8]],
				[[2, 3], [6, 3]],
			]
			invalidCoords.forEach(coords => {
				expect(() => board.placeShip(coords)).toThrow()
			})
		})

		it('throws when ship coordinates are not horizontal nor vertical', () => {
			const board = createGameBoard([5, 5])
			const invalidCoords = [
				[[0, 0], [1, 1]],
				[[0, 0], [1, 3]],
				[[4, 1], [0, 0]],
				[[0, 1], [1, 0]],
				[[0, 0], [2, 3]],
				[[2, 3], [0, 1]],
			]
			invalidCoords.forEach(coords => {
				expect(() => board.placeShip(coords)).toThrow()
			})
		})

		it('throws when ship coordinates overlap with horizontal ship', () => {
			const gridDimensions = [10, 10]

			const board = createGameBoard(gridDimensions)

			const shipRect = [[3, 3], [3, 4]]

			board.placeShip(shipRect)

			getOverlappingPlacements(shipRect, gridDimensions).forEach(coords => {
				expect(() => board.placeShip(coords)).toThrow()
			})

			const validPlacements = [
				[[1, 2], [1, 5]],
				[[3, 1], [4, 1]],
				[[5, 3], [5, 3]],
				[[5, 5], [5, 5]],
				[[3, 6], [3, 6]],
			]

			validPlacements.forEach(coords => {
				board.placeShip(coords)
			})
		})

		it('throws when ship coordinates overlap with vertical ship', () => {
			const gridDimensions = [10, 10]

			const board = createGameBoard(gridDimensions)

			const shipRect = [[3, 5], [5, 5]]

			board.placeShip(shipRect)

			getOverlappingPlacements(shipRect, gridDimensions).forEach(coords => {
				expect(() => board.placeShip(coords)).toThrow()
			})

			const validPlacements = [
				[[1, 0], [1, 9]],
				[[3, 3], [6, 3]],
				[[7, 5], [7, 6]],
				[[5, 7], [5, 7]],
				[[3, 7], [3, 7]],
			]

			validPlacements.forEach(coords => {
				board.placeShip(coords)
			})
		})

		it('throws after the first attack, case1: after miss attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 0]])
			board.receiveAttack([1, 1])
			expect(() => board.placeShip([[2, 2], [2, 2]])).toThrow()
		})

		it('throws after the first attack, case2: after hit attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 1]])
			board.receiveAttack([0, 0])
			expect(() => board.placeShip([[2, 2], [2, 2]])).toThrow()
			board.receiveAttack([0, 1])
			expect(() => board.placeShip([[2, 2], [2, 2]])).toThrow()
		})

		it('adds ship to the board', () => {
			const board = createGameBoard([5, 5])

			const shipsRect = [
				[[0, 0], [0, 1]],
				[[2, 1], [3, 1]],
				[[4, 4], [4, 4]],
			]

			shipsRect.forEach(rect => board.placeShip(rect))

			expect(board.getShipsCoords()).toEqual(shipsRect)
		})
	})

	describe('canPlaceShip', () => {
		it('follows placeShip', () => {
			const board = createGameBoard([5, 5])

			expect(board.canPlaceShip([[2, 2], [2, 3]])).toBe(true)
			expect(board.canPlaceShip([[2, 3], [2, 4]])).toBe(true)
			expect(board.canPlaceShip([[0, 4], [3, 4]])).toBe(true)

			board.placeShip([[2, 2], [2, 3]])

			expect(board.canPlaceShip([[2, 3], [2, 4]])).toBe(false)
			expect(board.canPlaceShip([[0, 4], [3, 4]])).toBe(false)

			board.receiveAttack([2, 2])
			board.receiveAttack([2, 3])

			expect(board.canPlaceShip([0, 0])).toBe(false)

			expect(board.isFleetSunk()).toBe(true)
		})
	})

	describe('unplaceShip', () => {
		it('throws after the first attack, case1: after miss attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 0]])
			board.receiveAttack([1, 1])
			expect(() => board.unplaceShip([[0, 0], [0, 0]])).toThrow()
		})

		it('throws after the first attack, case2: after hit attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 1]])
			board.receiveAttack([0, 0])
			expect(() => board.unplaceShip([[0, 0], [0, 1]])).toThrow()
			board.receiveAttack([0, 1])
			expect(() => board.unplaceShip([[0, 0], [0, 1]])).toThrow()
		})

		it('throws when no ship placed yet', () => {
			const board = createGameBoard([3, 3])
			expect(() => board.unplaceShip([[0, 0], [0, 0]])).toThrow()
		})

		it('throws when no ship matches the given coordinates', () => {
			const board = createGameBoard([5, 5])
			board.placeShip([[0, 0], [0, 1]])
			board.placeShip([[3, 4], [4, 4]])
			expect(() => board.unplaceShip([[3, 1], [4, 1]])).toThrow()
			expect(() => board.unplaceShip([[4, 0], [4, 1]])).toThrow()
		})

		it('removes ship from the board', () => {
			const { board, shipsRect } = getTestBoard()

			shipsRect.forEach(shipRect => {
				board.unplaceShip(shipRect)

				expect(() => board.placeShip(shipRect)).not.toThrow()

				board.unplaceShip(shipRect)

				expect(board.getShipsCoords()).not.toContainEqual(shipRect)
			})

			expect(board.getShipsCoords()).toEqual([])
		})
	})

	describe('unplaceAllShips', () => {
		it('throws after the first attack, case1: after miss attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 0]])
			board.receiveAttack([1, 1])
			expect(() => board.unplaceAllShips()).toThrow()
		})

		it('throws after the first attack, case2: after hit attack', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 1]])
			board.receiveAttack([0, 0])
			expect(() => board.unplaceAllShips()).toThrow()
			board.receiveAttack([0, 1])
			expect(() => board.unplaceAllShips()).toThrow()
		})

		it('removes all ships from the board', () => {
			const { board } = getTestBoard()

			board.unplaceAllShips()

			expect(board.getShipsCoords()).toEqual([])
		})
	})

	describe('isAttackValid', () => {
		it('returns false when attacking coords beyond the grid', () => {
			const board = createGameBoard([2, 2])
			expect(board.isAttackValid(-1, -1)).toBe(false)
		})

		it('returns false when it is previously missed', () => {
			const board = createGameBoard([2, 2])
			board.receiveAttack([0, 0])
			expect(board.isAttackValid([0, 0])).toBe(false)
		})

		it('returns false when it is previously hit', () => {
			const board = createGameBoard([4, 4])
			board.placeShip([[0, 0], [0, 1]])
			board.receiveAttack([0, 0])
			expect(board.isAttackValid([0, 0])).toBe(false)
		})

		it('returns false when it is a diagonal adjacent to hit attack', () => {
			const board = createGameBoard([5, 5])
			board.placeShip([[2, 1], [2, 3]])
			board.receiveAttack([2, 2])
			coordsUtils.getDiagonalAdjacent([2, 2]).forEach(adjCoord => {
				expect(board.isAttackValid(adjCoord)).toBe(false)
			})
		})

		it('returns false when it is adjacent to sunk ship', () => {
			const board = createGameBoard([5, 5])
			const shipRect = [[2, 1], [2, 3]]

			board.placeShip(shipRect)

			rectUtils.getCoordsWithin(shipRect).forEach(coords => board.receiveAttack(coords))

			rectUtils.getAdjacentCoords(shipRect).forEach(adjCoord => {
				expect(board.isAttackValid(adjCoord)).toBe(false)
			})
		})

		it('otherwise returns true', () => {
			const board = createGameBoard([5, 5])
			board.placeShip([[2, 1], [2, 3]])

			expect(board.isAttackValid([2, 2])).toBe(true)

			board.receiveAttack([2, 2])

			coordsUtils.get4Adjacent([2, 2]).forEach(coords => {
				expect(board.isAttackValid(coords)).toBe(true)
			})

			board.receiveAttack([1, 2])
			board.receiveAttack([3, 2])

			expect(board.isAttackValid([2, 3])).toBe(true)
			board.receiveAttack([2, 3])

			expect(board.isAttackValid([2, 1])).toBe(true)
			board.receiveAttack([2, 1])
		})
	})

	describe('receiveAttack', () => {
		it('throws when attack is redundant (according to isAttackValid)', () => {
			const { board, gridDimensions } = getTestBoard()

			randoms.shuffle(coordsUtils.getCoordsInGrid(gridDimensions))
				.forEach(coords => {
					if (board.isAttackValid(coords)) {
						expect(() => board.receiveAttack(coords)).not.toThrow()
					} else {
						expect(() => board.receiveAttack(coords)).toThrow()
					}
				})
		})

		it('returns type/result of attack as miss, hit or sunk-hit, case1: row ship', () => {
			const board = createGameBoard([4, 4])
			board.placeShip(([[1, 1], [1, 2]]))
			expect(board.receiveAttack([0, 0])).toBe(SHOT_TYPE.MISS)
			expect(board.receiveAttack([1, 1])).toBe(SHOT_TYPE.HIT)
			expect(board.receiveAttack([0, 1])).toBe(SHOT_TYPE.MISS)
			expect(board.receiveAttack([1, 2])).toBe(SHOT_TYPE.SUNK_HIT)
		})

		it('returns type/result of attack as miss, hit or sunk-hit, case2: col ship', () => {
			const board = createGameBoard([4, 4])
			board.placeShip(([[1, 1], [2, 1]]))
			expect(board.receiveAttack([0, 0])).toBe(SHOT_TYPE.MISS)
			expect(board.receiveAttack([1, 1])).toBe(SHOT_TYPE.HIT)
			expect(board.receiveAttack([0, 1])).toBe(SHOT_TYPE.MISS)
			expect(board.receiveAttack([2, 1])).toBe(SHOT_TYPE.SUNK_HIT)
		})

		it('causes ship to be hit', () => {
			const board = createGameBoard([3, 3])
			board.placeShip([[0, 0], [0, 1]])

			board.receiveAttack([0, 0])
			board.receiveAttack([0, 1])

			expect(board.isFleetSunk()).toBe(true)
		})
	})

	describe('getMissedAttacks', () => {
		it('returns missed Attacks in attacking order', () => {
			const gridDimensions = [10, 10]
			const board = createGameBoard(gridDimensions)

			const shipsRect = [
				[[0, 0], [0, 2]],
				[[1, 5], [3, 5]],
				[[3, 1], [3, 3]],
				[[5, 0], [5, 0]],
				[[5, 2], [6, 2]],
			]

			const missedAttacks = arrUtils.sortUnique(
				shipsRect.flatMap(shipRect => rectUtils.getAdjacentCoordsWithGrid(shipRect, gridDimensions)),
				coordsUtils.compare,
			)

			const nonMissedAttacks = shipsRect.flatMap(shipRect => rectUtils.getCoordsWithin(shipRect))

			shipsRect.forEach(coords => board.placeShip(coords))

			;[...missedAttacks, ...nonMissedAttacks].forEach(coord => board.receiveAttack(coord))

			expect(board.getMissedAttacks()).toEqual(missedAttacks)
		})
	})

	describe('isFleetSunk', () => {
		it('returns false when at least one ship is not sunk, otherwise true', () => {
			const gridDimensions = [7, 7]
			const board = createGameBoard([7, 7])

			const shipsRect = [
				[[0, 0], [0, 2]],
				[[1, 5], [3, 5]],
				[[3, 1], [3, 3]],
				[[5, 0], [5, 0]],
				[[5, 2], [6, 2]],
				[[6, 6], [6, 6]],
			]

			shipsRect.forEach(coords => board.placeShip(coords))

			for (let i = 0; i < gridDimensions[0]; i++) {
				for (let j = 0; j < gridDimensions[1]; j++) {
					if (board.isAttackValid([i, j])) board.receiveAttack([i, j])

					if (i === gridDimensions[0] - 1 && j === gridDimensions[1] - 1) {
						expect(board.isFleetSunk()).toBe(true)
					} else {
						expect(board.isFleetSunk()).toBe(false)
					}
				}
			}
		})
	})

	describe('getShipsCoords', () => {
		it('returns [] when no ship is placed', () => {
			const board = createGameBoard([2, 2])
			expect(board.getShipsCoords()).toEqual([])
		})

		it('returns ships coords in the order of placing them', () => {
			const { board, shipsRect } = getTestBoard({ placeShips: false })

			shipsRect.forEach((shipRect, idx) => {
				board.placeShip(shipRect)

				expect(board.getShipsCoords()).toEqual(shipsRect.slice(0, idx + 1))
			})
		})
	})

	describe('getShipsStatus', () => {
		const shipsRect = [
			[[0, 0], [0, 1]],
			[[0, 4], [1, 4]],
			[[4, 0], [5, 0]],
			[[2, 0], [2, 1]],
			[[6, 2], [6, 2]],
			[[2, 6], [4, 6]],
			[[4, 2], [4, 2]],
		]

		const ships = [
			{ coords: [[0, 0], [0, 1]], isSunk: false, hits: [[0, 1]] },
			{ coords: [[0, 4], [1, 4]], isSunk: true, hits: [[0, 4], [1, 4]] },
			{ coords: [[4, 0], [5, 0]], isSunk: false, hits: [[5, 0]] },
			{ coords: [[2, 0], [2, 1]], isSunk: false, hits: [] },
			{ coords: [[6, 2], [6, 2]], isSunk: false, hits: [] },
			{ coords: [[2, 6], [4, 6]], isSunk: true, hits: [[2, 6], [3, 6], [4, 6]] },
			{ coords: [[4, 2], [4, 2]], isSunk: true, hits: [[4, 2]] },
		]

		const board = createGameBoard([10, 10])
		shipsRect.forEach(coords => board.placeShip(coords))
		ships.forEach(({ hits }) => hits.forEach(board.receiveAttack))
		const shipsStatus = board.getShipsStatus()

		it('gives the coords according to order of placing', () => {
			shipsStatus.forEach(({ coords }, idx) => {
				expect(ships[idx].coords).toEqual(coords)
			})
		})

		it('gives the correct hits', () => {
			shipsStatus.forEach(({ hits }, idx) => {
				expect(ships[idx].hits).toEqual(hits)
			})
		})

		it('labels ships as sunk correctly', () => {
			shipsStatus.forEach(({ isSunk }, idx) => {
				expect(ships[idx].isSunk).toEqual(isSunk)
			})
		})
	})

	describe('getLastAttack', () => {
		it('returns null when no attacks yet', () => {
			const board = createGameBoard([2, 2])
			expect(board.getLastAttack()).toBe(null)
		})

		it('returns null when no valid attacks yet', () => {
			const board = createGameBoard([2, 2])
			expect(() => board.receiveAttack([-1, -1])).toThrow()
			expect(() => board.receiveAttack([5, 5])).toThrow()
			expect(board.getLastAttack()).toBe(null)
		})

		it('returns the last attack (case1: miss)', () => {
			const board = createGameBoard([5, 5])
			board.placeShip([[0, 0], [0, 1]])
			board.placeShip([[2, 1], [2, 1]])
			board.placeShip([[2, 3], [3, 3]])

			board.receiveAttack([0, 0])
			board.receiveAttack([0, 3])
			board.receiveAttack([2, 1])
			board.receiveAttack([2, 4])
			board.receiveAttack([3, 3])
			board.receiveAttack([4, 0])
			expect(board.getLastAttack()).toEqual([4, 0])
		})

		it('returns the last attack (case2: hit)', () => {
			const board = createGameBoard([5, 5])
			board.placeShip([[0, 0], [0, 1]])
			board.placeShip([[2, 1], [2, 1]])
			board.placeShip([[2, 3], [3, 3]])

			board.receiveAttack([0, 0])
			board.receiveAttack([0, 3])
			board.receiveAttack([2, 1])
			board.receiveAttack([2, 4])
			board.receiveAttack([2, 3])
			board.receiveAttack([3, 3])
			expect(board.getLastAttack()).toEqual([3, 3])
		})
	})

	describe('getRedundantAdjacent', () => {
		it('returns empty array when not exists', () => {
			const board = createGameBoard([5, 5])

			expect(board.getRedundantAdjacent()).toEqual([])

			board.placeShip([[0, 0], [0, 0]])
			board.placeShip([[2, 2], [2, 2]])

			board.receiveAttack([0, 4])
			board.receiveAttack([4, 0])

			expect(board.getRedundantAdjacent()).toEqual([])
		})

		it('returns non-duplicated diagonal adjacent to hit attack', () => {
			const gridDimensions = [5, 5]
			const board = createGameBoard(gridDimensions)
			const ships = [
				[[0, 0], [0, 0]],
				[[0, 2], [0, 2]],
				[[0, 4], [0, 4]],
				[[2, 0], [2, 0]],
				[[2, 2], [2, 2]],
				[[2, 4], [2, 4]],
				[[4, 2], [4, 2]],
			]
			ships.forEach(ship => board.placeShip(ship))

			ships.forEach(ship => board.receiveAttack(ship[0]))

			const adjacent = arrUtils.sortUnique(
				ships.flatMap(rect => rectUtils.getAdjacentCoordsWithGrid(rect, gridDimensions)),
				coordsUtils.compare,
			)
			expect(board.getRedundantAdjacent().sort(coordsUtils.compare)).toEqual(adjacent)
		})

		it('returns in-grid diagonal adjacent to each hit attack', () => {
			const gridDimensions = [5, 5]
			const board = createGameBoard(gridDimensions)

			board.placeShip([[0, 0], [0, 2]])
			board.placeShip([[2, 3], [3, 3]])

			board.receiveAttack([0, 0])

			expect(board.getRedundantAdjacent()).toEqual([[1, 1]])

			board.receiveAttack([3, 3])

			expect(board.getRedundantAdjacent().sort(coordsUtils.compare)).toEqual([
				[1, 1],
				[2, 2],
				[2, 4],
				[4, 2],
				[4, 4],
			])

			board.receiveAttack([0, 1])

			expect(board.getRedundantAdjacent().sort(coordsUtils.compare)).toEqual([
				[1, 0],
				[1, 1],
				[1, 2],
				[2, 2],
				[2, 4],
				[4, 2],
				[4, 4],
			])
		})

		it('returns all adjacent to sunk ships', () => {
			const gridDimensions = [5, 5]
			const board = createGameBoard([5, 5])
			board.placeShip([[0, 0], [0, 2]])
			board.placeShip([[2, 3], [3, 3]])

			board.receiveAttack([0, 0])
			board.receiveAttack([0, 1])
			board.receiveAttack([0, 2])
			board.receiveAttack([3, 3])
			board.receiveAttack([2, 3])

			let adjacents = [
				...rectUtils.getAdjacentCoordsWithGrid([[0, 0], [0, 2]], gridDimensions),
				...rectUtils.getAdjacentCoordsWithGrid([[2, 3], [3, 3]], gridDimensions),
			]

			adjacents = arrUtils.sortUnique(adjacents, coordsUtils.compare)

			expect(board.getRedundantAdjacent().sort(coordsUtils.compare)).toEqual(adjacents)
		})

		it("doesn't include missed attacks", () => {
			const gridDimensions = [5, 5]
			const board = createGameBoard(gridDimensions)
			const shipRect = [[2, 1], [2, 3]]
			board.placeShip(shipRect)

			const adjacent = rectUtils.getAdjacentCoordsWithGrid(shipRect, gridDimensions)

			adjacent.forEach(coords => board.receiveAttack(coords))

			rectUtils.getCoordsWithin(shipRect).forEach(coords => board.receiveAttack(coords))

			expect(board.getRedundantAdjacent().length).toBe(0)
		})
	})
})
