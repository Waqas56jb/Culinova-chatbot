/**
 * Culinova Chatbot — embeddable floating widget
 *
 * Paste on any site:
 *   <script src="https://culinova-chatbot-client.vercel.app/widget.js" async></script>
 *
 * Optional: window.CulinovaChat = { position: 'left'|'right', baseUrl: '...' }
 */
;(function () {
  'use strict'

  if (window.__culinovaChatEmbedLoaded) return
  window.__culinovaChatEmbedLoaded = true

  var script =
    document.currentScript ||
    (function () {
      var scripts = document.getElementsByTagName('script')
      for (var i = scripts.length - 1; i >= 0; i--) {
        var src = scripts[i].src || ''
        if (src.indexOf('widget.js') !== -1 || src.indexOf('embed.js') !== -1) return scripts[i]
      }
      return null
    })()

  var cfg = window.CulinovaChat || {}
  var baseUrl = (
    cfg.baseUrl ||
    (script && script.getAttribute('data-base-url')) ||
    (script && script.src ? script.src.replace(/\/(embed|widget)\.js(\?.*)?$/, '') : '') ||
    'https://culinova-chatbot-client.vercel.app'
  ).replace(/\/$/, '')

  var position =
    cfg.position ||
    (script && script.getAttribute('data-position')) ||
    'right'
  if (position !== 'left' && position !== 'right') position = 'right'

  var zIndex = String(cfg.zIndex || (script && script.getAttribute('data-z-index')) || '2147483000')
  var chatSrc = baseUrl + '/?embed=1'

  var STYLE_ID = 'culinova-chat-embed-style'
  var ROOT_ID = 'culinova-chat-embed-root'

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return
    var style = document.createElement('style')
    style.id = STYLE_ID
    style.textContent =
      '#' +
      ROOT_ID +
      '{all:initial;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif}' +
      '#' +
      ROOT_ID +
      ' *{box-sizing:border-box}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher{' +
      'position:fixed;' +
      (position === 'left' ? 'left:20px;' : 'right:20px;') +
      'bottom:20px;' +
      'z-index:' +
      zIndex +
      ';' +
      'width:60px;height:60px;border:0;border-radius:50%;' +
      'cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'background:linear-gradient(145deg,#1a160c 0%,#0a0a0a 55%,#2a2212 100%);' +
      'box-shadow:0 0 0 1px rgba(212,175,55,.45),0 10px 28px rgba(0,0,0,.35),0 0 24px rgba(212,175,55,.18);' +
      'transition:transform .2s ease,box-shadow .2s ease' +
      '}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher:hover{transform:scale(1.06);box-shadow:0 0 0 1px rgba(212,175,55,.65),0 14px 32px rgba(0,0,0,.4),0 0 32px rgba(212,175,55,.28)}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher:focus-visible{outline:2px solid #d4af37;outline-offset:3px}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher svg{width:28px;height:28px;display:block}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher[data-open="true"] .cc-icon-chat{display:none}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher[data-open="false"] .cc-icon-close{display:none}' +
      '#' +
      ROOT_ID +
      ' .cc-panel{' +
      'position:fixed;' +
      (position === 'left' ? 'left:20px;' : 'right:20px;') +
      'bottom:92px;' +
      'z-index:' +
      zIndex +
      ';' +
      'width:min(400px,calc(100vw - 24px));' +
      'height:min(680px,calc(100dvh - 120px));' +
      'border:0;border-radius:22px;overflow:hidden;' +
      'background:#050505;' +
      'box-shadow:0 0 0 1px rgba(212,175,55,.22),0 24px 60px rgba(0,0,0,.45);' +
      'opacity:0;visibility:hidden;pointer-events:none;' +
      'transform:translateY(12px) scale(.98);' +
      'transform-origin:' +
      (position === 'left' ? 'bottom left' : 'bottom right') +
      ';' +
      'transition:opacity .22s ease,transform .22s ease,visibility .22s' +
      '}' +
      '#' +
      ROOT_ID +
      ' .cc-panel[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transform:translateY(0) scale(1)}' +
      '#' +
      ROOT_ID +
      ' .cc-panel iframe{width:100%;height:100%;border:0;display:block;background:transparent}' +
      '@media (max-width:480px){' +
      '#' +
      ROOT_ID +
      ' .cc-panel{' +
      'left:0!important;right:0!important;bottom:0!important;' +
      'width:100vw;height:100dvh;border-radius:0;' +
      'transform:translateY(8px)' +
      '}' +
      '#' +
      ROOT_ID +
      ' .cc-panel[data-open="true"]{transform:translateY(0)}' +
      '#' +
      ROOT_ID +
      ' .cc-launcher{bottom:16px;' +
      (position === 'left' ? 'left:16px;' : 'right:16px;') +
      '}' +
      '}'
    document.head.appendChild(style)
  }

  function createWidget() {
    if (document.getElementById(ROOT_ID)) return

    injectStyles()

    var root = document.createElement('div')
    root.id = ROOT_ID
    root.setAttribute('data-culinova-chat', '1')

    var panel = document.createElement('div')
    panel.className = 'cc-panel'
    panel.setAttribute('data-open', 'false')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-label', 'Culinova Assistant')
    panel.setAttribute('aria-hidden', 'true')

    var iframe = document.createElement('iframe')
    iframe.title = 'Culinova Assistant'
    iframe.allow = 'microphone; clipboard-write'
    iframe.setAttribute('loading', 'lazy')
    iframe.src = 'about:blank'
    panel.appendChild(iframe)

    var button = document.createElement('button')
    button.type = 'button'
    button.className = 'cc-launcher'
    button.setAttribute('data-open', 'false')
    button.setAttribute('aria-label', 'Open Culinova chat')
    button.setAttribute('aria-expanded', 'false')
    button.innerHTML =
      '<svg class="cc-icon-chat" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="#d4af37" d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm2 4v2h12V8H6zm0 4v2h8v-2H6z"/>' +
      '</svg>' +
      '<svg class="cc-icon-close" viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="none" stroke="#d4af37" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/>' +
      '</svg>'

    var open = false
    var loaded = false

    function setOpen(next) {
      open = !!next
      button.setAttribute('data-open', open ? 'true' : 'false')
      button.setAttribute('aria-expanded', open ? 'true' : 'false')
      button.setAttribute('aria-label', open ? 'Close Culinova chat' : 'Open Culinova chat')
      panel.setAttribute('data-open', open ? 'true' : 'false')
      panel.setAttribute('aria-hidden', open ? 'false' : 'true')

      if (open && !loaded) {
        iframe.src = chatSrc
        loaded = true
      }
    }

    button.addEventListener('click', function () {
      setOpen(!open)
    })

    window.addEventListener('message', function (event) {
      if (!event || !event.data) return
      if (event.data === 'culinova-chat:close' || event.data.type === 'culinova-chat:close') {
        setOpen(false)
      }
    })

    root.appendChild(panel)
    root.appendChild(button)
    document.body.appendChild(root)

    window.CulinovaChat = window.CulinovaChat || {}
    window.CulinovaChat.open = function () {
      setOpen(true)
    }
    window.CulinovaChat.close = function () {
      setOpen(false)
    }
    window.CulinovaChat.toggle = function () {
      setOpen(!open)
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createWidget)
  } else {
    createWidget()
  }
})()
