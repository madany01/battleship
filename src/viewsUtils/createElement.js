function createElement(tag, attrs = {}, children = []) {
	const el = document.createElement(tag)

	Object.entries(attrs).forEach(([attr, value]) => {
		el.setAttribute(attr, value)
	})

	if (children.length) el.append(...children)

	return el
}

export default createElement
