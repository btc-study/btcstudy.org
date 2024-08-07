(function(){

  var renderPostList = function(data) {
    var sortByDate = function(a, b) {
      return b.dateSource - a.dateSource;
    }
    var postList = data.filter(function(item) { return item.title });
    $('.mempool-length').text(postList.length + ' 篇文章');
    var dom = '';
    dom += '<ul>';
    postList
      .sort(sortByDate)
      .forEach(function(item) {
        var avatar = item.avatar || "url_for()"
        dom += (
          '<li>'+
              '<a href="'+ item.url +'" target="_blank">'+
                '<strong>'+ item.title +'</strong>'+
                '<div>'+
                  // '<img class="mr-1" src="' + (item.avatar || "/images/default_avatar.png") + '" alt='+ item.author +' />'+
                  // '<span>'+ item.author +'</span>'+
                  '<time class="has-text-grey" datetime="'+ item.date+'">'+ (item.date || '') +'</time>'+
                '</div>'+
                '<i class="iconfont icon-icon_into"></i>'+
              '</a>'+
          '</li>')
      });
    dom += '</ul>';
    $('.mempool-list').html(dom);
  }


  var getPostData = function(data) {
    try {
      var getPostTitle = function(data) {
        return data[2][1];
      }
      var getPostUrl = function(data) {
        return data[6];
      }
      // var getAuthor = function(data) {
      //   return data[2][1];
      // }
      // var getAvatar = function(data) {
      //   return data[6];
      // }
      var getPostData = function(data) {
        return data[2][1];
      }
      var formatPostData = function(data) {
        var date = new Date(Math.round((data - 25569) * 86400 * 1000));
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + (date.getDate() + 1);
      }
      var columns = 3;
      var listObj = (data.clientVars.collab_client_vars.initialAttributedText.text[0][2][0].c[1] || []);
      var listArr = Object.keys(listObj).slice(columns);
      var rows = [];
      var sources = [];
      for (var i = 0; i < listArr.length; i += columns) {
        sources.push(listArr.slice(i, i + columns))
      }
      sources.forEach(function(item, index) {
        rows[index] = {};
        item.forEach(function(key, index2) {
          var title, url, author, avatar, date;
          switch ((index2 + 1) % columns) {
            case 1:
              if (listObj[key][2]) {
                rows[index].title = getPostTitle(listObj[key]);
              }
              break;
            case 2:
              if (listObj[key][6]) {
                rows[index].url = getPostUrl(listObj[key]);
              }
              break;
            case 0:
              if (listObj[key][2]) {
                var dateSource = getPostData(listObj[key])
                rows[index].dateSource = dateSource;
                rows[index].date = formatPostData(dateSource);
              }
              break;
            default:
              console.log(listObj[key]);
          }
        });
      });
      renderPostList(rows);
    } catch (e) {
      console.log(e);
    }
  }

  fetch('https://dop-api.btcstudy.org/dop-api/opendoc?tab=ez6e97&id=DWGtsaUl2bmVuT3pj&outformat=1&normal=1')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      getPostData(myJson);
    });

}())
