$('document').ready(function() {
  $('.beerme').on('click', function() {
    $.ajax({
      url: "/beerme"
    }).done(function (data) {
      console.log(data);
      var source = $('#beer-info-template').html();
      var template = Handlebars.compile(source);
      
      $('.show-init').hide();
      $('.results-container').html(template(data));
    })
  });
})