(function(){

  var getQueryParams = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return name === 'currency' ? 'ETH' : '';
  }

  if (window.location.pathname !== '/search/') { return }
  var searchKey = getQueryParams('w');
  if (!searchKey) {
    return window.location.href = '/';
  }

  var getCoverImg = function(post) {
    // modify by gyx, remove content. decrease content.json size.
    // var coverImgElement = post.content.match(/<img[^>]+src="?([^"\s]+)".*?>/);
    // if (post.cover) imgUrl = post.cover;
    var imgUrl = post.cover || "/images/BITCOIN.png";
    if (!/^\//.test(imgUrl)) imgUrl = '/' + imgUrl;
    imgUrl = imgUrl.replace(/^(\/)?\.\./, '');
    return imgUrl;
  }

  var renderItem = function(results) {
    var dom = '';
    var reg = new RegExp(searchKey, 'g');

    var formatStr = function(str) {
      return str.replace(reg, '<span class="keywords">' + searchKey + '</span>');
    }

    var cdn = '//res.btcstudy.org/btcstudy';

    results.forEach(function(post) {
      dom += (
        '<li>'+
          '<a href="/'+ post.path +'">'+
            '<div class="cover" style="background-image: url(' + cdn + getCoverImg(post) +')">'+
              // '<img src="' + getCoverImg(post) + '" alt="" />'+
            '</div>'+
            '<div class="post-data">'+
              '<h3>' + formatStr(post.title) +'</h3>'+
              '<p>' + formatStr(post.text.substr(0, 90)) + '...</p>'+
              '<div class="post-author-data">'+
                '<img src="' + (post.avatar || "/images/default_avatar.png") + '" alt="avatar" />'+
                '<span>' + post.author + '</span>'+
                '<time>' + post.date + '</time>'+
              '</div>'+
            '</div>'+
          '</a>'+
        '</li>'
      )
    });
    return dom;
  }

  var getResult = function(data) {
    var results = [];

    (data.posts || []).forEach(function(post) {
      if (
        post.title.includes(searchKey) ||
        post.text.includes(searchKey)
      ) {
        results.push(post)
      }
    });
    // console.log(searchKey);
    if (results.length) {
      var titleEl = document.getElementById('key');
      titleEl.innerText = "“" + searchKey + "”";

      var subtitleEl = document.getElementById('result-length');
      subtitleEl.innerText = results.length + ' 篇文章';

      var containerEl = document.getElementById('result-list');
      containerEl.innerHTML = '<ul>'+ renderItem(results) +'</ul>';
      $('#no-data').addClass('hidden');
    } else {
      $('#no-data').removeClass('hidden');
    }
  }

  fetch('/content.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      getResult(myJson);
    });

})();
