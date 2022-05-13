import rectUtils from '.'

describe('rectUtils', () => {
	describe('toString', () => {
		it('returns string representation of rect', () => {
			expect(rectUtils.toString([[0, -1], [-1, 4]])).toBe('0,-1_-1,4')
		})
	})

	describe('fromString', () => {
		it('constructs rect from string', () => {
			expect(rectUtils.fromString('0,-2_-2,4')).toEqual([[0, -2], [-2, 4]])
		})
	})

	describe('height', () => {
		it('returns rect height', () => {
			expect(rectUtils.height([[0, 0], [0, 0]])).toBe(1)
			expect(rectUtils.height([[0, 0], [0, 1]])).toBe(1)
			expect(rectUtils.height([[0, 0], [1, 0]])).toBe(2)
			expect(rectUtils.height([[0, 0], [2, 0]])).toBe(3)
		})
	})

	describe('width', () => {
		it('returns rect width', () => {
			expect(rectUtils.width([[0, 0], [0, 0]])).toBe(1)
			expect(rectUtils.width([[0, 0], [1, 0]])).toBe(1)
			expect(rectUtils.width([[0, 0], [0, 1]])).toBe(2)
			expect(rectUtils.width([[0, 0], [0, 2]])).toBe(3)
		})
	})

	describe('maxDimension', () => {
		it('returns max(width, height)', () => {
			expect(rectUtils.maxDimension([[0, 0], [0, 0]])).toBe(1)
			expect(rectUtils.maxDimension([[0, 0], [0, 1]])).toBe(2)
			expect(rectUtils.maxDimension([[0, 0], [1, 0]])).toBe(2)
			expect(rectUtils.maxDimension([[0, 0], [2, 0]])).toBe(3)
			expect(rectUtils.maxDimension([[0, 0], [2, 3]])).toBe(4)
			expect(rectUtils.maxDimension([[0, 0], [3, 2]])).toBe(4)
		})
	})

	describe('boundingRect', () => {
		it(
			'returns the bounding rect of given rect, means the rect the larger that given rect by 1 on each side',
			() => {
				expect(rectUtils.boundingRect([[0, 0], [0, 0]])).toEqual([[-1, -1], [1, 1]])
			},
		)
	})

	describe('overlap', () => {
		it('returns true if there is an overlap', () => {
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[0, -1], [0, 0]])).toBe(true)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[0, 1], [0, 2]])).toBe(true)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[0, 1], [0, 1]])).toBe(true)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-1, -1], [2, 2]])).toBe(true)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[0, 0], [0, 0]])).toBe(true)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[0, 0], [0, 2]])).toBe(true)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-2, -2], [-2, 3]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[2, -2], [2, 3]])).toBe(false)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-1, -2], [-1, -1]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-1, 2], [-1, 3]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[1, -2], [1, -1]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[1, 2], [1, 3]])).toBe(false)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-2, 0], [-1, 0]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[1, 0], [2, 0]])).toBe(false)

			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-2, -2], [2, -2]])).toBe(false)
			expect(rectUtils.overlap([[0, 0], [0, 1]], [[-2, 3], [2, 3]])).toBe(false)
		})

		describe('compareByCoords', () => {
			it('returns 0 when rects are equal', () => {
				expect(rectUtils.compareByCoords([[0, 2], [0, 3]], [[0, 2], [0, 3]])).toBe(0)
			})

			it('returns -1 when first rect < second rect', () => {
				expect(rectUtils.compareByCoords([[0, 0], [0, 1]], [[0, 0], [0, 2]])).toBe(-1)
				expect(rectUtils.compareByCoords([[0, 0], [0, 1]], [[0, 1], [0, 1]])).toBe(-1)
				expect(rectUtils.compareByCoords([[0, 0], [0, 1]], [[0, 2], [0, 2]])).toBe(-1)
				expect(rectUtils.compareByCoords([[0, 0], [0, 1]], [[1, 0], [1, 0]])).toBe(-1)
				expect(rectUtils.compareByCoords([[0, 0], [0, 1]], [[0, 0], [1, 0]])).toBe(-1)
			})

			it('returns +1 when first rect > second rect', () => {
				expect(rectUtils.compareByCoords([[0, 0], [0, 2]], [[0, 0], [0, 1]])).toBe(1)
				expect(rectUtils.compareByCoords([[0, 1], [0, 1]], [[0, 0], [0, 1]])).toBe(1)
				expect(rectUtils.compareByCoords([[0, 2], [0, 2]], [[0, 0], [0, 1]])).toBe(1)
				expect(rectUtils.compareByCoords([[1, 0], [1, 0]], [[0, 0], [0, 1]])).toBe(1)
				expect(rectUtils.compareByCoords([[0, 0], [1, 0]], [[0, 0], [0, 1]])).toBe(1)
			})
		})
	})

	describe('sortByCoords', () => {
		it('returns rects sorted', () => {
			expect(rectUtils.sortByCoords([
				[[1, 3], [1, 3]],
				[[0, 2], [2, 2]],
				[[2, 0], [2, 1]],
				[[0, 0], [0, 1]],
				[[2, 2], [2, 3]],
				[[1, 3], [1, 3]],
			])).toEqual([
				[[0, 0], [0, 1]],
				[[0, 2], [2, 2]],
				[[1, 3], [1, 3]],
				[[1, 3], [1, 3]],
				[[2, 0], [2, 1]],
				[[2, 2], [2, 3]],
			])
		})
	})

	describe('withinGrid', () => {
		it('returns true when rect coords exists within grid dimensions', () => {
			expect(rectUtils.withinGrid([[0, 0], [3, 3]], [4, 4])).toBe(true)
			expect(rectUtils.withinGrid([[0, 0], [4, 4]], [4, 4])).toBe(false)
			expect(rectUtils.withinGrid([[-1, -1], [1, 1]], [2, 2])).toBe(false)
			expect(rectUtils.withinGrid([[0, 0], [0, 2]], [2, 2])).toBe(false)
			expect(rectUtils.withinGrid([[0, 0], [2, 0]], [2, 2])).toBe(false)
			expect(rectUtils.withinGrid([[0, -1], [0, 0]], [2, 2])).toBe(false)
		})
	})

	describe('getAdjacentCoords', () => {
		it('returns adjacent coords to rect clockwise', () => {
			expect(rectUtils.getAdjacentCoords([[1, 1], [2, 3]])).toEqual([
				[0, 0],
				[0, 1],
				[0, 2],
				[0, 3],
				[0, 4],
				[1, 4],
				[2, 4],
				[3, 4],
				[3, 3],
				[3, 2],
				[3, 1],
				[3, 0],
				[2, 0],
				[1, 0],
			])
		})
	})

	describe('getAdjacentCoordsWithGrid', () => {
		it('returns adjacent coords to rect clockwise filtered to only inside grid coords', () => {
			const gridDimensions = [3, 3]
			expect(rectUtils.getAdjacentCoordsWithGrid([[1, 0], [1, 2]], gridDimensions)).toEqual([
				[0, 0],
				[0, 1],
				[0, 2],
				[2, 2],
				[2, 1],
				[2, 0],
			])
		})
	})

	describe('getCoordsWithin', () => {
		it('returns all coords within rect sorted top to bottom left to right', () => {
			expect(rectUtils.getCoordsWithin([[0, 0], [1, 1]])).toEqual([
				[0, 0],
				[0, 1],
				[1, 0],
				[1, 1],
			])
		})
	})

	describe('contains', () => {
		it('returns true if rect contains coords', () => {
			expect(rectUtils.contains([[0, 0], [0, 1]], [0, 0])).toBe(true)
			expect(rectUtils.contains([[0, 0], [0, 1]], [0, 1])).toBe(true)
			expect(rectUtils.contains([[0, 0], [1, 0]], [0, 0])).toBe(true)
			expect(rectUtils.contains([[0, 0], [1, 0]], [1, 0])).toBe(true)

			expect(rectUtils.contains([[0, 0], [0, 1]], [0, 2])).toBe(false)
			expect(rectUtils.contains([[0, 0], [0, 1]], [-1, 0])).toBe(false)
			expect(rectUtils.contains([[0, 0], [0, 1]], [-1, 0])).toBe(false)
		})
	})

	describe('clone', () => {
		it('clones the given rect and the coords', () => {
			const rect = [[1, 1], [2, 2]]
			const cloned = rectUtils.clone(rect)

			expect(rect).toEqual(cloned)

			expect(rect).not.toBe(cloned)
			expect(rect[0]).not.toBe(cloned[0])
			expect(rect[1]).not.toBe(cloned[1])
		})
	})
})
