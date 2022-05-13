import randoms from '../randoms'
import coordsUtils from '../coordsUtils'

function getRandomCoords(gridDimensions) {
	return gridDimensions.map(len => randoms.int(0, len))
}

function createRandomCoordsGenerator(gridDimensions) {
	const deadCoords = new Set()
	const coordsBank = randoms.shuffle(coordsUtils.getCoordsInGrid(gridDimensions))

	function get() {
		while (coordsBank.length) {
			const coords = coordsBank.pop()
			const coordsStr = coordsUtils.toString(coords)

			if (deadCoords.has(coordsStr)) continue

			deadCoords.add(coordsStr)

			return coords
		}

		throw new Error('all coords have been consumed')
	}

	function exclude(...coordsList) {
		coordsList
			.filter(coords => coordsUtils.withinGrid(coords, gridDimensions))
			.forEach(coords => deadCoords.add(coordsUtils.toString(coords)))
	}

	function canGenerate(coords) {
		return coordsUtils.withinGrid(coords, gridDimensions) && !deadCoords.has(coordsUtils.toString(coords))
	}

	return {
		get,
		exclude,
		canGenerate,
	}
}

export {
	createRandomCoordsGenerator,
	getRandomCoords,
}
