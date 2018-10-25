var converter = new showdown.Converter()
window.bindHeader()

var posts = []
var primary = {}

function getPrimaryPost () {
  MobileUI.ajax.get(CONFIG.URL_API + '/posts?primary=true').end(function (err, res) {
    document.getElementById('loading-primary').style.display = 'none'
    getPosts()
    if (err) {
      var msg = 'Não foi possível listar post em destaque neste momento, tente mais tarde!'
      document.getElementById('msg-primary').innerHTML = msg
      document.getElementById('msg-primary').style.display = 'block'
      return
    }
    primary = res.body.data[0]
    document.getElementById('cover-primary').style.backgroundImage = 'url(' + primary.image + ')'
    document.getElementById('info-primary').style.display = 'block'
  })
}

getPrimaryPost()

function getPosts () {
  MobileUI.ajax.get(CONFIG.URL_API + '/posts').end(function (err, res) {
    document.getElementById('loading-posts').style.display = 'none'
    if (err) {
      var msg = 'Não foi possível listar posts neste momento, tente mais tarde!'
      document.getElementById('msg-posts').innerHTML = msg
      document.getElementById('msg-posts').style.display = 'block'
      return
    }
    posts = res.body.data
  })
}

MobileUI.formatDate = function (datetime) {
  return moment(Number(datetime)).fromNow()
}

function showPost (_id) {
  console.log(_id)
  openPage('post', doneOpenPost)
}

function doneOpenPost () {
  window.bindHeader('header-post')
  var descriptionHtml = converter.makeHtml(description)
  document.getElementById('description-post').innerHTML = descriptionHtml
}

function openUrlPost () {
  var link = 'https://tecnospeed.com.br'
  if (window.cordova && window.cordova.InAppBrowser) {
    window.cordova.InAppBrowser.open(link, '_blank', 'location=yes,hidenavigationbuttons=yes,hideurlbar=yes')
  } else {
    var win = window.open(link, '_blank')
    win.focus()
  }
}
