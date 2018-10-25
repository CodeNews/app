window.request = {
  getPrimaryPost: function (callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/posts?primary=true').end(callback)
  },
  getPosts: function (callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/posts').end(callback)
  },
  getPost: function (id, callback) {
    MobileUI.ajax.get(CONFIG.URL_API + '/posts?id=' + id).end(callback)
  }
}
