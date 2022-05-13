import restrictBoardToFixedShipsLengths from '.'
import coordsUtils from '../../coordsUtils'
import { createGameBoard } from '../../game-board'

const makeShip = ((() => {
	const DIRECTIONS = Object.freeze({
		ROW: 0,
		COL: 1,
	})

	// eslint-disable-next-line no-shadow
	function makeShip(len, startCoords = [0, 0], direction = DIRECTIONS.ROW) {
		const ship = [coordsUtils.clone(startCoords), coordsUtils.clone(startCoords)]
		ship[1][direction === DIRECTIONS.ROW ? 1 : 0] += len - 1
		return ship
	}

	makeShip.DIRECTIONS = DIRECTIONS

	return makeShip
})())

describe('restrictBoardToFixedShipsLengths', () => {
	describe('placeShip', () => {
		it('is different function than board.placeShip', () => {
			const placeShip = () => {}
			const board = restrictBoardToFixedShipsLengths({ placeShip }, [1, 2])

			expect(typeof board.placeShip).toBe('function')
			expect(board.placeShip).not.toBe(placeShip)
		})

		it('calls board.placeShip once with the right parameters', () => {
			const placeShip = jest.fn().mockName('mock:board.placeShip')
			const shipsLengths = [4, 2, 1, 5, 8]
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip },
				shipsLengths,
			)

			const ships = shipsLengths.map(len => [[3, 0], [3, len - 1]])

			ships.forEach(ship => board.placeShip(ship))

			expect(placeShip.mock.calls.map(call => call[0])).toEqual(ships)
		})

		it('discards ship length from available lengths, case: unique lengths', () => {
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: () => { } },
				[1, 2, 3, 4, 5, 10],
			)
			for (let i = 1; i <= 5; i++) board.placeShip([[0, 0], [0, i - 1]])

			expect(board.getAvailableShipsLengths()).toEqual([10])
		})

		it('discards ship length from available lengths, case: any lengths', () => {
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: () => { } },
				[1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5],
			)

				;[2, 3, 3, 3, 4, 4, 4, 5].forEach(len => board.placeShip([[0, 0], [0, len - 1]]))

			expect(board.getAvailableShipsLengths()).toEqual([1, 2, 4, 5, 5])
		})

		it("doesn't swallow board.placeShip errors", () => {
			const placeShip = jest.fn()
				.mockName('mock:board.placeShip')
				.mockImplementation(() => {
					throw new Error()
				})

			const board = restrictBoardToFixedShipsLengths({ placeShip }, [1, 2, 3])

			expect(() => board.placeShip([[7, 7], [7, 7]])).toThrow()
		})

		it("doesn't change available lengths when board.placeShip throws", () => {
			const placeShip = jest.fn()
				.mockName('mock:board.placeShip')
				.mockImplementation(() => {
					throw new Error()
				})

			const board = restrictBoardToFixedShipsLengths({ placeShip }, [1, 2, 2, 3, 3, 3])

			expect(() => board.placeShip(([[0, 0], [0, 0]]))).toThrow()
			expect(() => board.placeShip(([[0, 0], [0, 1]]))).toThrow()
			expect(() => board.placeShip(([[0, 0], [0, 2]]))).toThrow()

			expect(board.getAvailableShipsLengths()).toEqual([1, 2, 2, 3, 3, 3])
		})

		it('throws when receiving not allowed length without calling board.placeShip', () => {
			const placeShip = jest.fn().mockName('mock:board.placeShip')
			const shipsLengths = [1, 1, 1, 2, 2, 3, 4]
			const board = restrictBoardToFixedShipsLengths({ placeShip }, shipsLengths)

			shipsLengths.forEach(len => board.placeShip([[0, 0], [0, len - 1]]))

			placeShip.mockClear()

			shipsLengths.forEach(len => {
				expect(() => board.placeShip([[0, 0], [0, len - 1]])).toThrow()
				expect(placeShip).not.toBeCalled()
			})
		})
		// eslint-disable-next-line max-len
		it('throws when receiving consumed length leaving available ship lengths intact without calling board.placeShip', () => {
			const placeShip = jest.fn().mockName('mock:board.placeShip')
			const shipsLengths = [1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 6]
			const board = restrictBoardToFixedShipsLengths({ placeShip }, shipsLengths)

			shipsLengths.filter(v => v <= 3)
				.forEach(len => board.placeShip([[0, 0], [0, len - 1]]))

			;[1, 2, 3, 7, 8, 9].forEach(len => {
				expect(() => board.placeShip([[0, 0], [0, len - 1]])).toThrow()
			})

			expect(board.getAvailableShipsLengths()).toEqual([4, 5, 5, 6, 6, 6])
		})
	})

	describe('unplaceShip', () => {
		it('is different function than board.unplaceShip', () => {
			const unplaceShip = () => {}
			const board = restrictBoardToFixedShipsLengths({ unplaceShip }, [1, 2])

			expect(typeof board.unplaceShip).toBe('function')
			expect(board.unplaceShip).not.toBe(unplaceShip)
		})

		it('throws when ship length was not included in allowed lengths', () => {
			const unplaceShip = () => { }

			const shipsLengths = [1, 1, 1, 2, 2, 3]
			const board = restrictBoardToFixedShipsLengths({ unplaceShip }, shipsLengths)

			expect(() => board.unplaceShip(makeShip(4))).toThrow()
			expect(() => board.unplaceShip(makeShip(5))).toThrow()
			expect(() => board.unplaceShip(makeShip(123))).toThrow()
		})

		describe('cases of throwing when no ship of the corresponding length is placed', () => {
			test('no ship placed yet', () => {
				const shipsLengths = [1, 2, 2, 3, 3, 3]
				const board = restrictBoardToFixedShipsLengths({
					unplaceShip: jest.fn(),
					placeShip: jest.fn(),
				}, shipsLengths)

				shipsLengths.forEach(len => {
					expect(() => board.unplaceShip(makeShip(len))).toThrow()
				})
			})

			test('all ship placed then unplaced', () => {
				const shipsLengths = [1, 2, 2, 3, 3, 3]
				const board = restrictBoardToFixedShipsLengths({
					unplaceShip: jest.fn(),
					placeShip: jest.fn(),
				}, shipsLengths)

				shipsLengths.forEach(len => board.placeShip(makeShip(len)))

				shipsLengths.forEach(len => board.unplaceShip(makeShip(len)))

				shipsLengths.forEach(len => {
					expect(() => board.unplaceShip(makeShip(len))).toThrow()
				})
			})

			test('any order', () => {
				const shipsLengths = [1, 2, 2, 3, 3, 3, 4]
				const board = restrictBoardToFixedShipsLengths({
					unplaceShip: jest.fn(),
					placeShip: jest.fn(),
				}, shipsLengths)

				board.placeShip(makeShip(1))

				expect(() => board.unplaceShip(makeShip(2))).toThrow()
				board.placeShip(makeShip(2))
				board.placeShip(makeShip(2))
				board.unplaceShip(makeShip(2))

				board.placeShip(makeShip(3))
				board.unplaceShip(makeShip(3))
				board.placeShip(makeShip(3))
				board.placeShip(makeShip(3))
				board.unplaceShip(makeShip(3))
				board.unplaceShip(makeShip(3))
				expect(() => board.unplaceShip(makeShip(3))).toThrow()
				board.placeShip(makeShip(3))

				board.placeShip(makeShip(4))
			})
		})

		it('adds length of the unplaced ship to available lengths', () => {
			const shipsLengths = [1, 2, 2, 3, 3, 3, 4, 4, 4, 5, 6, 6]
			const board = restrictBoardToFixedShipsLengths({
				unplaceShip: jest.fn(),
				placeShip: jest.fn(),
			}, shipsLengths)

			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))
			board.placeShip(makeShip(3))
			board.placeShip(makeShip(4))
			board.unplaceShip(makeShip(3))
			board.placeShip(makeShip(4))
			board.unplaceShip(makeShip(2))
			board.placeShip(makeShip(4))
			board.placeShip(makeShip(5))
			board.unplaceShip(makeShip(3))
			board.unplaceShip(makeShip(4))
			board.placeShip(makeShip(6))
			board.unplaceShip(makeShip(4))
			board.unplaceShip(makeShip(4))

			expect(board.getAvailableShipsLengths()).toEqual([1, 2, 2, 3, 3, 3, 4, 4, 4, 6])
		})

		it('calls board.unplaceShip with the right parameters', () => {
			const shipsLengths = [1, 2, 3]
			const placeShip = jest.fn()
			const unplaceShip = jest.fn()

			const board = restrictBoardToFixedShipsLengths({
				unplaceShip,
				placeShip,
			}, shipsLengths)

			board.placeShip(makeShip(1))
			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))

			board.unplaceShip(makeShip(1))

			expect(unplaceShip).toBeCalledTimes(1)
			expect(unplaceShip.mock.calls[0]).toEqual([makeShip(1)])

			board.unplaceShip(makeShip(2))
			board.unplaceShip(makeShip(3))

			expect(unplaceShip).toBeCalledTimes(3)
			expect(unplaceShip.mock.calls).toEqual([
				[makeShip(1)],
				[makeShip(2)],
				[makeShip(3)],
			])
		})

		it("doesn't swallow board.unplaceShip errors", () => {
			const placeShip = jest.fn()
			const unplaceShip = jest.fn()
				.mockName('mock:board.unplaceShip')
				.mockImplementation(() => {
					throw new Error()
				})

			const board = restrictBoardToFixedShipsLengths({ placeShip, unplaceShip }, [1, 2, 3])

			board.placeShip(makeShip(1))
			board.placeShip(makeShip(2))

			expect(() => 	board.unplaceShip(makeShip(1))).toThrow()
			expect(() => 	board.unplaceShip(makeShip(2))).toThrow()
		})

		it("doesn't change available lengths when board.placeShip throws", () => {
			const placeShip = jest.fn()
			const unplaceShip = jest.fn()
				.mockName('mock:board.unplaceShip')
				.mockImplementationOnce(() => { throw new Error() })
				.mockImplementationOnce(() => { throw new Error() })

			const board = restrictBoardToFixedShipsLengths({ placeShip, unplaceShip }, [1, 2, 3, 4])

			board.placeShip(makeShip(1))
			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))

			expect(() => 	board.unplaceShip(makeShip(1))).toThrow()
			expect(() => board.unplaceShip(makeShip(2))).toThrow()

			expect(board.getAvailableShipsLengths()).toEqual([4])
			expect(() => board.unplaceShip(makeShip(3))).not.toThrow()
			expect(board.getAvailableShipsLengths()).toEqual([3, 4])
		})
	})

	describe('unplaceAllShips', () => {
		it('rollbacks available lengths to the initial values: case before any placing', () => {
			const board = restrictBoardToFixedShipsLengths({ unplaceAllShips: jest.fn() }, [1, 2, 3])
			board.unplaceAllShips()
			expect(board.getAvailableShipsLengths()).toEqual([1, 2, 3])
		})

		it('rollbacks available lengths to the initial values: case after some placing', () => {
			const shipsLengths = [1, 2, 2, 3]
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceAllShips: jest.fn() },
				shipsLengths,
			)

			shipsLengths.forEach(len => board.placeShip(makeShip(len)))

			board.unplaceAllShips()

			expect(board.getAvailableShipsLengths()).toEqual(shipsLengths)
		})

		it('enables re-placing all ships', () => {
			const shipsLengths = [1, 2, 2, 3]
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceAllShips: jest.fn() },
				shipsLengths,
			)

			shipsLengths.forEach(len => board.placeShip(makeShip(len)))

			board.unplaceAllShips()

			shipsLengths.forEach(len => {
				expect(() => board.placeShip(makeShip(len))).not.toThrow()
			})
		})

		it('causes unplaceShip to throw for any ship length', () => {
			const shipsLengths = [1, 2, 2, 3]
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceAllShips: jest.fn(), unplaceShip: jest.fn() },
				shipsLengths,
			)

			shipsLengths.forEach(len => board.placeShip(makeShip(len)))

			board.unplaceAllShips()

			shipsLengths.forEach(len => {
				expect(() => board.unplaceShip(makeShip(len))).toThrow()
			})
		})

		it('calls board.unplaceAllShips once', () => {
			const shipsLengths = [1, 2, 2, 3]
			const unplaceAllShips = jest.fn()

			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceShip: jest.fn(), unplaceAllShips },
				shipsLengths,
			)

			board.unplaceAllShips()

			expect(unplaceAllShips).toHaveBeenCalledTimes(1)
		})

		it('throws if board.unplaceAllShips throws', () => {
			const unplaceAllShips = jest.fn().mockImplementation(() => {
				throw new Error()
			})

			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceShip: jest.fn(), unplaceAllShips },
				[1, 2, 3],
			)

			expect(() => board.unplaceAllShips()).toThrow()
		})

		it('leaves available lengths intact if board.unplaceAllShips throws', () => {
			const unplaceAllShips = jest.fn().mockImplementation(() => {
				throw new Error()
			})

			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn(), unplaceShip: jest.fn(), unplaceAllShips },
				[1, 2, 3],
			)

			board.placeShip(makeShip(1))
			board.placeShip(makeShip(2))

			expect(() => board.unplaceAllShips()).toThrow()
			expect(board.getAvailableShipsLengths()).toEqual([3])
		})
	})

	describe('canPlaceShip', () => {
		it('returns false when length is not allowed', () => {
			const shipsLengths = [1, 2, 3]
			const board = restrictBoardToFixedShipsLengths(
				{},
				shipsLengths,
			)
			expect(board.canPlaceShip(makeShip(4))).toBe(false)
			expect(board.canPlaceShip(makeShip(5))).toBe(false)
			expect(board.canPlaceShip(makeShip(51))).toBe(false)
		})

		it('returns false when length is not available', () => {
			const shipsLengths = [1, 2, 3]
			const board = restrictBoardToFixedShipsLengths(
				{ placeShip: jest.fn() },
				shipsLengths,
			)
			board.placeShip(makeShip(1))
			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))

			expect(board.canPlaceShip(makeShip(1))).toBe(false)
			expect(board.canPlaceShip(makeShip(2))).toBe(false)
			expect(board.canPlaceShip(makeShip(3))).toBe(false)
		})

		it("doesn't call board.canPlaceShip when length is invalid", () => {
			const shipsLengths = [1, 2, 3]
			const canPlaceShip = jest.fn()
			const board = restrictBoardToFixedShipsLengths(
				{
					placeShip: jest.fn(),
					canPlaceShip,
				},
				shipsLengths,
			)

			board.placeShip(makeShip(1))

			board.canPlaceShip(makeShip(5))
			board.canPlaceShip(makeShip(6))
			board.canPlaceShip(makeShip(7))

			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))

			board.canPlaceShip(makeShip(1))
			board.canPlaceShip(makeShip(2))
			board.canPlaceShip(makeShip(3))

			expect(canPlaceShip).not.toBeCalled()
		})

		it('return true when length is ok and board.canPlaceShip returns true', () => {
			const shipsLengths = [1, 2, 2, 2, 3, 3, 3]
			const canPlaceShip = jest.fn()
				.mockImplementationOnce(() => true)
				.mockImplementationOnce(() => false)
				.mockImplementationOnce(() => false)

			const board = restrictBoardToFixedShipsLengths(
				{
					placeShip: jest.fn(),
					canPlaceShip,
				},
				shipsLengths,
			)

			board.placeShip(makeShip(2))
			board.placeShip(makeShip(2))
			board.placeShip(makeShip(3))
			board.placeShip(makeShip(3))

			expect(board.canPlaceShip(makeShip(1))).toBe(true)
			expect(board.canPlaceShip(makeShip(3))).toBe(false)
			expect(board.canPlaceShip(makeShip(2))).toBe(false)

			expect(canPlaceShip).toBeCalledTimes(3)
			expect(canPlaceShip.mock.calls.map(call => call[0])).toEqual([
				makeShip(1),
				makeShip(3),
				makeShip(2),
			])
		})
	})

	describe('getAvailableShipsLengths', () => {
		it('returns available ship lengths', () => {
			const board = restrictBoardToFixedShipsLengths(createGameBoard([1, 1]), [5, 1, 2, 4, 3])
			expect(board.getAvailableShipsLengths()).toEqual([5, 1, 2, 4, 3])
		})
	})
})
