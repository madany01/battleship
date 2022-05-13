import { createGameBoard } from '../../game-board'
import placeShipsRandomly from '.'
import rectUtils from '../../rectUtils'

describe('placeShipsRandomly', () => {
	it('gives valid placements', () => {
		const shipsLengths = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
		const gridDimensions = [10, 10]
		const iterations = 100

		for (let iter = 0; iter < iterations; iter++) {
			const board = createGameBoard(gridDimensions)

			expect(() => placeShipsRandomly(shipsLengths, board)).not.toThrow()
		}
	})

	it('returns placement matches the ship lengths', () => {
		const gridDimensions = [10, 10]
		const shipsLengths = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
		const iterations = 100

		for (let iter = 0; iter < iterations; iter++) {
			const board = createGameBoard(gridDimensions)

			placeShipsRandomly(shipsLengths, board)

			const placements = board.getShipsCoords()

			expect(placements.length).toBe(shipsLengths.length)

			expect(
				placements
					.map(([[i1, j1], [i2, j2]]) => Math.max(i2 - i1, j2 - j1) + 1)
					.sort((a, b) => a - b),
			).toEqual(shipsLengths)
		}
	})

	it('gives at least 70% random placement on each call', () => {
		const shipsLengths = [1, 1, 1, 1, 2, 2, 2, 3, 3, 4]
		const gridDimensions = [10, 10]
		const epochs = 100
		const iterations = 16

		const percentages = []

		for (let epoch = 0; epoch < epochs; epoch++) {
			const uniquePositions = new Set()

			for (let iter = 0; iter < iterations; iter++) {
				const board = createGameBoard(gridDimensions)
				placeShipsRandomly(shipsLengths, board)
				const placements = board.getShipsCoords()

				placements.forEach(shipCoords => {
					uniquePositions.add(rectUtils.toString(shipCoords))
				})
			}

			percentages.push(uniquePositions.size / (shipsLengths.length * iterations))
		}

		const ratio = percentages.reduce((acc, percentage) => acc + percentage, 0) / percentages.length

		expect(Math.abs(ratio - 0.70) < 1e-6 || ratio > 0.70).toBe(true)
	})
})
