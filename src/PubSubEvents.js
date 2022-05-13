const PubSubEvents = Object.freeze({
	gameMode: {
		done: 'gameMode.done',
	},
	shipPlacement: {
		done: 'shipPlacement.done',
	},
	gameLoop: {
		cellClick: 'gameLoop.cellClick',
		againButtonClick: 'gameLoop.againButtonClick',
		gameOver: 'gameLoop.gameOver',
		done: 'gameLoop.done',
	},
})

export default PubSubEvents
