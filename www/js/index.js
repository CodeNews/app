var converter = new showdown.Converter()
window.bindHeader()

var versionApp = 110
var posts = []
var tags = []
var primary = {}
var contributors = []
var post = null
var postId = null
window.enablePullRefresh = true
var filtersIds = localStorage.getItem('filter') || ''
var filterAll = !filtersIds

function validFilterAll () {
  if (!filterAll) {
    document.getElementById('btn-filter').classList.add('using-filter')
  } else {
    document.getElementById('btn-filter').classList.remove('using-filter')
  }
}

validFilterAll()

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
    window.plugins.OneSignal.sendTags({
      versionApp: versionApp
    })
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
    return window.enablePullRefresh && !postId && notSearching() && !contributors.length
  },
  instructionsPullToRefresh: 'Puxe para atualizar...',
  instructionsReleaseToRefresh: 'Solte para atualizar...',
  instructionsRefreshing: 'Atualizando...',
  distIgnore: 150,
  onRefresh: function () {
    getPrimaryPost()
  }
})

function notSearching () {
  return !document.getElementById('header-search').style.display || document.getElementById('header-search').style.display === 'none'
}

function getPosts () {
  window.request.getPosts(function (err, res) {
    document.getElementById('loading-posts').style.display = 'none'
    if (err) {
      var msg = 'Não foi possível listar posts neste momento, tente mais tarde!'
      document.getElementById('msg-posts').innerHTML = msg
      document.getElementById('msg-posts').style.display = 'block'
      return
    }
    posts = bindDataAndTags(res.body.data)
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

function openAboutContributor (url) {
  if (url) {
    openLink(url)
  }
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

function searchText () {
  var q = document.getElementById('input-search').value
  posts = []
  document.getElementById('loading-posts').style.display = 'block'
  window.request.getPosts(q, function (err, res) {
    document.getElementById('loading-posts').style.display = 'none'
    if (err) {
      var msg = 'Não foi possível listar posts neste momento, tente mais tarde!'
      document.getElementById('msg-posts').innerHTML = msg
      document.getElementById('msg-posts').style.display = 'block'
      return
    }
    posts = bindDataAndTags(res.body.data)
  })
}

function bindDataAndTags (data) {
  for (var i in data) {
    data[i].tagsHtml = ''
    for (var t in data[i].tags) {
      data[i].tagsHtml += '<span class="' + data[i].tags[t].color + ' padding text-small margin-right">' + data[i].tags[t].name + '</span>'
    }
  }
  return data
}

function saveLoved () {
  alert('Recurso não disponível nesta versão, aguarde 😉', 'Em breve')
}

function bindKeyPress (e) {
  if (e.keyCode === 13) {
    searchText()
    return false
  }
}

function showSearchText () {
  document.getElementById('header-main').style.display = 'none'
  document.getElementById('header-search').style.display = 'block'
  document.getElementById('header-search').classList.add('header')
  document.getElementById('cover-primary').style.display = 'none'
  document.getElementById('contentMain').classList.add('has-header')
  document.getElementById('input-search').focus()
}

function backSearch () {
  document.getElementById('header-main').style.display = 'block'
  document.getElementById('header-search').style.display = 'none'
  document.getElementById('cover-primary').style.display = 'block'
  document.getElementById('contentMain').classList.remove('has-header')
  getPrimaryPost()
}

function goFilter () {
  openPage('filter', function () {
    window.request.getTags(function (err, res) {
      document.getElementById('loading-tags').style.display = 'none'
      if (err) {
        var msg = 'Não foi possível listar tags neste momento, tente mais tarde!'
        document.getElementById('msg-tags').innerHTML = msg
        document.getElementById('msg-tags').style.display = 'block'
        return
      }
      document.getElementById('list-tags').style.display = 'block'
      tags = res.body.data
      if (filterAll) {
        document.getElementById('checkbox-all-tag').checked = true
      }
    })
  })
}

function goAbout () {
  contributors = []
  openPage('about', function () {
    window.request.getContributors(function (err, res) {
      document.getElementById('loading-contributors').style.display = 'none'
      if (err) {
        var msg = 'Não foi possível listar contribuidores neste momento, tente mais tarde!'
        document.getElementById('msg-contributors').innerHTML = msg
        document.getElementById('msg-contributors').style.display = 'block'
        return
      }
      contributors = res.body.data
    })
  })
}

MobileUI.istagchecked = function (_id) {
  var tagHtml = filtersIds.indexOf(_id) !== -1 || filterAll ? 'checked' : ''
  if (filterAll) {
    tagHtml += ' disabled'
  }
  return tagHtml
}

MobileUI.getdatestart = function (date) {
  console.log(date)
  return '<i class="icon ion-android-calendar"></i> desde ' + moment(Number(date)).format('MM/YYYY')
}

function changeAllTags () {
  filterAll = document.getElementById('checkbox-all-tag').checked
  if (filterAll) {
    for (var i in tags) {
      tags[i].checked = true
    }
  } else {
    for (var i in tags) {
      tags[i].checked = false
    }
  }
  localStorage.removeItem('filter')
}

function validTagsChekedsAndBack () {
  if (!filterAll) {
    filtersIds = ''
    document.querySelectorAll('input[type="checkbox"]').forEach(function (e) {
      if (e.attributes.tagitem && e.checked) {
        if (filtersIds) filtersIds += ','
        filtersIds += e.id
      }
    })
    localStorage.setItem('filter', filtersIds)
  } else {
    localStorage.removeItem('filter')
  }
  if (!filterAll && !filtersIds) return alert('Você deve marcar pelo menos uma tag para ser filtrada!', 'Atenção')
  backPage()
}

document.addEventListener('backPage', function (e) {
  postId = null
  contributors = []
  if (e.detail.page === 'filter.html') {
    validFilterAll()
    getPrimaryPost()
  }
})
