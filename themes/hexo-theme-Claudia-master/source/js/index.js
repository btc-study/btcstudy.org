function initialTheme() {

  var setTheme = function(theme) {

    $('#theme-btn').removeClass('icon-icon_light');
    $('#theme-btn').removeClass('icon-icon_dark');
    $('#theme-btn').addClass('icon-icon_' + (['auto', 'light'].includes(theme) ? 'dark' : 'light'));

    $("body > .body-container").removeClass('appearance-auto');
    $("body > .body-container").removeClass('appearance-dark')
    $("body > .body-container").removeClass('appearance-light')
    $("body > .body-container").addClass('appearance-' + theme);

    $('.slide-theme-' + theme).removeClass('hidden');

    $('.logo-light').addClass('hidden');
    $('.logo-dark').addClass('hidden');
    $('.logo-' + theme).removeClass('hidden');

    window.localStorage.setItem('theme', theme);
  }


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
