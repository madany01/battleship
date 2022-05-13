function toString(coords, sep = ',') {
	return coords.join(sep)
}

function fromString(coordsStr, sep = ',') {
	return coordsStr.split(sep).map(str => Number(str))
}

function compare(coordsA, coordsB) {
	const [[i1, j1], [i2, j2]] = [coordsA, coordsB]
	if (i1 === i2 && j1 === j2) return 0
	return i1 < i2 || (i1 === i2 && j1 < j2) ? -1 : +1
}

function sort(coordsList) {
	return [...coordsList].sort(compare)
}

function equal(coordsList) {
	return coordsList.every((coords, idx) => idx === 0 || compare(coords, coordsList[idx - 1]) === 0)
}

function onSameAxis(coordsList) {
	if (coordsList.length <= 1) return true

	// eslint-disable-next-line no-shadow
	const axisMatch = coordsList.reduce((axisMatch, coords, idx) => {
		if (idx === 0) return axisMatch

		const prevCoords = coordsList[idx - 1]

		coords.forEach((value, dimension) => {
			// eslint-disable-next-line no-param-reassign
			axisMatch[dimension] &&= value === prevCoords[dimension]
		})

		return axisMatch
	}, [true, true])

	return axisMatch.some(flag => flag)
}

function withinGrid(coords, gridDimensions) {
	return coords.every((value, idx) => value > -1 && value < gridDimensions[idx])
}

function get4Adjacent(coords) {
	const [i, j] = coords
	return [
		[i - 1, j],
		[i, j + 1],
		[i + 1, j],
		[i, j - 1],
	]
}

function get4AdjacentWithinGrid(coords, gridDimensions) {
	return get4Adjacent(coords).filter(adj => withinGrid(adj, gridDimensions))
}

function areAdjacent4(coordsA, coordsB) {
	return get4Adjacent(coordsA).map(coords => toString(coords)).includes(toString(coordsB))
}

function get8Adjacent(coords) {
	const [i, j] = coords
	return [
		[i - 1, j],
		[i - 1, j + 1],
		[i, j + 1],
		[i + 1, j + 1],
		[i + 1, j],
		[i + 1, j - 1],
		[i, j - 1],
		[i - 1, j - 1],
	]
}

function getDiagonalAdjacent(coords) {
	const [i, j] = coords
	return [
		[i - 1, j + 1],
		[i + 1, j + 1],
		[i + 1, j - 1],
		[i - 1, j - 1],
	]
}

function getDiagonalAdjacentWithinGrid(coords, gridDimensions) {
	return getDiagonalAdjacent(coords).filter(c => withinGrid(c, gridDimensions))
}

function add(coordsList) {
	if (coordsList.length === 0) return [0, 0]
	return coordsList
		.reduce((acc, [i, j]) => {
			acc[0] += i
			acc[1] += j
			return acc
		}, [0, 0])
}

function getCoordsInGrid(gridDimensions) {
	const ret = []
	for (let i = 0; i < gridDimensions[0]; i++) {
		for (let j = 0; j < gridDimensions[1]; j++) {
			ret.push([i, j])
		}
	}
	return ret
}

function clone(coords) {
	return [...coords]
}

export default {
	toString,
	fromString,
	compare,
	sort,
	equal,
	onSameAxis,
	withinGrid,
	get4Adjacent,
	get4AdjacentWithinGrid,
	areAdjacent4,
	get8Adjacent,
	getDiagonalAdjacent,
	getDiagonalAdjacentWithinGrid,
	add,
	getCoordsInGrid,
	clone,
}
