import { getRandomCoords, createRandomCoordsGenerator } from '.'
import coordsUtils from '../coordsUtils'

describe('getRandomCoords', () => {
	it('returns coords within grid dimensions', () => {
		const gridDimensions = [3, 2]
		for (let i = 0; i < 1000; i++) {
			expect(coordsUtils.withinGrid(getRandomCoords(gridDimensions), gridDimensions)).toBe(true)
		}
	})

	it('generate all grid coords eventually', () => {
		const gridDimensions = [3, 4]
		const generated = new Set()

		for (let i = 0; i < 100; i++) {
			generated.add(coordsUtils.toString(getRandomCoords(gridDimensions)))
		}

		expect(generated.size).toBe(gridDimensions[0] * gridDimensions[1])
	})

	it('returns random coords, 70%', () => {
		const gridDimensions = [10, 100]
		const sampleSize = 100
		const generated = new Set()

		for (let i = 0; i < sampleSize; i++) {
			generated.add(coordsUtils.toString(getRandomCoords(gridDimensions)))
		}

		expect(generated.size).toBeGreaterThanOrEqual((70 / 100) * sampleSize)
	})
})

describe('createRandomCoordsGenerator', () => {
	describe('get', () => {
		it("doesn't generate the same coords twice", () => {
			const gridDimensions = [4, 4]
			const n = gridDimensions[0] * gridDimensions[1]

			const generator = createRandomCoordsGenerator(gridDimensions)

			const generatedCoords = new Set()

			for (let i = 0; i < n; i++) {
				const coords = coordsUtils.toString(generator.get())
				expect(generatedCoords).not.toContainEqual(coords)
				generatedCoords.add(coords)
			}
		})

		it('returns in-grid coords', () => {
			const gridDimensions = [4, 4]
			const n = gridDimensions[0] * gridDimensions[1]

			const generator = createRandomCoordsGenerator(gridDimensions)

			for (let i = 0; i < n; i++) {
				expect(coordsUtils.withinGrid(generator.get(), gridDimensions)).toBe(true)
			}
		})

		it('eventually returns all coords inside grid', () => {
			const gridDimensions = [4, 4]
			const n = gridDimensions[0] * gridDimensions[1]

			const generator = createRandomCoordsGenerator(gridDimensions)

			for (let i = 0; i < n; i++) {
				expect(() => generator.get()).not.toThrow()
			}
		})

		it('throws when all coords in grid exhausted', () => {
			const gridDimensions = [4, 4]
			const n = gridDimensions[0] * gridDimensions[1]

			const generator = createRandomCoordsGenerator(gridDimensions)

			for (let i = 0; i < n; i++) {
				generator.get()
			}

			expect(() => generator.get()).toThrow()
		})

		it('gives random coords', () => {
			const gridDimensions = [10, 10]
			const n = gridDimensions[0] * gridDimensions[1]

			const numGenerators = 5
			const generatedCoords = new Array(numGenerators).fill(null).map(() => new Set())

			for (let g = 0; g < numGenerators; g++) {
				const generator = createRandomCoordsGenerator(gridDimensions)

				for (let _ = 0; _ < n; _++) generatedCoords[g].add(coordsUtils.toString(generator.get()))
			}

			for (let g = 1; g < numGenerators; g++) {
				const curGeneratorGeneratedCoords = [...generatedCoords[g]].join('|')
				const preGeneratorGeneratedCoords = [...generatedCoords[g - 1]].join('|')

				expect(curGeneratorGeneratedCoords).not.toEqual(preGeneratorGeneratedCoords)
			}
		})
	})

	describe('exclude', () => {
		it("doesn't generate excluded coords after the call to exclude (before call is ok)", () => {
			const gridDimensions = [5, 5]
			const n = gridDimensions[0] * gridDimensions[1]
			const generator = createRandomCoordsGenerator(gridDimensions)

			const excluded = [
				[0, 0],
				[1, 1],
				[2, 2],
				[3, 3],
				[4, 4],
			]

			generator.exclude(...excluded)

			for (let i = 0; i < n - excluded.length; i++) {
				const coords = generator.get()
				expect(excluded).not.toContainEqual(coords)
			}

			expect(() => generator.get()).toThrow()
		})

		it("silently ignore passed coords if they aren't inside grid as they weren't passed at all", () => {
			const gridDimensions = [2, 2]
			const generator = createRandomCoordsGenerator(gridDimensions)
			const n = gridDimensions[0] * gridDimensions[1]

			generator.exclude(
				[-1, -1],
				[-1, 2],
				[2, 2],
				[3, 3],
				[-1, 3],
				[5, -6],
				[5, 6],
			)

			for (let _ = 0; _ < n; _++) expect(() => generator.get()).not.toThrow()
		})
	})

	describe('canGenerate', () => {
		it('returns false if coords were previously generated', () => {
			const gridDimensions = [3, 3]
			const generator = createRandomCoordsGenerator(gridDimensions)
			let n = gridDimensions[0] * gridDimensions[1]

			while (n--) {
				expect(generator.canGenerate(generator.get())).toBe(false)
			}
		})

		it('returns false if coords are not inside grid (invalid)', () => {
			const gridDimensions = [2, 2]
			const generator = createRandomCoordsGenerator(gridDimensions)
			expect(generator.canGenerate([-1, -1])).toBe(false)
			expect(generator.canGenerate([2, 2])).toBe(false)
		})

		it('returns false if coords were previously excluded', () => {
			const gridDimensions = [3, 3]
			const generator = createRandomCoordsGenerator(gridDimensions)

			const excluded = [
				[0, 0],
				[1, 1],
				[2, 2],
			]
			excluded.forEach(coords => {
				generator.exclude(coords)
				expect(generator.canGenerate(coords)).toBe(false)
			})
		})

		it('returns true otherwise', () => {
			const gridDimensions = [3, 3]
			const generator = createRandomCoordsGenerator(gridDimensions)

			expect(generator.canGenerate([0, 0])).toBe(true)
			expect(generator.canGenerate([2, 2])).toBe(true)
		})
	})
})
