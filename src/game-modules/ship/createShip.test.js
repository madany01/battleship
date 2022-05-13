import { createShip } from '.'

describe('createShip', () => {
	it('throws when ship length argument <= 0', () => {
		expect(() => createShip(-2)).toThrow()
		expect(() => createShip(-1)).toThrow()
		expect(() => createShip(0)).toThrow()
	})

	describe('getLength', () => {
		it('returns the provided length argument correctly', () => {
			expect(createShip(1).getLength()).toBe(1)
			expect(createShip(2).getLength()).toBe(2)
			expect(createShip(3).getLength()).toBe(3)
		})
	})

	describe('hit', () => {
		it('throws when hit position < 0', () => {
			const ship = createShip(3)
			expect(() => ship.hit(-2)).toThrow()
			expect(() => ship.hit(-1)).toThrow()
		})

		it('throws when hit position >= ship length', () => {
			const ship = createShip(3)
			expect(() => ship.hit(3)).toThrow()
			expect(() => ship.hit(4)).toThrow()
		})

		it('throws when a position was hit more than once', () => {
			const ship = createShip(3)
			ship.hit(1)
			expect(() => ship.hit(1)).toThrow()
		})
	})

	describe('wasHit', () => {
		it('throws when positions not in [0, length[', () => {
			const ship = createShip(3)
			const invalidPositions = [-3, -2, -1, 3, 4, 5]
			invalidPositions.forEach(pos => {
				expect(() => ship.wasHit(pos)).toThrow()
			})
		})

		it('returns true when the position was hit, otherwise false', () => {
			const ship = createShip(4)
			ship.hit(0)
			ship.hit(3)
			expect(ship.wasHit(1)).toBe(false)
			expect(ship.wasHit(2)).toBe(false)
			expect(ship.wasHit(0)).toBe(true)
			expect(ship.wasHit(3)).toBe(true)
		})
	})

	describe('getHitPositions', () => {
		it('returns empty array when no hits', () => {
			expect(createShip().getHitPositions()).toEqual([])
		})

		it('returns hit positions according to the order of hit', () => {
			const ship = createShip(6)
			ship.hit(1)
			ship.hit(4)
			ship.hit(0)
			ship.hit(3)
			expect(ship.getHitPositions()).toEqual([1, 4, 0, 3])
		})
	})

	describe('isSunk', () => {
		it('returns true only if all positions were hit', () => {
			const n = 3
			const ship = createShip(n)
			expect(ship.isSunk()).toBe(false)

			for (let i = 0; i < n - 1; i++) {
				ship.hit(i)
				expect(ship.isSunk()).toBe(false)
			}

			ship.hit(n - 1)
			expect(ship.isSunk()).toBe(true)
		})

		it('works irrelevant to hit order', () => {
			const n = 5
			const ship = createShip(n)
			const hitPositions = [4, 0, 3, 1, 2]

			expect(ship.isSunk()).toBe(false)

			hitPositions.slice(0, -1).forEach(position => {
				ship.hit(position)
				expect(ship.isSunk()).toBe(false)
			})

			ship.hit(hitPositions[n - 1])
			expect(ship.isSunk()).toBe(true)
		})
	})
})
