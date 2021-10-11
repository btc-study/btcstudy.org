$(function() {

  var slideMenuVisible = false;

  var showMenu = function () {
    $('.mobile-slide-menu').css('left', 0);
    $('.search-mask').removeClass('hidden');
  }

  var hideMenu = function() {
    $('.mobile-slide-menu').css('left', '-50%');
    $('.search-mask').addClass('hidden');
    slideMenuVisible = false;
  }

  // 移动端菜单栏
  $('.mobile-header-menu').click(function() {
    if (slideMenuVisible) {
      hideMenu();
    } else {
      showMenu()
    }
    slideMenuVisible = !slideMenuVisible;
  });
  $('#mobile-header-logo').click(function() {
    if (slideMenuVisible) {
      hideMenu();
    } else {
      showMenu()
    }
    slideMenuVisible = !slideMenuVisible;
  });

  var setTheme = function(theme) {

    $('#theme-btn').removeClass('icon-icon_light');
    $('#theme-btn').removeClass('icon-icon_dark');
    $('#theme-btn').addClass('icon-icon_' + (['auto', 'light'].includes(theme) ? 'dark' : 'light'));

    $("body > .body-container").removeClass('appearance-auto');
    $("body > .body-container").removeClass('appearance-dark')
    $("body > .body-container").removeClass('appearance-light')
    $("body > .body-container").addClass('appearance-' + theme);

    $("body").removeClass('light');
    $("body").removeClass('dark');
    $("body").addClass(theme);

    $('.slide-theme-dark').addClass('hidden');
    $('.slide-theme-light').addClass('hidden');
    $('.slide-theme-' + theme).removeClass('hidden');

    $('.logo-light').addClass('hidden');
    $('.logo-dark').addClass('hidden');
    $('.logo-' + theme).removeClass('hidden');
    // $('#logo-img').attr('src', '/images/' + (['auto', 'light'].includes(theme) ? 'light' : 'dark') + '/logo.png');
    // $('.mobile-header-logo').attr('src', '/images/' + (['auto', 'light'].includes(theme) ? 'light' : 'dark') + '/logo.png');

    // $('.mobile-header-logo-light').addClass('hidden');
    // $('.mobile-header-logo-dark').addClass('hidden');
    // $('.mobile-header-logo-' + theme).removeClass('hidden');

    window.localStorage.setItem('theme', theme);

    hideMenu()
  }

  $('.slide-menu-light').click(function() {
    setTheme('light');
  });

  $('.slide-menu-dark').click(function() {
    setTheme('dark');
  });

  // 搜索

  $('#search-input-btn').click(function() {
    var value = $('#search-input').val();
    if (value) {
      window.location.href = '/search/?w=' + value.trim()
    }
  });

  $('#search-input').keypress(function(e) {
    if (e.key === 'Enter') {
      var value = $('search-input').val();
      if (value) {
        window.location.href = '/search/?w=' + value.trim()
      }
    }
  })

  $('.mobile-header-searchIcon').click(function() {
    $('.mobile-search-wrap').css('top', 0);
    $('body').css('overflow-y', 'hidden');
    $('.search-mask').removeClass('hidden');
  });

  $('.mobile-search-input-btn').click(function() {
    var value = $('#mobile-search-input').val();
    if (value) {
      window.location.href = '/search/?w=' + value.trim()
    }
  });

  $('#mobile-search-input').keypress(function(e) {
    if (e.key === 'Enter') {
      var value = $('#mobile-search-input').val();
      if (value) {
        window.location.href = '/search/?w=' + value.trim()
      }
    }
  });

  $('.search-mask').click(function() {
    $('.mobile-search-wrap').css('top', -52);
    $('body').css('overflow-y', 'auto');
    $('.search-mask').addClass('hidden');
    hideMenu();
    setTimeout(function() {
      $('#mobile-search-input').val('');
    }, 300);
  });

})
