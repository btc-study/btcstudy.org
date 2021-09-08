function bindSearch() {

  var searchInputBtn = document.getElementById('search-input-btn');
  searchInputBtn.onclick = function() {
    var searchInput = document.getElementById('search-input');
    if (searchInput.value) {
      window.location.href = '/search/?w=' + searchInput.value.trim()
    }
  }

  var searchInput = document.getElementById('search-input');
  searchInput.onkeypress = function(e) {
    if (e.key === 'Enter') {
      window.location.href = '/search/?w=' + searchInput.value.trim()
    }
  }
}

function initialTheme() {

  var setTheme = function(theme) {

    $('#theme-btn').removeClass('icon-icon_light');
    $('#theme-btn').removeClass('icon-icon_dark');
    $('#theme-btn').addClass('icon-icon_' + (['auto', 'light'].includes(theme) ? 'dark' : 'light'));

    $("body > .body-container").removeClass('appearance-auto');
    $("body > .body-container").removeClass('appearance-dark')
    $("body > .body-container").removeClass('appearance-light')
    $("body > .body-container").addClass('appearance-' + theme);

    $('#logo-img').attr('src', '/images/' + (['auto', 'light'].includes(theme) ? 'light' : 'dark') + '/logo.png');

    window.localStorage.setItem('theme', theme);

    bindSearch();
  }

  setTheme((['auto', 'light'].includes(window.localStorage.getItem('theme') || 'auto') ? 'light' : 'dark'));

  let buttonenabled = true;
  $(document).on("click", "#theme-btn", function() {

    var localTheme = window.localStorage.getItem('theme') || 'auto';
    var theme = ['auto', 'light'].includes(localTheme) ? 'dark' : 'light';

  	if(!buttonenabled) return;
  	buttonenabled = false;

  	$(".clip").html($("body > .body-container")[0].outerHTML);
    $(".clip .body-container").removeClass("appearance-" + localTheme);
    $(".clip .body-container").addClass("appearance-" + theme);

    $('#theme-btn').removeClass('icon-icon_light');
    $('#theme-btn').removeClass('icon-icon_dark');
    $('#theme-btn').addClass('icon-icon_' + (['auto', 'light'].includes(theme) ? 'dark' : 'light'));

    $('#logo-img').attr('src', '/images/logo-' + theme + '.png');


    $(".clip").addClass("anim");

  	setTimeout(function() {
      $("body > .body-container").replaceWith($(".clip").html())
  		$(".clip").html("").removeClass("anim");
      setTheme(theme);
      buttonenabled = true;
  	}, 500);

  });

}
