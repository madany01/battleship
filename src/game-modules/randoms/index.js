// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random

function float(min, max) {
	return Math.random() * (max - min) + min
}

function int(min, max) {
	const minInt = Math.ceil(min)
	const maxInt = Math.floor(max)

	return Math.floor(Math.random() * (maxInt - minInt) + minInt)
}

function choice(choicesArray) {
	return choicesArray[int(0, choicesArray.length)]
}

function shuffle(array) {
	const shuffled = [...array]

	for (let j = shuffled.length - 1; j > 0; j--) {
		const i = int(0, j + 1)
		;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
	}
	return shuffled
}

export default {
	int,
	float,
	choice,
	shuffle,
}
