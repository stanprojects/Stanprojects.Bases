
const Colors = Object.freeze({
    Dark: 'dark',
    Light: 'light',
});

const BaseEncoding = Object.freeze({
    Base16: 'base16',
    Base32: 'base32',
    Base58: 'base58',
    Base64: 'base64',
});

let _colors = undefined
let _baseEncoding = undefined
const baseEncodings = [
    BaseEncoding.Base16,
    BaseEncoding.Base32,
    BaseEncoding.Base58,
    BaseEncoding.Base64,
]

const ColorsSwitch = document.getElementById('ColorsSwitch')
const BaseEncodings = document.getElementById('BaseEncodings')
const TextInput = document.getElementById('TextInput')
const BaseEncoded = document.getElementById('BaseEncoded')
const CopyButton = document.getElementById('CopyButton')

function colorsOf(name) {
    return Object.values(Colors).includes(name) ? name : Colors.Dark;
}

function baseEncodingOf(name) {
    return Object.values(BaseEncoding).includes(name) ? name : BaseEncoding.Base16;
}

function toByteArray(text) {
    return new TextEncoder().encode(text)
}

function byteToHex(byte) {
    return byte.toString(16).padStart(2, '0')
}

function bytesToHex(bytes) {
    return Array.from(new Uint8Array(bytes)).map(byteToHex).join('')
}

function renderColors(colors) {
    _colors = colors
    ColorsSwitch.textContent = colors
    document.documentElement.setAttribute('data-colors', colors)
    document.querySelector('link[rel="icon"]').href = colors === Colors.Dark
        ? './src/main/svg/favicon_dark.svg'
        : './src/main/svg/favicon_light.svg'
}

function renderBaseEncoding(baseEncoding) {
    _baseEncoding = baseEncoding
    BaseEncodings.querySelectorAll('.BaseEncoding').forEach((it) => {
        it.classList.toggle('selected', it.dataset.id === baseEncoding)
    })
    onText(TextInput.value)
}

function getState({ colors = _colors, baseEncoding = _baseEncoding } = {}) {
    return `#colors=${colors}&be=${baseEncoding}`
}

function onStateChange({ colors = _colors, baseEncoding = _baseEncoding }, needsToPush = false) {
    if (_colors !== colors) {
        renderColors(colors)
    }
    if (_baseEncoding !== baseEncoding) {
        renderBaseEncoding(baseEncoding)
    }
    const expected = getState({ colors: colors, baseEncoding: baseEncoding })
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
    const baseEncoding = baseEncodingOf(params.get('be'))
    onStateChange({ colors: colors, baseEncoding: baseEncoding })
}

function initBaseEncodings(baseEncodings) {
    BaseEncodings.replaceChildren()
    for (const baseEncoding of baseEncodings) {
        const it = document.createElement('div')
        it.dataset.id = baseEncoding
        it.className = 'Box Clickable BaseEncoding'
        it.textContent = baseEncoding
        BaseEncodings.appendChild(it)
    }
}

ColorsSwitch.addEventListener('click', () => {
    const colors = _colors === Colors.Dark ? Colors.Light : Colors.Dark
    onStateChange({ colors: colors })
})

BaseEncodings.addEventListener('click', (event) => {
    const it = event.target.closest('.BaseEncoding')
    if (!it) return
    if (_baseEncoding !== it.dataset.id) {
        onStateChange({ baseEncoding: baseEncodingOf(it.dataset.id) })
    }
})

window.addEventListener('popstate', () => {
    onPopState()
})

let indices = 0

function onText(text) {
    const index = ++indices
    const bytes = toByteArray(text)
    let baseEncoded
    switch (_baseEncoding) {
        case BaseEncoding.Base16:
            baseEncoded = bytesToHex(bytes)
            break
        case BaseEncoding.Base32:
            baseEncoded = base32.encode(text)
            break
        case BaseEncoding.Base58:
            baseEncoded = base58(bytes)
            break
        case BaseEncoding.Base64:
            baseEncoded = bytes.toBase64()
            break
        default: throw new Error(`Encoding: ${_baseEncoding} is not supported!`)
    }
    if (index !== indices) return
    BaseEncoded.textContent = baseEncoded
}

TextInput.addEventListener('input', () => {
    onText(TextInput.value)
})

CopyButton.addEventListener('click', () => {
    try {
        navigator.clipboard.writeText(BaseEncoded.textContent)
    } catch (error) {
        // ignored
    }
})

initBaseEncodings(baseEncodings)

onPopState()
