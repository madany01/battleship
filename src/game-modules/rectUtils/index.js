import coordsUtils from '../coordsUtils'

function toString(rect, betweenCoordsSep = '_', coordsSep = ',') {
	return rect.map(coords => coords.join(coordsSep)).join(betweenCoordsSep)
}

function fromString(rectString, betweenCoordsSep = '_', coordsSep = ',') {
	return rectString.split(betweenCoordsSep).map(coordsStr => coordsUtils.fromString(coordsStr, coordsSep))
}

function height(rect) {
	const [[i1], [i2]] = rect

	return i2 - i1 + 1
}

function width(rect) {
	const [[, j1], [, j2]] = rect

	return j2 - j1 + 1
}

function maxDimension(rect) {
	return Math.max(width(rect), height(rect))
}

function boundingRect(rect) {
	const [[i1, j1], [i2, j2]] = rect
	return [
		[i1 - 1, j1 - 1],
		[i2 + 1, j2 + 1],
	]
}

function overlap(rectangleA, rectangleB) {
	const [[minI1, minJ1], [maxI1, maxJ1]] = rectangleA
	const [[minI2, minJ2], [maxI2, maxJ2]] = rectangleB

	const overlapI = !(maxI1 < minI2 || minI1 > maxI2)
	const overlapJ = !(maxJ1 < minJ2 || minJ1 > maxJ2)
	return overlapI && overlapJ
}

function compareByCoords(rectA, rectB) {
	return coordsUtils.compare(rectA[0], rectB[0]) || coordsUtils.compare(rectA[1], rectB[1])
}

function sortByCoords(rects) {
	return [...rects].sort(compareByCoords)
}

function withinGrid(rect, gridDimensions) {
	return rect.every(coords => coordsUtils.withinGrid(coords, gridDimensions))
}

function getAdjacentCoords(rectangle) {
	const [[i1, j1], [i2, j2]] = rectangle

	const adjCoords = []

	for (let j = j1 - 1; j <= j2 + 1; j++) adjCoords.push([i1 - 1, j])
	for (let i = i1; i <= i2 + 1; i++) adjCoords.push([i, j2 + 1])
	for (let j = j2; j >= j1 - 1; j--) adjCoords.push([i2 + 1, j])
	for (let i = i2; i >= i1; i--) adjCoords.push([i, j1 - 1])

	return adjCoords
}

function getAdjacentCoordsWithGrid(rectangle, gridDimensions) {
	return getAdjacentCoords(rectangle).filter(coords => coordsUtils.withinGrid(coords, gridDimensions))
}

function getCoordsWithin(rect) {
	const [[i1, j1], [i2, j2]] = rect
	const coordsList = []
	for (let i = i1; i <= i2; i++) {
		for (let j = j1; j <= j2; j++) {
			coordsList.push([i, j])
		}
	}
	return coordsList
}

function contains(rect, coords) {
	const [i, j] = coords
	const [[i1, j1], [i2, j2]] = rect
	return i >= i1 && i <= i2 && j >= j1 && j <= j2
}

function clone(rect) {
	return rect.map(coords => coordsUtils.clone(coords))
}

export default {
	toString,
	fromString,
	overlap,
	getAdjacentCoords,
	withinGrid,
	boundingRect,
	compareByCoords,
	sortByCoords,
	getCoordsWithin,
	getAdjacentCoordsWithGrid,
	maxDimension,
	width,
	height,
	contains,
	clone,
}
