import PubSub from 'pubsub-js'

import template from './template.html'
import './style.css'
import './queries.css'

import viewsUtils from '../../viewsUtils'
import PubSubEvents from '../../PubSubEvents'
import rectUtils from '../../game-modules/rectUtils'
import arrUtils from '../../game-modules/arrUtils'

function createBoardCells(gridDimensions) {
	const cells = []
	// const html = `<div class="cell" data-i="${i}" data-j="${j}" ></div>`

	for (let i = 0; i < gridDimensions[0]; i++) {
		for (let j = 0; j < gridDimensions[1]; j++) {
			const cellEl = document.createElement('div')
			cellEl.classList.add('cell')
			cellEl.dataset.i = i
			cellEl.dataset.j = j

			cells.push(cellEl)
		}
	}

	return cells
}

function createPlaceholderShipsGroups(shipsLengths) {
	return [...arrUtils.freqMap(shipsLengths)].map(([len, freq]) => {
		const shipRow = viewsUtils.htmlToElement(`<div class="ships-row" style="--len: ${len};"></div>`)

		for (let i = 0; i < freq; i++) {
			const shipEl = viewsUtils.htmlToElement(`<button class="ship" data-len="${len}"></button>`)

			const shipPartHtml = '<span class="ship-part"> </span>'.repeat(len)

			if (len !== 1) shipEl.append(...viewsUtils.htmlToElements(shipPartHtml))
			else shipEl.append(viewsUtils.htmlToElement(shipPartHtml))

			shipRow.append(shipEl)
		}

		return shipRow
	})
}

function createBoardShip(rect) {
	const height = rectUtils.height(rect)
	const width = rectUtils.width(rect)

	const rectStr = rectUtils.toString(rect)

	return viewsUtils.htmlToElement(`
		<div
			class="ship"
			data-rect="${rectStr}"
			style="--ship-height: ${height}; --ship-width: ${width}"
			title="double click to remove"
		></div>
	`)
}

const ORIENT = Object.freeze({
	V: 0,
	H: 1,
})

function createShipPlacementView(
	{
		name: playerName,
		shipsLengths,
		board,
		placeShipsRandomly,
	},
) {
	// DOM
	const el = viewsUtils.htmlToElement(template)
	const playerNameEl = el.querySelector('.player-name')
	const boardEl = el.querySelector('.board')
	const cellEls = []
	const placeholderShipsCtr = el.querySelector('.left .ships')
	const placeholderShipEls = new Map()

	const randomPlaceBtn = el.querySelector('.random-placement')
	const clearBtn = el.querySelector('.clear')

	const horizontalOrientationBtn = el.querySelector('.horizontal')
	const verticalOrientationBtn = el.querySelector('.vertical')
	const orientationBts = [verticalOrientationBtn, horizontalOrientationBtn]

	const nextBtn = el.querySelector('.view-action--next')

	// State
	const gridDimensions = board.getGridDimensions()
	const placedShips = new Map() // rect: String => {placeholderShip, boardShip, rect}
	let orientation = ORIENT.H
	let selectedPlaceholderShip = null // {el, len}
	let highlightedRect = null

	function allShipsPlaced() {
		return placedShips.size === shipsLengths.length
	}

	function updateNextBtn() {
		nextBtn.disabled = !allShipsPlaced()
	}

	function changeOrientation(newOrientation) {
		orientationBts[orientation].classList.toggle('selected')

		orientationBts[newOrientation].classList.toggle('selected')

		orientation = newOrientation
	}

	function unhighlightShip() {
		if (!highlightedRect) return

		const [[i1, j1], [i2, j2]] = highlightedRect
		highlightedRect = null

		for (let i = i1; i <= Math.min(gridDimensions[0] - 1, i2); i++) {
			for (let j = j1; j <= Math.min(gridDimensions[1] - 1, j2); j++) {
				cellEls[i][j].classList.remove('highlight--valid', 'highlight--invalid')
			}
		}
	}

	function highlightShip(rect, isValidPlacement) {
		highlightedRect = rect
		const [[i1, j1], [i2, j2]] = rect

		const cssClass = `highlight--${isValidPlacement ? 'valid' : 'invalid'}`

		for (let i = i1; i <= Math.min(gridDimensions[0] - 1, i2); i++) {
			for (let j = j1; j <= Math.min(gridDimensions[1] - 1, j2); j++) {
				cellEls[i][j].classList.add(cssClass)
			}
		}
	}

	function removeBoardShip(boardShipEl) {
		const { placeholderShip, rect } = placedShips.get(boardShipEl.dataset.rect)

		board.unplaceShip(rect)

		boardShipEl.remove()
		placeholderShip.classList.remove('placed')

		placedShips.delete(boardShipEl.dataset.rect)
	}

	function placeholderShipsCtrClicked(e) {
		const shipEl = e.target.closest('.ship')

		if (!shipEl || shipEl.classList.contains('placed')) return

		selectedPlaceholderShip?.el.classList.remove('selected')

		unhighlightShip()

		selectedPlaceholderShip = { el: shipEl, len: Number(shipEl.dataset.len) }

		shipEl.classList.add('selected')
		boardEl.classList.add('placing')
	}

	function boardMouseOvered(e) {
		const { target } = e

		if (!selectedPlaceholderShip || !target.classList.contains('cell')) return

		unhighlightShip()

		const startCoords = [target.dataset.i, target.dataset.j].map(val => Number(val))
		const endCoords = startCoords.map((val, idx) => (
			val + (idx === orientation ? selectedPlaceholderShip.len - 1 : 0)
		))

		const rect = [startCoords, endCoords]

		highlightShip(rect, board.canPlaceShip(rect))
	}

	function boardMouseOut(e) {
		const { target } = e

		if (!highlightedRect || !target.classList.contains('cell')) return

		unhighlightShip()
	}

	function boardClicked() {
		if (!highlightedRect || !board.canPlaceShip(highlightedRect)) return

		board.placeShip(highlightedRect)

		selectedPlaceholderShip.el.classList.remove('selected')
		selectedPlaceholderShip.el.classList.add('placed')

		boardEl.classList.remove('placing')

		const boardShipEl = createBoardShip(highlightedRect)
		cellEls[highlightedRect[0][0]][highlightedRect[0][1]].append(boardShipEl)

		placedShips.set(rectUtils.toString(highlightedRect), {
			boardShip: boardShipEl,
			placeholderShip: selectedPlaceholderShip.el,
			rect: highlightedRect,
		})

		selectedPlaceholderShip = null
		unhighlightShip()
	}

	function boardDoubleClicked(e) {
		const closestShip = e.target.closest('.ship')
		if (!closestShip) return
		removeBoardShip(closestShip)
	}

	function clear() {
		board.unplaceAllShips()

		placedShips.forEach(({ boardShip, placeholderShip }) => {
			boardShip.remove()
			placeholderShip.classList.remove('placed')
		})

		placedShips.clear()
	}

	function shuffle() {
		if (allShipsPlaced()) {
			clear()
		}

		const placedShipsPlaceholdersEls = new Set(
			[...placedShips.values()].map(({ placeholderShip }) => placeholderShip),
		)

		const availablePlaceholders = new Map(
			[...placeholderShipEls.entries()]
				// eslint-disable-next-line max-len
				.map(([len, arr]) => [len, arr.filter(placeholderEl => !placedShipsPlaceholdersEls.has(placeholderEl))]),
		)

		placeShipsRandomly()

		board.getShipsCoords()
			.filter(rect => !placedShips.has(rectUtils.toString(rect)))
			.forEach(rect => {
				const len = rectUtils.maxDimension(rect)

				const placeholderShip = availablePlaceholders.get(len).pop()

				const boardShip = createBoardShip(rect)
				cellEls[rect[0][0]][rect[0][1]].append(boardShip)

				placedShips.set(rectUtils.toString(rect), {
					boardShip,
					placeholderShip,
					rect,
				})

				placeholderShip.classList.add('placed')
			})

		selectedPlaceholderShip?.el.classList.remove('selected')
		selectedPlaceholderShip = null
		unhighlightShip()
		boardEl.classList.remove('placing')
	}

	function nextBtnClicked() {
		if (nextBtn.disabled) return
		PubSub.publish(PubSubEvents.shipPlacement.done)
	}

	function bindEvents() {
		placeholderShipsCtr.addEventListener('click', placeholderShipsCtrClicked)

		boardEl.addEventListener('dblclick', e => {
			boardDoubleClicked(e)
			updateNextBtn()
		})

		boardEl.addEventListener('click', e => {
			boardClicked(e)
			updateNextBtn()
		})

		boardEl.addEventListener('mouseover', boardMouseOvered)
		boardEl.addEventListener('mouseout', boardMouseOut)

		horizontalOrientationBtn.addEventListener('click', changeOrientation.bind(null, ORIENT.H))
		verticalOrientationBtn.addEventListener('click', changeOrientation.bind(null, ORIENT.V))

		clearBtn.addEventListener('click', e => {
			clear(e)
			updateNextBtn()
		})

		randomPlaceBtn.addEventListener('click', e => {
			shuffle(e)
			updateNextBtn()
		})

		nextBtn.addEventListener('click', nextBtnClicked)
	}

	function render(parentEl) {
		parentEl.replaceChildren(el)
	}

	((function init() {
		function setPlayerName() {
			playerNameEl.textContent = playerName
		}

		function setBoardDimensions() {
			boardEl.style.cssText = `--board-rows: ${gridDimensions[0]}; --board-cols: ${gridDimensions[1]}`
		}

		function addBoardCells() {
			const boardCells = createBoardCells(gridDimensions)
			boardEl.append(...boardCells)
		}

		function cacheBoardCells() {
			const boardCells = [...boardEl.querySelectorAll('.cell')]

			for (let i = 0, k = 0; i < gridDimensions[0]; i++) {
				const row = []
				for (let j = 0; j < gridDimensions[1]; j++) {
					row.push(boardCells[k++])
				}
				cellEls.push(row)
			}
		}

		function addPlaceholderShips() {
			placeholderShipsCtr.append(...createPlaceholderShipsGroups(shipsLengths))
		}

		function cachePlaceholderShips() {
			[...placeholderShipsCtr.querySelectorAll('.ship')]
				.map((shipEl, idx) => [shipsLengths[idx], shipEl])
				.forEach(([len, shipEl]) => {
					if (!placeholderShipEls.has(len)) placeholderShipEls.set(len, [])

					placeholderShipEls.get(len).push(shipEl)
				})
		}

		setPlayerName()

		setBoardDimensions()
		addBoardCells()
		cacheBoardCells()

		addPlaceholderShips()
		cachePlaceholderShips()

		bindEvents()

		nextBtn.disabled = true

		if (board.getShipsCoords().length) shuffle()

		updateNextBtn()
	}
	)())

	return {
		render,
	}
}

export default createShipPlacementView
