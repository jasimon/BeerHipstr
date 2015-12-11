$('document').ready(function() {
  $('.beerme').on('click', function() {
    $.ajax({
      url: "/beerme"
    }).done(function (data) {
      console.log(data);
      var source = $('#beer-info-template').html();
      var template = Handlebars.compile(source);
      
      $('.show-init').hide();
      $('.results-container').html(template(data.beer));

      $('.last-ten').empty();

      for (var i = 0; i < data.lastTen.length; i++) {
        $('.last-ten').append('<li>' + (i+1) + '. ' + data.lastTen[i].name + ' ' + moment(data.lastTen[i].date).format('YYYY/MM/DD') + '</li>');
      }
    })
  });
})