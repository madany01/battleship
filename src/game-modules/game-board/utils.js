import coordsUtils from '../coordsUtils'

const COL_DIRECTION = 0
const ROW_DIRECTION = 1

function getShipDirection(shipRect) {
	const [[i1], [i2]] = shipRect
	return i1 === i2 ? ROW_DIRECTION : COL_DIRECTION
}

function translateShipAtIdxToCoords({ rect, direction }, atIdx) {
	const coords = coordsUtils.clone(rect[0])
	coords[direction] += atIdx
	return coords
}

function translateShipAtCoordsToIdx({ direction, rect }, atCoords) {
	return atCoords[direction] - rect[0][direction]
}

export {
	getShipDirection,
	translateShipAtCoordsToIdx,
	translateShipAtIdxToCoords,
}
