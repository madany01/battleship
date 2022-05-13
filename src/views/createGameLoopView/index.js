import PubSub from 'pubsub-js'

import template from './template.html'
import playerTemplate from './playerTemplate.html'
import './style.css'
import './queries.css'

import PubSubEvents from '../../PubSubEvents'
import viewsUtils from '../../viewsUtils'
import rectUtils from '../../game-modules/rectUtils'
import arrUtils from '../../game-modules/arrUtils'

function createPlayerEl({
	name,
	score,
	isActive,
	shipsLengths,
	gridDimensions,
}) {
	const playerEl = viewsUtils.htmlToElement(playerTemplate)

	if (!isActive) playerEl.classList.add('targeted')

	playerEl.querySelector('.player-score .value').textContent = score
	playerEl.querySelector('.player-name').textContent = name

	const shipLengthsMap = arrUtils.freqMap(shipsLengths)

	const shipRows =	[...shipLengthsMap].map(([len, freq]) => {
		const shipsRow = viewsUtils.createElement('div', { class: 'ships-row', style: `--len: ${len};` })

		const ships = new Array(freq).fill(null).map(() => {
			const shipParts = new Array(len).fill(null).map(() => viewsUtils.createElement(
				'div',
				{
					class: 'ship-part',
				},
			))

			const shipEl = viewsUtils.createElement('div', { class: 'ship-status', 'data-len': `${len}` }, shipParts)
			return shipEl
		})

		shipsRow.append(...ships)

		return shipsRow
	})

	playerEl.querySelector('.board-ships-status').prepend(...shipRows)

	const cells = []

	for (let i = 0; i < gridDimensions[0]; i++) {
		for (let j = 0; j < gridDimensions[1]; j++) {
			cells.push(viewsUtils.createElement(
				'div',
				{
					class: 'cell',
					'data-i': i,
					'data-j': j,
				},
			))
		}
	}
	const boardEl = playerEl.querySelector('.board')
	boardEl.style.cssText = `--board-rows: ${gridDimensions[0]}; --board-cols: ${gridDimensions[1]}`
	boardEl.append(...cells)

	return playerEl
}

function createShipEl(rect) {
	const width = rectUtils.width(rect)
	const height = rectUtils.height(rect)

	return viewsUtils.createElement('div', {
		style: `--ship-height: ${height}; --ship-width: ${width}`,
		class: 'ship',
	})
}

function createGameLoopView(players) {
	const playersDom = [] // [{el, score, shipsStatus, board, cells}, ..]
	const el = viewsUtils.htmlToElement(template)
	const playersCtr = el.querySelector('.players-ctr')
	const againBtn = el.querySelector('.again-btn')
	let curTargetedPlayerIdx = null

	function cacheDom() {
		playersDom.push(...(
			[...el.querySelectorAll('.player')].map((playerEl, playerIdx) => {
				const shipsStatusEls = arrUtils.group((
					[...playerEl.querySelectorAll('.ship-status')].map(stEl => [Number(stEl.dataset.len), stEl])
				))

				const { gridDimensions } = players[playerIdx]
				const cells = arrUtils.reshape1dTo2d([...playerEl.querySelectorAll('.cell')], gridDimensions)

				return {
					el: playerEl,
					score: playerEl.querySelector('.player-score .value'),
					shipsStatusEls,
					board: playerEl.querySelector('.board'),
					cells,
					placedShips: [],
					sunkStatusShips: [], // {el, len}
					lastAttackCell: null,
				}
			})
		))
	}

	function bindEvents() {
		playersDom.forEach(({ board }, idx) => board.addEventListener('click', boardClicked.bind(null, idx)))
		againBtn.addEventListener('click', () => PubSub.publish(PubSubEvents.gameLoop.againButtonClick))
	}

	function boardClicked(playerIdx, e) {
		const closestCell = e.target.closest('.cell')
		if (!closestCell || closestCell.classList.contains('.filled')) return
		const coords = [closestCell.dataset.i, closestCell.dataset.j].map(x => Number(x))

		PubSub.publish(PubSubEvents.gameLoop.cellClick, {
			coords,
			playerIdx,
		})
	}

	function render(parentEl) {
		parentEl.replaceChildren(el)
	}

	function setTargetedPlayer(playerIdx) {
		if (curTargetedPlayerIdx) playersDom[curTargetedPlayerIdx].el.classList.toggle('targeted')
		curTargetedPlayerIdx = playerIdx
		playersDom[curTargetedPlayerIdx].el.classList.toggle('targeted')
	}

	function toggleTargetedPlayer() {
		playersDom[curTargetedPlayerIdx].el.classList.toggle('targeted')

		curTargetedPlayerIdx = curTargetedPlayerIdx === 0 ? 1 : 0

		playersDom[curTargetedPlayerIdx].el.classList.toggle('targeted')
	}

	function update({
		playerIdx,
		missedAttacks,
		redundantAdjacent,
		shipsStatus,
		lastAttack,
	}, renderNonSunkShips = false) {
		/*
		sunk++
		board
			missed++
			hit++
			redundant++
			lastAttack: change
			ships:
				hit++
				=> only once damaged, safe
		*/

		const playerDom = playersDom[playerIdx]

		const {
			cells, placedShips, sunkStatusShips, shipsStatusEls,
		} = playerDom

		cells.forEach(cellRow => {
			cellRow.forEach(cellEl => {
				cellEl.classList.remove('filled', 'miss', 'redundant', 'hit')
			})
		})

		missedAttacks.forEach(([i, j]) => {
			cells[i][j].classList.add('filled', 'miss')
		})

		redundantAdjacent.forEach(([i, j]) => {
			cells[i][j].classList.add('filled', 'redundant')
		})

		shipsStatus.forEach(({ hits }) => {
			hits.forEach(([i, j]) => {
				cells[i][j].classList.add('filled', 'hit')
			})
		})

		playerDom.lastAttackCell?.classList.toggle('last-attack')
		playerDom.lastAttackCell = lastAttack ? cells[lastAttack[0]][lastAttack[1]] : null
		playerDom.lastAttackCell?.classList.toggle('last-attack')

		while (placedShips.length) {
			placedShips.pop().remove()
		}

		while (sunkStatusShips.length) {
			const { shipStatusEl, len } = sunkStatusShips.pop()

			shipStatusEl.classList.remove('sunk')
			shipsStatusEls.get(len).push(shipStatusEl)
		}

		shipsStatus.filter(({ isSunk }) => isSunk || renderNonSunkShips)
			.forEach(({ coords, isSunk }) => {
				const shipEl = createShipEl(coords)

				const [[i1, j1]] = coords
				cells[i1][j1].append(shipEl)

				placedShips.push(shipEl)

				if (!isSunk) return

				const len = rectUtils.maxDimension(coords)

				const shipStatusEl = shipsStatusEls.get(len).pop()
				shipStatusEl.classList.add('sunk')
				sunkStatusShips.push({ shipStatusEl, len })
			})
	}

	function finalize(winnerIdx) {
		const loserIdx = (winnerIdx + 1) % 2

		playersDom[winnerIdx].el.classList.add('winner')
		playersDom[loserIdx].el.classList.add('loser')

		playersDom[curTargetedPlayerIdx].el.classList.toggle('targeted')
		curTargetedPlayerIdx = null

		playersDom[winnerIdx].score.textContent = players[winnerIdx].score

		againBtn.classList.toggle('show')
	}

	((function init() {
		curTargetedPlayerIdx = players.findIndex(player => !player.isActive)

		players.forEach(player => playersCtr.append(createPlayerEl(player)))

		cacheDom()

		bindEvents()

		const botPlayerIndex = players.findIndex(player => player.isBot)
		if (botPlayerIndex !== -1) {
			const humanPlayerIndex = botPlayerIndex === 0 ? 1 : 0
			playersDom[humanPlayerIndex].el.classList.add('no-clicks')
		}
	}
	)())

	return {
		render,
		setTargetedPlayer,
		toggleTargetedPlayer,
		update,
		finalize,
	}
}

export default createGameLoopView
