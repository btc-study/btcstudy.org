function initialTheme() {

  var htmlEl = document.getElementsByTagName('html')[0];
  var themeBtnEl = document.getElementById('theme-btn');
  var logoEl = document.getElementById('logo-img');

  var setTheme = function(theme) {
    window.localStorage.setItem('theme', theme);
    
    htmlEl.classList.remove('appearance-auto');
    htmlEl.classList.remove('appearance-dark');
    htmlEl.classList.remove('appearance-light');
    htmlEl.classList.add('appearance-' + theme);

    themeBtnEl.classList.remove('icon-icon_dark');
    themeBtnEl.classList.remove('icon-icon_light');
    themeBtnEl.classList.add('icon-icon_' + (theme === 'light' ? 'dark' : 'light'));

    logoEl.src = '/images/logo-' + theme + '.png';
  }

  setTheme(window.localStorage.getItem('theme') || 'auto');

  themeBtnEl.onclick = function() {
    var theme = window.localStorage.getItem('theme') || 'auto';
    setTheme(['auto', 'light'].includes(theme) ? 'dark' : 'light')
  }

}
