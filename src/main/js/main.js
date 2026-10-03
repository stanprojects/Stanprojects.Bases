
const Colors = Object.freeze({
    Dark: 'dark',
    Light: 'light',
});

let _colors = undefined

const ColorsSwitch = document.getElementById('ColorsSwitch')

function colorsOf(name) {
    return Object.values(Colors).includes(name) ? name : Colors.Dark;
}

function renderColors(colors) {
    _colors = colors
    ColorsSwitch.textContent = colors
    document.documentElement.setAttribute('data-colors', colors)
    document.querySelector('link[rel="icon"]').href = colors === Colors.Dark
        ? './src/main/svg/favicon_dark.svg'
        : './src/main/svg/favicon_light.svg'
}

function getState({ colors = _colors } = {}) {
    return `#colors=${colors}`
}

function onStateChange({ colors = _colors }, needsToPush = false) {
    if (_colors !== colors) {
        renderColors(colors)
    }
    const expected = getState({ colors: colors })
    if (location.hash !== expected) {
        if (needsToPush) {
            history.pushState(null, '', expected)
        } else {
            history.replaceState(null, '', expected)
        }
    }
}

function onPopState() {
    const params = new URLSearchParams(location.hash.slice(1))
    const colors = colorsOf(params.get('colors'))
    onStateChange({ colors: colors })
}

ColorsSwitch.addEventListener('click', () => {
    const colors = _colors === Colors.Dark ? Colors.Light : Colors.Dark
    onStateChange({ colors: colors })
})

window.addEventListener('popstate', () => {
    onPopState()
})

onPopState()
