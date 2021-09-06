(function(){
  console.log(2);

  fetch('https://dop-api.btcstudy.org/dop-api/opendoc?tab=ez6e97&id=DWGtsaUl2bmVuT3pj&outformat=1&normal=1')
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      console.log(9, myJson);
    });

}())
