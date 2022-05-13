import coordsUtils from '../../coordsUtils'
import { SHOT_TYPE } from '../../game-board'
import randoms from '../../randoms'
import rectUtils from '../../rectUtils'
import { createRandomCoordsGenerator } from '../../random-coords-generator'

const ATTACK_PHASE = Object.freeze({
	FRESH: 0,
	EXPLORE_ADJACENT: 1,
	FIXED_DIRECTION: 2,
})

function createBoardAttacker({ getGridDimensions, receiveAttack }) {
	const gridDimensions = getGridDimensions()
	const coordsGenerator = createRandomCoordsGenerator(gridDimensions)

	const attackingState = {
		phase: null,
		adjacentCoords: null,
		shipCoordsList: null,
		currentCoords: null,
		step: null,
	}

	function excludeShipAdjacent() {
		const shipSortedCoordsList = coordsUtils.sort(attackingState.shipCoordsList.slice())

		const shipCoords = [shipSortedCoordsList[0], shipSortedCoordsList.at(-1)]

		coordsGenerator.exclude(
			...rectUtils
				.getAdjacentCoords(shipCoords)
				.filter(coords => coordsUtils.withinGrid(coords, gridDimensions)),
		)
	}

	function clearAttackingState() {
		Object.assign(attackingState, {
			phase: null,
			adjacentCoords: null,
			shipCoordsList: null,
			currentCoords: null,
			step: null,
		})
	}

	function excludeShipAdjacentAndClearAttackingState() {
		excludeShipAdjacent()
		clearAttackingState()
	}

	function attackAndExcludeCoords(attackingCoords) {
		coordsGenerator.exclude(attackingCoords)
		return receiveAttack(attackingCoords)
	}

	function freshAttack() {
		const attackingCoords = coordsGenerator.get()
		const shotType = attackAndExcludeCoords(attackingCoords)

		if (shotType === SHOT_TYPE.MISS) return shotType

		attackingState.shipCoordsList = [attackingCoords]

		if (shotType === SHOT_TYPE.SUNK_HIT) {
			excludeShipAdjacentAndClearAttackingState()
			return shotType
		}

		Object.assign(attackingState, {
			phase: ATTACK_PHASE.EXPLORE_ADJACENT,
			adjacentCoords: randoms.shuffle(
				coordsUtils
					.get4AdjacentWithinGrid(attackingCoords, gridDimensions)
					.filter(coords => coordsGenerator.canGenerate(coords)),
			),
		})

		return shotType
	}

	function adjacentAttack() {
		const attackingCoords = attackingState.adjacentCoords.pop()

		const shotType = attackAndExcludeCoords(attackingCoords)

		if (shotType === SHOT_TYPE.MISS) return shotType

		attackingState.shipCoordsList.push(attackingCoords)
		attackingState.adjacentCoords = null

		if (shotType === SHOT_TYPE.SUNK_HIT) {
			excludeShipAdjacentAndClearAttackingState()
			return shotType
		}

		const [firstHit] = attackingState.shipCoordsList

		Object.assign(attackingState, {
			phase: ATTACK_PHASE.FIXED_DIRECTION,
			currentCoords: attackingCoords,
			step: [attackingCoords[0] - firstHit[0], attackingCoords[1] - firstHit[1]],
		})

		return shotType
	}

	function directionAttack() {
		attackingState.currentCoords = coordsUtils.add([attackingState.currentCoords, attackingState.step])
		const attackingCoords = attackingState.currentCoords

		if (!coordsUtils.withinGrid(attackingCoords, gridDimensions)
			|| !coordsGenerator.canGenerate(attackingCoords)) {
			attackingState.step = attackingState.step.map(v => -v)
			;[attackingState.currentCoords] = attackingState.shipCoordsList
			return directionAttack()
		}
		const shotType = attackAndExcludeCoords(attackingCoords)

		if (shotType === SHOT_TYPE.MISS) {
			attackingState.step = attackingState.step.map(v => -v)
			;[attackingState.currentCoords] = attackingState.shipCoordsList
			return shotType
		}

		attackingState.shipCoordsList.push(attackingCoords)

		if (shotType === SHOT_TYPE.HIT) return shotType

		excludeShipAdjacentAndClearAttackingState()
		return shotType
	}

	function attack() {
		switch (attackingState.phase) {
		case ATTACK_PHASE.EXPLORE_ADJACENT:
			return adjacentAttack()

		case ATTACK_PHASE.FIXED_DIRECTION:
			return directionAttack()

		default:
			return freshAttack()
		}
	}

	return attack
}

export default createBoardAttacker
