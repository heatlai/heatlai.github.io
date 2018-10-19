$(function () {
  $('[data-toggle="tooltip"]').tooltip()
});

$(function (){
    if ( window.location && location.protocol !== 'https:')
    {
        location = 'https://'+location.host+location.pathname;
    }
});
