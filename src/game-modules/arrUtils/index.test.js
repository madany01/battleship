import arrUtils from '.'

describe('arrUtils', () => {
	describe('sortUnique', () => {
		it('returns empty array if the given one is empty', () => {
			expect(arrUtils.sortUnique([])).toEqual([])
		})

		it("doesn't mutate the given array, but returns new one", () => {
			const originalArr = [0, 2, 1, 7, 3, 5]
			let sent = [...originalArr]
			const res = arrUtils.sortUnique(sent)

			expect(sent).toEqual(originalArr)
			expect(sent).not.toBe(res)
			expect(res).toEqual([0, 1, 2, 3, 5, 7])

			sent = []
			expect(arrUtils.sortUnique(sent)).not.toBe(sent)
		})

		it('returns sorted values using default operator (< > === ) if no one given: Numbers', () => {
			const target = [-2, -1, 1, 2, 3, 4, 11, 111]
			const arr = [1, 11, 111, 2, 3, 4, -1, -2]

			expect(arrUtils.sortUnique(arr)).toEqual(target)
		})

		it('returns sorted values using default operator (< > === ) if no one given: Strings', () => {
			const target = ['-1', '-2', '1', '11', '111', '2', '3', '4', 'Z', 'a', 'aa', 'b', 'bz', 'z']
			const arr = ['1', '11', '111', '2', 'bz', '3', 'z', 'b', 'aa', '4', '-1', 'a', '-2', 'Z']

			expect(arrUtils.sortUnique(arr)).toEqual(target)
		})

		it('returns sorted unique values using default operator: Numbers', () => {
			const arr = [1, 2, 6, 3, 2, 2, 1, 6, 7, 6, -4, 0, 2]
			expect(arrUtils.sortUnique(arr)).toEqual([-4, 0, 1, 2, 3, 6, 7])
		})

		it('returns sorted unique values using default operator: Strings', () => {
			const target = ['AA', 'a', 'abc', 'www', 'zz']
			const arr = ['zz', 'AA', 'zz', 'a', 'abc', 'a', 'www', 'a', 'a', 'zz', 'AA']

			expect(arrUtils.sortUnique(arr)).toEqual(target)
		})

		it('returns sorted unique values based on the given comparator if given', () => {
			const objs = [
				{ order: -1 },
				{ order: -2 },
				{ order: -2 },
				{ order: 4 },
				{ order: 1 },
				{ order: 0 },
				{ order: 1 },
				{ order: 88 },
				{ order: 3 },
				{ order: 4 },
				{ order: 1 },
				{ order: 2 },
				{ order: 2 },
			]

			function cmp({ order: a }, { order: b }) {
				return a - b
			}

			const cpmMock = jest.fn().mockName('cmpMock').mockImplementation(cmp)

			const res = arrUtils.sortUnique(objs, cpmMock)

			expect(cpmMock).toBeCalled()

			expect(res.map(({ order }) => order)).toEqual([-2, -1, 0, 1, 2, 3, 4, 88])
		})
	})

	describe('freqMap', () => {
		it('returns empty map when arr is empty', () => {
			expect(arrUtils.freqMap([])).toEqual(new Map())
		})

		it('works with unique values', () => {
			expect(arrUtils.freqMap([1, 20, 300])).toEqual(new Map([
				[1, 1],
				[20, 1],
				[300, 1],
			]))
		})

		it('works with duplicated values', () => {
			expect(arrUtils.freqMap([1, 5, 2, 5, 3, 1, 5, 2, 1, 5, 5])).toEqual(new Map([
				[1, 3],
				[5, 5],
				[2, 2],
				[3, 1],
			]))
		})
	})

	describe('freqMapToArr', () => {
		it('returns [] when map is empty', () => {
			expect(arrUtils.freqMapToArr(new Map())).toEqual([])
		})

		it('works with when freq = 1', () => {
			const map = new Map([
				[0, 1],
				[5, 1],
				[2, 1],
				[-3, 1],
			])

			expect(arrUtils.freqMapToArr(map)).toEqual([0, 5, 2, -3])
		})

		it('discards values with frequency <= 0', () => {
			const map = new Map([
				[1, -2],
				[2, -1],
				[5, 3],
				[6, 2],
				[3, 1],
				[4, 0],
			])

			expect(arrUtils.freqMapToArr(map)).toEqual([5, 5, 5, 6, 6, 3])
		})

		it('works with freq > 1', () => {
			const map = new Map([
				[1, 1],
				[2, 2],
				[5, 3],
				[6, 1],
				[3, 2],
				[4, 3],
			])

			expect(arrUtils.freqMapToArr(map)).toEqual([1, 2, 2, 5, 5, 5, 6, 3, 3, 4, 4, 4])
		})

		it('works with any freq', () => {
			const map = new Map([
				['a', -3],
				['b', -2],
				['c', -1],
				['d', 0],
				['e', 1],
				['f', 2],
				['g', 3],
				['h', 4],
				['x', 1],
				['y', 2],
			])

			expect(arrUtils.freqMapToArr(map)).toEqual([
				'e', 'f', 'f', 'g', 'g', 'g', 'h', 'h', 'h', 'h', 'x', 'y', 'y',
			])
		})
	})

	describe('group', () => {
		it('returns empty map when arr is empty', () => {
			expect(arrUtils.group([])).toEqual(new Map())
		})

		it('groups equal key values to array', () => {
			const arr = [
				['k1', 1],
				['k1', 2],
				['k1', 3],
				['k2', 4],
				['k2', 5],
				['k2', 6],
				['k3', 7],
				['k3', 8],
				['k3', 9],
			]
			expect(arrUtils.group(arr)).toEqual(new Map([
				['k1', [1, 2, 3]],
				['k2', [4, 5, 6]],
				['k3', [7, 8, 9]],
			]))
		})
	})

	describe('reshape1dTo2d', () => {
		it("throws when lengths don't match", () => {
			expect(() => arrUtils.reshape1dTo2d([1, 2, 3, 4], [2, 3])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([1, 2, 3], [3, 2])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([1, 2], [3, 0])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([1], [0, 0])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([1], [0, 1])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([1], [1, 0])).toThrow()
		})

		it('throws when array is empty and dim = [0, m], m != 0', () => {
			expect(() => arrUtils.reshape1dTo2d([], [0, 1])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([], [0, 2])).toThrow()
			expect(() => arrUtils.reshape1dTo2d([], [0, 3])).toThrow()
		})

		it('returns [] when array is empty and dim [0, 0]', () => {
			expect(arrUtils.reshape1dTo2d([], [0, 0])).toEqual([])
		})

		it('returns [[], [], ..] when array is empty and dim [n, 0], n != 0', () => {
			expect(arrUtils.reshape1dTo2d([], [1, 0])).toEqual([[]])
			expect(arrUtils.reshape1dTo2d([], [2, 0])).toEqual([[], []])
			expect(arrUtils.reshape1dTo2d([], [3, 0])).toEqual([[], [], []])
		})

		it('return 2d array of values from the given 1d array', () => {
			const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
			expect(arrUtils.reshape1dTo2d(arr, [3, 4])).toEqual([
				[1, 2, 3, 4],
				[5, 6, 7, 8],
				[9, 10, 11, 12],
			])
		})
	})
})
