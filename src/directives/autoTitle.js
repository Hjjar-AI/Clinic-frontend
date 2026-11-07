export default {
  mounted(el) {
    updateTitle(el)
  },
  updated(el) {
    updateTitle(el)
  }
}

function updateTitle(el) {
  // If the element has text-overflow: ellipsis in CSS, we check if it's truncated
  if (el.scrollWidth > el.clientWidth) {
    el.setAttribute('title', el.textContent.trim())
  } else {
    el.removeAttribute('title')
  }
}