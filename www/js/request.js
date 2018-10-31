window.request = {
  getPrimaryPost: function (callback) {
    var filter = localStorage.getItem('filter')
    var url = CONFIG.URL_API + '/posts?primary=true'
    if (filter) {
      url += '&filter=' + filter
    }

    MobileUI.ajax.get(url).end(callback)
  },
  getPosts: function (q, callback) {
    var filter = localStorage.getItem('filter')
    var url = CONFIG.URL_API + '/posts'

    if (!callback) {
      callback = q
      if (filter) url += '?filter=' + filter
    } else {
      url += '?q=' + q
    }

    MobileUI.ajax.get(url).end(callback)
  },
  getPost: function (id, callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/posts?id=' + id).end(callback)
  },
  getTags: function (callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/posts/tags').end(callback)
  },
  getContributors: function (callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/contributors').end(callback)
  }
}
