import PubSub from 'pubsub-js'

import template from './template.html'
import gridShipOptionTemplate from './gridShipOptionTemplate.html'
import './style.css'
import './queries.css'

import viewsUtils from '../../viewsUtils'
import arrUtils from '../../game-modules/arrUtils'
import PubSubEvents from '../../PubSubEvents'

function createGridShipOptionEl(gridDimensions, shipsLengths) {
	const el = viewsUtils.htmlToElement(gridShipOptionTemplate)

	;[el.querySelector('.grid-rows').textContent] = gridDimensions
	;[, el.querySelector('.grid-cols').textContent] = gridDimensions

	const shipsLengthsString = [...arrUtils.freqMap(shipsLengths).entries()]
		.map(([len, freq]) => `(${new Array(freq).fill(len).join(', ')})`)

	el.querySelector('.ship-lengths').textContent = shipsLengthsString

	return el
}

const MODES = Object.freeze({
	SINGLE: 0,
	MULTI: 1,
	BOTS: 2,
})

function createGameModeView(gridShipsOpts) {
	const el = viewsUtils.htmlToElement(template)
	const singleBtn = el.querySelector('.game-mode-option--single')
	const multiBtn = el.querySelector('.game-mode-option--multi')
	const botsBtn = el.querySelector('.game-mode-option--bots')
	const modeBtns = [singleBtn, multiBtn, botsBtn]
	const nameInputs = [...el.querySelectorAll('.player-name-input')]
	const gridShipsOptsCtr = el.querySelector('.grid-ships-options')
	const gridShipsOptsRadios = []
	const nextBtn = el.querySelector('.view-action--next')
	let currentMode = MODES.SINGLE
	let selectedOptIdx = null

	function render(parentEl) {
		parentEl.replaceChildren(el)
	}

	function changeMode(newMode) {
		if (newMode === currentMode) return

		modeBtns.forEach(btn => btn.classList.remove('selected'))

		modeBtns[newMode].classList.add('selected')

		if (newMode === MODES.SINGLE) {
			nameInputs[1].dataset.value = nameInputs[1].value
			nameInputs[1].value = ''
			nameInputs[1].disabled = true
		} else {
			nameInputs[1].value = nameInputs[1].dataset.value
			nameInputs[1].disabled = false
		}

		currentMode = newMode
	}

	function handleNextClick() {
		let names = null

		if (currentMode === MODES.SINGLE) {
			names = [nameInputs[0].value.trim() || 'human', 'bot 🤖']
			if (names[1] === names[0]) names[1] = `${names[1]} 🌟`
		} else if (currentMode === MODES.MULTI) {
			names = nameInputs
				.map(inp => inp.value.trim())
				.map((name, idx) => name || `human${idx + 1}`)
				.map((name, idx, arr) => (idx === 0 || name !== arr[idx - 1] ? name : `${name}2`))
		} else {
			names = nameInputs
				.map(inp => inp.value.trim())
				.map((name, idx) => name || `bot${idx + 1} 🤖`)
				.map((name, idx, arr) => (idx === 0 || name !== arr[idx - 1] ? name : `${name}2`))
		}

		const pubsubData = {
			playerNames: names,
			gameMode: ['single', 'multi', 'bots'][currentMode],
			opts: gridShipsOpts[selectedOptIdx],
		}

		PubSub.publish(PubSubEvents.gameMode.done, pubsubData)
	}

	function handleGridShipsOptsCtrClick(e) {
		const closestRadio = e.target.closest('.grid-ships-option')?.querySelector('input[type="radio"]')
		if (!closestRadio) return

		selectedOptIdx = gridShipsOptsRadios.findIndex(radio => radio === closestRadio)
		gridShipsOptsRadios[selectedOptIdx].checked = true
	}

	function bindEvents() {
		singleBtn.addEventListener('click', changeMode.bind(null, MODES.SINGLE))
		multiBtn.addEventListener('click', changeMode.bind(null, MODES.MULTI))
		botsBtn.addEventListener('click', changeMode.bind(null, MODES.BOTS))

		nextBtn.addEventListener('click', handleNextClick)
		gridShipsOptsCtr.addEventListener('click', handleGridShipsOptsCtrClick)
	}

	((function init() {
		bindEvents()

		gridShipsOpts.forEach(({ shipsLengths, gridDimensions }) => {
			const gridShipsOptEl = createGridShipOptionEl(gridDimensions, shipsLengths)
			gridShipsOptsCtr.append(gridShipsOptEl)
			gridShipsOptsRadios.push(gridShipsOptEl.querySelector('input[type="radio"]'))
		})

		selectedOptIdx = 0
		gridShipsOptsRadios[selectedOptIdx].checked = true

		nameInputs[1].dataset.value = ''
		nameInputs[1].disabled = true
	}
	)())

	return {
		render,
	}
}

export default createGameModeView
