function defaultComparator(a, b) {
	// eslint-disable-next-line no-nested-ternary
	return a === b ? 0 : (a < b ? -1 : +1)
}

function sortUnique(arr, cmp = defaultComparator) {
	if (arr.length === 0) return []

	const sortedArr = [...arr].sort(cmp)

	const ret = [sortedArr[0]]

	for (let i = 1; i < sortedArr.length; i++) {
		if (cmp(sortedArr[i], ret.at(-1)) !== 0) {
			ret.push(sortedArr[i])
		}
	}

	return ret
}

function freqMap(arr) {
	const ret = new Map()

	arr.forEach(val => {
		if (!ret.has(val)) ret.set(val, 0)
		ret.set(val, ret.get(val) + 1)
	})

	return ret
}

function freqMapToArr(map) {
	return [...map.entries()]
		.filter(([, freq]) => freq > 0)
		.flatMap(([val, freq]) => new Array(freq).fill(val))
}

function group(arr) {
	const map = new Map()
	arr.forEach(([k, v]) => {
		if (!map.has(k)) map.set(k, [])
		map.get(k).push(v)
	})

	return map
}

function reshape1dTo2d(arr, [n, m]) {
	if (arr.length !== n * m) {
		throw new Error(`can't reshape array of length ${arr.length} to [${n}, ${m}] 2d array, lengths don't match`)
	}

	if (arr.length === 0 && m !== 0) {
		throw new Error(`can't reshape empty array to no rows with ${m} columns`)
	}

	const ret = new Array(n).fill(null).map(() => new Array(m).fill(null))

	for (let i = 0, p = 0; i < n; i++) {
		for (let j = 0; j < m; j++) {
			ret[i][j] = arr[p++]
		}
	}

	return ret
}

export default {
	sortUnique,
	freqMap,
	freqMapToArr,
	group,
	reshape1dTo2d,
}
