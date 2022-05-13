import coordsUtils from '.'
import randoms from '../randoms'

describe('coordsUtils', () => {
	describe('toString', () => {
		it('works when both coords are [-, -]', () => {
			expect(coordsUtils.toString([-1, -2])).toBe('-1,-2')
		})

		it('works when one of them is - and other is + [-, +]', () => {
			expect(coordsUtils.toString([-1, 2])).toBe('-1,2')
			expect(coordsUtils.toString([1, -2])).toBe('1,-2')
		})

		it('works when both are [+,+]', () => {
			expect(coordsUtils.toString([1, 2])).toBe('1,2')
		})

		it('works when one of them is [0, ]', () => {
			expect(coordsUtils.toString([0, 2])).toBe('0,2')
			expect(coordsUtils.toString([2, 0])).toBe('2,0')
		})

		it('works when both are [0, 0]', () => {
			expect(coordsUtils.toString([0, 0])).toBe('0,0')
		})
	})

	describe('fromString', () => {
		it('constructs coords from string', () => {
			expect(coordsUtils.fromString('0,0')).toEqual([0, 0])
			expect(coordsUtils.fromString('0,-2')).toEqual([0, -2])
			expect(coordsUtils.fromString('1,2')).toEqual([1, 2])
			expect(coordsUtils.fromString('-1,2')).toEqual([-1, 2])
			expect(coordsUtils.fromString('1,-2')).toEqual([1, -2])
			expect(coordsUtils.fromString('-1,-2')).toEqual([-1, -2])
		})
	})

	describe('compare', () => {
		it('returns 0 when coords are equal', () => {
			expect(coordsUtils.compare([1, 2], [1, 2])).toBe(0)
			expect(coordsUtils.compare([-1, 2], [-1, 2])).toBe(0)
			expect(coordsUtils.compare([1, -2], [1, -2])).toBe(0)
			expect(coordsUtils.compare([-1, -2], [-1, -2])).toBe(0)
			expect(coordsUtils.compare([0, 2], [0, 2])).toBe(0)
			expect(coordsUtils.compare([2, 0], [2, 0])).toBe(0)
			expect(coordsUtils.compare([0, 0], [0, 0])).toBe(0)
		})

		it('returns -1 when first coords < seconds coords', () => {
			expect(coordsUtils.compare([0, 1], [1, 1])).toBe(-1)
			expect(coordsUtils.compare([0, 0], [0, 1])).toBe(-1)
			expect(coordsUtils.compare([-1, -1], [0, 0])).toBe(-1)
			expect(coordsUtils.compare([2, 2], [3, 3])).toBe(-1)
		})

		it('returns +1 when first coords > seconds coords', () => {
			expect(coordsUtils.compare([1, 1], [0, 1])).toBe(+1)
			expect(coordsUtils.compare([0, 1], [0, 0])).toBe(+1)
			expect(coordsUtils.compare([0, 0], [-1, -1])).toBe(+1)
			expect(coordsUtils.compare([3, 3], [2, 2])).toBe(+1)
		})
	})

	describe('sort', () => {
		it("doesn't mutate the original array", () => {
			const passedCoords = [[1, 1], [0, 0]]
			const returnedCoords = coordsUtils.clone(passedCoords)
			coordsUtils.sort(returnedCoords)
			expect(returnedCoords).toEqual(passedCoords)
		})

		it('sorts coords array relative to top to bottom, left to right', () => {
			const sortedCoordsList = []
			const rows = [-3, 3]
			const cols = [2, 3]

			for (let i = rows[0]; i <= rows[1]; i++) {
				for (let j = cols[0]; j <= cols[1]; j++) {
					sortedCoordsList.push([i, j])
				}
			}

			expect(coordsUtils.sort(randoms.shuffle(sortedCoordsList))).toEqual(sortedCoordsList)
		})
	})

	describe('equal', () => {
		it('returns true if given coordsList length is <= 1', () => {
			expect(coordsUtils.equal([])).toBe(true)
			expect(coordsUtils.equal([[1, 1]])).toBe(true)
		})

		it('returns true when all coords are equal, otherwise false', () => {
			const length = 4

			for (let i = -2; i <= +2; i++) {
				for (let j = -2; j <= +2; j++) {
					const coords = [i, j]
					const equalCoordsList = new Array(length).fill(null).map(() => coordsUtils.clone(coords))
					expect(coordsUtils.equal(equalCoordsList)).toBe(true)

					expect(coordsUtils.equal([...equalCoordsList, [i + 1, j]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i - 1, j]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i, j + 1]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i, j - 1]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i + 1, j + 1]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i + 1, j - 1]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i - 1, j + 1]])).toBe(false)
					expect(coordsUtils.equal([...equalCoordsList, [i - 1, j - 1]])).toBe(false)
				}
			}
		})
	})

	describe('onSameAxis', () => {
		it('returns true when the length of coordsList is <= 1', () => {
			expect(coordsUtils.onSameAxis([])).toBe(true)
			expect(coordsUtils.onSameAxis([[1, 2]])).toBe(true)
		})

		it('returns true when all coords are on the same axis (X or Y or both), otherwise false', () => {
			expect(coordsUtils.onSameAxis([[0, 0], [0, 1], [0, 2], [0, 0]])).toBe(true)
			expect(coordsUtils.onSameAxis([[0, 1], [1, 1], [2, 1], [0, 1]])).toBe(true)
			expect(coordsUtils.onSameAxis([[0, 1], [0, 1], [0, 1], [0, 1]])).toBe(true)

			expect(coordsUtils.onSameAxis([[0, 0], [0, 0], [1, 1], [1, 1]])).toBe(false)
			expect(coordsUtils.onSameAxis([[0, 0], [0, 0], [0, 0], [1, 1]])).toBe(false)
			expect(coordsUtils.onSameAxis([[0, 1], [0, 1], [0, 1], [1, 2]])).toBe(false)
		})
	})

	describe('withinGrid', () => {
		it('returns true when coords inside grid dimensions: [0, 0] -> [n, m] exclusive', () => {
			const [n, m] = [2, 3]
			const gridDimensions = [n, m]

			for (let i = 0; i < n; i++) {
				for (let j = 0; j < m; j++) {
					expect(coordsUtils.withinGrid([i, j], gridDimensions)).toBe(true)
				}
			}

			expect(coordsUtils.withinGrid([-1, -1], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([-1, m], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([n, -1], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([n, m], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([-1, 0], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([0, -1], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([0, m], gridDimensions)).toBe(false)
			expect(coordsUtils.withinGrid([n, 0], gridDimensions)).toBe(false)
		})
	})

	describe('get4Adjacent', () => {
		it('returns top right bottom left adjacents', () => {
			expect(coordsUtils.get4Adjacent([0, 0])).toEqual([
				[-1, 0],
				[0, 1],
				[1, 0],
				[0, -1],
			])
		})
	})

	describe('get4AdjacentWithinGrid', () => {
		it('returns return in-grid adjacents', () => {
			expect(coordsUtils.get4AdjacentWithinGrid([0, 0], [3, 3])).toEqual([
				[0, 1],
				[1, 0],
			])
		})
	})

	describe('areAdjacent4', () => {
		it('returns true when the given coords are 4-adjacent, otherwise false', () => {
			expect(coordsUtils.areAdjacent4([0, 0], [0, 1])).toBe(true)
			expect(coordsUtils.areAdjacent4([0, 0], [1, 0])).toBe(true)
			expect(coordsUtils.areAdjacent4([0, 0], [0, -1])).toBe(true)
			expect(coordsUtils.areAdjacent4([0, 0], [-1, 0])).toBe(true)

			expect(coordsUtils.areAdjacent4([0, 0], [0, 0])).toBe(false)
			expect(coordsUtils.areAdjacent4([0, 0], [0, 2])).toBe(false)
			expect(coordsUtils.areAdjacent4([0, 0], [2, 0])).toBe(false)
			expect(coordsUtils.areAdjacent4([0, 0], [0, -2])).toBe(false)
			expect(coordsUtils.areAdjacent4([0, 0], [-2, 0])).toBe(false)
		})
	})

	describe('get8Adjacent', () => {
		it('returns 8-adjacent of coords from clock-wise', () => {
			expect(coordsUtils.get8Adjacent([0, 0])).toEqual([
				[-1, 0],
				[-1, 1],
				[0, 1],
				[1, 1],
				[1, 0],
				[1, -1],
				[0, -1],
				[-1, -1],
			])
		})
	})

	describe('getDiagonalAdjacent', () => {
		it('returns diagonal adjacent of coords clock-wise', () => {
			expect(coordsUtils.getDiagonalAdjacent([0, 0])).toEqual([
				[-1, 1],
				[1, 1],
				[1, -1],
				[-1, -1],
			])
		})
	})

	describe('getDiagonalAdjacentWithinGrid', () => {
		it('returns in-grid diagonal adjacent of coords clock-wise', () => {
			expect(coordsUtils.getDiagonalAdjacentWithinGrid([0, 0], [2, 2])).toEqual([
				[1, 1],
			])
		})
	})

	describe('add', () => {
		it('returns [0, 0] when no coords exists', () => {
			expect(coordsUtils.add([])).toEqual([0, 0])
		})

		it('add the coordsList coords', () => {
			expect(coordsUtils.add([
				[0, 1],
				[-2, 1],
				[3, 3],
				[-2, -2],
				[0, 0],
				[1, -2],
			])).toEqual([0, 1])
		})
	})

	describe('getCoordsInGrid', () => {
		it('returns coords inside grid from top to bottom left to right', () => {
			expect(coordsUtils.getCoordsInGrid([2, 2])).toEqual([
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			])
		})
	})

	describe('clone', () => {
		it('returns clone of given coords', () => {
			const coords = [1, 2]
			expect(coordsUtils.clone(coords)).toEqual(coords)
			expect(coordsUtils.clone(coords)).not.toBe(coords)
		})
	})
})
