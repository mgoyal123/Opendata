$(document).ready(function(){
    setTimeout(function() {
        $('#messages').fadeOut('fast');
    }, 5000);

    $('#menu_toggle').click(function() {
    	if($('#toggle_icon').attr('class') == 'fa fa-angle-double-left'){
    		$('#toggle_icon').attr('class','fa fa-angle-double-right');
    	}
    	else{
    		$('#toggle_icon').attr('class','fa fa-angle-double-left');
    	}
    })
});
