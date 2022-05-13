import createEvent from './createEvent'
import * as htmlToEl from './html-to-element'
import createElement from './createElement'

export default {
	createEvent,
	...htmlToEl,
	createElement,
}
