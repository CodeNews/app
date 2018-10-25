window.bindHeader = function (idElm) {
  var headers = !idElm ? document.querySelectorAll('.header') : [document.getElementById(idElm)]

  for (var i = 0; i < headers.length; i++) {
    if (headers[i].config !== undefined) continue
    var config = {}
    config.scrollHeight = Number(headers[i].getAttribute('scrollHeight'))
    config.topClass = headers[i].getAttribute('topClass')
    config.bottomClass = headers[i].getAttribute('bottomClass')
    config.enableTransition = headers[i].getAttribute('enableTransition')
    var elm = headers[i]
    if (!elm.classList.contains('header')) {
      elm.classList.add('header')
    }
    config.scrollHeight = config.scrollHeight || 100
    config.topClass = config.topClass || ''
    config.topClass = config.topClass.split(' ')
    config.bottomClass = config.bottomClass || ''
    config.bottomClass = config.bottomClass.split(' ')
    config.enableTransition = config.enableTransition === undefined || config.enableTransition === null || config.enableTransition === 'true' || config.enableTransition === '1' || config.enableTransition === true
    if (elm.config) {
      for (x in elm.config.bottomClass) { elm.classList.remove(elm.config.bottomClass[x]) }
      for (x in elm.config.topClass) { elm.classList.remove(elm.config.bottomClass[x]) }
    }
    elm.config = config
    elm.parentNode.querySelectorAll('.content')[0].onscroll = () => {
      if (elm.parentNode.querySelectorAll('.content')[0].scrollTop <= elm.config.scrollHeight) {
        for (x in elm.config.topClass) { elm.classList.add(elm.config.topClass[x]) }
        for (x in elm.config.bottomClass) { elm.classList.remove(elm.config.bottomClass[x]) }
      } else {
        for (x in elm.config.bottomClass) { elm.classList.add(elm.config.bottomClass[x]) }
        for (x in elm.config.topClass) { elm.classList.remove(elm.config.topClass[x]) }
      }
    }
    if (elm.parentNode.querySelectorAll('.content')[0].scrollTop <= elm.config.scrollHeight) {
      for (x in elm.config.topClass) { elm.classList.add(elm.config.topClass[x]) }
      for (x in elm.config.bottomClass) { elm.classList.remove(elm.config.bottomClass[x]) }
    } else {
      for (x in elm.config.bottomClass) { elm.classList.add(elm.config.bottomClass[x]) }
      for (x in elm.config.topClass) { elm.classList.remove(elm.config.topClass[x]) }
    }
    if (elm.config.enableTransition) {
      elm.classList.add('transition-enabled')
    } else {
      elm.classList.remove('transition-enabled')
    }
    elm.update = function (config) {
      window.Header.create(elm, config)
    }
  }
}
