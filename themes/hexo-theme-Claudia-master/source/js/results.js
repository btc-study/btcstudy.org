(function(){

  var getQueryParams = function(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return name === 'currency' ? 'ETH' : '';
  }

  var searchKey = getQueryParams('w');

  fetch('/content.json')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      getResult(myJson);
    });

  var getCoverImg = function(content) {
    var firstImgElRegx = /<img[^>]+src="?([^"\s]+)".*?>/
    var coverImgElement = content.match(firstImgElRegx);

    if (!coverImgElement) return false;

    return coverImgElement[1];
  }

  var renderItem = function(results) {
    var dom = '';
    var reg = new RegExp(searchKey, 'g');

    var formatStr = function(str) {
      return str.replace(reg, '<span class="keywords">' + searchKey + '</span>');
    }

    results.forEach(function(post) {
      dom += (
        '<li>'+
          '<a href="/'+ post.path +'">'+
            '<div class="cover">'+
              '<img src="' + getCoverImg(post.content) + '" alt="" />'+
            '</div>'+
            '<div class="post-data">'+
              '<h3>' + formatStr(post.title) +'</h3>'+
              '<p>' + formatStr(post.text.substr(0, 120)) + '...</p>'+
              '<div class="post-author-data">'+
                '<img src="' + post.avatar + '" alt="avatar" />'+
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

  var renderNoData = function() {
    return (
      '<img src="/images/no-data.png" alt="" />' +
      '<h1>No result!</h1>'+
      '<p>Please search by another keywords</p>'
    )
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
    console.log(searchKey);
    console.log(data, results);

    if (results.length) {
      var titleEl = document.getElementById('key');
      titleEl.innerText = "“" + searchKey + "”";

      var subtitleEl = document.getElementById('result-length');
      subtitleEl.innerText = results.length + ' articles in total';

      var containerEl = document.getElementById('result-list');
      containerEl.innerHTML = '<ul>'+ renderItem(results) +'</ul>';
    } else {
      var noDataEl = document.getElementById('no-data');
      noDataEl.innerHTML = '<div>'+ renderNoData() +'</div>';
    }
  }

})();
