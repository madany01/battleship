function createEvent() {
	const handlers = []

	function addListener(handler) {
		handlers.push(handler)
	}

	function trigger(...args) {
		handlers.forEach(handler => handler(...args))
	}

	return {
		addListener,
		trigger,
	}
}

export default createEvent
