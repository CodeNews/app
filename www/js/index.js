var converter = new showdown.Converter()
window.bindHeader()

var posts = []
var primary = {}
var post = null
var postId = null
window.enablePullRefresh = true

function clearData () {
  posts = []
  primary = {}
  post = null
  postId = null
  document.getElementById('loading-primary').style.display = 'block'
  document.getElementById('loading-posts').style.display = 'block'
  document.getElementById('cover-primary').style.backgroundImage = ''
  document.getElementById('info-primary').style.display = 'none'
}

document.addEventListener('deviceready', function () {
  var notificationOpenedCallback = function (jsonData) {
    console.log('notificationOpenedCallback: ' + JSON.stringify(jsonData))
  }

  if (window.plugins && window.plugins.OneSignal) {
    window.plugins.OneSignal.startInit('39015cc7-99a8-445c-86be-a047f3a218fe').handleNotificationOpened(notificationOpenedCallback).endInit()
  }
}, false)

function getTagsHtml (tags) {
  var tagsHtml = ''
  if (tags) {
    for (var i in tags) {
      tagsHtml += '<span class="' + tags[i].color + ' padding margin-right">' + tags[i].name + '</span>'
    }
  }

  return tagsHtml
}

MobileUI.getTagsPrimary = function (_id) {
  return getTagsHtml(primary.tags)
}

MobileUI.getTagsPost = function (_id) {
  return getTagsHtml(post.tags)
}

function getPrimaryPost () {
  clearData()
  window.request.getPrimaryPost(function (err, res) {
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

PullToRefresh.init({
  mainElement: '#contentMain',
  shouldPullToRefresh: function () {
    return window.enablePullRefresh && !postId
  },
  instructionsPullToRefresh: 'Puxe para atualizar...',
  instructionsReleaseToRefresh: 'Solte para atualizar...',
  instructionsRefreshing: 'Atualizando...',
  distIgnore: 150,
  onRefresh: function () {
    getPrimaryPost()
  }
})

function getPosts () {
  window.request.getPosts(function (err, res) {
    document.getElementById('loading-posts').style.display = 'none'
    if (err) {
      var msg = 'Não foi possível listar posts neste momento, tente mais tarde!'
      document.getElementById('msg-posts').innerHTML = msg
      document.getElementById('msg-posts').style.display = 'block'
      return
    }
    for (var i in res.body.data) {
      res.body.data[i].tagsHtml = ''
      for (var t in res.body.data[i].tags) {
        res.body.data[i].tagsHtml += '<span class="' + res.body.data[i].tags[t].color + ' padding text-small margin-right">' + res.body.data[i].tags[t].name + '</span>'
      }
    }
    posts = res.body.data
  })
}

MobileUI.formatDate = function (datetime) {
  return moment(Number(datetime)).fromNow()
}

MobileUI.getImgLanguage = function (l) {
  return l === 'en' ? 'img/united-states.png' : 'img/brazil.png'
}

function showPost (_id) {
  postId = _id
  openPage('post', doneOpenPost)
}

function doneOpenPost () {
  window.bindHeader('header-post')
  window.request.getPost(postId, function (err, res) {
    document.getElementById('loading-detail-primary').style.display = 'none'
    document.getElementById('loading-description').style.display = 'none'
    if (err) {
      var msg = 'Não foi possível listar este post neste momento, tente mais tarde!'
      document.getElementById('msg-detail-primary').innerHTML = msg
      document.getElementById('msg-detail-primary').style.display = 'block'
      return
    }

    post = res.body.data
    document.getElementById('cover-detail-primary').style.backgroundImage = 'url(' + post.image + ')'
    document.getElementById('info-detail-primary').style.display = 'block'
    var descriptionHtml = converter.makeHtml(post.description)
    console.log(post)
    document.getElementById('description-post').innerHTML = descriptionHtml
    if (post.url_complete) {
      document.getElementById('btn-more-detail').style.display = 'block'
      document.querySelectorAll('#btn-more-detail button')[0].innerHTML = 'Ver post completo'
    } else if (post.url_original) {
      document.getElementById('btn-more-detail').style.display = 'block'
      document.querySelectorAll('#btn-more-detail button')[0].innerHTML = 'Ver post original'
    }
    document.getElementById('about-contributor').style.display = 'block'
    document.getElementById('photo-contributor').src = post.contributor.photo
    document.getElementById('name-contributor').innerHTML = post.contributor.name
    document.getElementById('start-contributor').innerHTML = '<i class="icon ion-android-calendar"></i> desde ' + moment(Number(post.contributor.date_start)).format('MM/YYYY')
  })
}

function openAboutContributor () {
  openLink(post.contributor.url)
}

function openUrlPost () {
  var link = post.url_complete || post.url_original
  openLink(link)
}

function openLink (link) {
  if (window.cordova && window.cordova.InAppBrowser) {
    window.cordova.InAppBrowser.open(link, '_blank', 'location=yes,hidenavigationbuttons=yes,hideurlbar=yes')
  } else {
    var win = window.open(link, '_blank')
    win.focus()
  }
}

function sharePost () {
  var link = post.url_complete || post.url_original || null
  if (!link) return alert('Este post não tem link para compartilhamento!', 'Atenção')

  if (window.plugins && window.plugins.socialsharing) {
    window.plugins.socialsharing.share(null, null, null, link)
  }
}

function saveLoved () {
  alert('Recurso não disponível nesta versão, aguarde 😉', 'Em breve')
}

document.addEventListener('backPage', function (e) {
  postId = null
})
