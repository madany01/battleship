function createShip(length) {
	if (length <= 0) throw new Error(`ship length must be >= 1, not ${length}`)

	const hits = new Set()

	function getLength() {
		return length
	}

	function validatePositionInRange(position) {
		if (!(position >= 0 && position < getLength())) {
			throw new RangeError(`${position} is not in the range [0, ${getLength()}[`)
		}
	}

	function wasHit(position) {
		validatePositionInRange(position)
		return hits.has(position)
	}

	function hit(position) {
		if (wasHit(position)) {
			throw new Error(`ship position ${position} was already hit`)
		}
		hits.add(position)
	}

	function isSunk() {
		return hits.size === getLength()
	}

	function getHitPositions() {
		return [...hits]
	}

	return {
		getLength,
		hit,
		wasHit,
		getHitPositions,
		isSunk,
	}
}

export default createShip
