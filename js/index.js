$('document').ready(function() {
  $('.beerme').on('click', function() {
    $.ajax({
      url: "/beerme"
    }).done(function (data) {
      console.log(data);
    })
  })
})