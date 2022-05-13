import coordsUtils from '../../coordsUtils'
import rectUtils from '../../rectUtils'
import randoms from '../../randoms'

function excludeShipCoordsFromAllowedPositions(allowedPositions, shipCoords) {
	const shipBoundingRect = rectUtils.boundingRect(shipCoords)

	return allowedPositions.filter(coords => !rectUtils.contains(shipBoundingRect, coords))
}

function getShipsPlacementCanonicalForm(shipRects) {
	return shipRects
		.sort(rectUtils.compareByCoords)
		.map(rect => rectUtils.toString(rect))
		.join('|')
}

function recursePlaceShips({
	idx,
	shipsLengths,
	allowedPositions,
	board,
	cache,
}) {
	if (idx === shipsLengths.length) return true

	const cacheKey = `${idx}:${getShipsPlacementCanonicalForm(board.getShipsCoords())}`

	if (cache.has(cacheKey)) return false

	const shift = shipsLengths[idx] - 1

	const can = allowedPositions.some(startCoords => {
		const [i, j] = startCoords
		const candidateEndCoords = randoms.shuffle([[i + shift, j], [i, j + shift]])

		return candidateEndCoords.some(endCoords => {
			const shipCoords = [startCoords, endCoords]
			if (!board.canPlaceShip(shipCoords)) return false

			board.placeShip(shipCoords)

			if (recursePlaceShips({
				idx: idx + 1,
				shipsLengths,
				allowedPositions: excludeShipCoordsFromAllowedPositions(allowedPositions, shipCoords),
				board,
				cache,
			})) return true

			board.unplaceShip(shipCoords)
			return false
		})
	})
	if (!can) cache.add(cacheKey)

	return can
}

function placeShipsRandomly(shipsLengths, board) {
	const gridDimensions = board.getGridDimensions()
	// sorting the lengths in decreasing can increase the speed of placements
	const sortedShipLengths = randoms.shuffle([...shipsLengths])
	const allowedPositions = randoms.shuffle(coordsUtils.getCoordsInGrid(gridDimensions))

	const placingSucceeded = recursePlaceShips({
		idx: 0,
		shipsLengths: sortedShipLengths,
		allowedPositions,
		board,
		cache: new Set(),
	})

	return placingSucceeded
}

export default placeShipsRandomly
