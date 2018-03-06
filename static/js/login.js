function signInCallback(authResult) {
	var state = document.getElementById("state").getAttribute("data-name");
	if (authResult['code']){
		$('#signInButton').attr('style','display: none');
		$.ajax({
			type: 'POST',
			url: '/gconnect?state='+state,
			processData: false,
			contentType: 'application/octet-stream; charset=utf-8',
			data: authResult['code'],
			success: function(result){
				if (result){
					$('#result').html('Login successful!</br>'+result+'</br>Redirecting...')
					setTimeout(function(){
						window.location.href = '/';
					},800);
				}
				else if(authResult['error']){
					console.log("There was an error: "+ authResult['error']);
				}
				else
				{
					$('#result').html("Failed to make server side call, check your configuration and console.");
				}
			}
		});
	}
}

window.fbAsyncInit = function() {
	FB.init({
	    appId      : '1670709856310032',
	    cookie     : true,  // enable cookies to allow the server to access
	                        // the session
	    xfbml      : true,  // parse social plugins on this page
	    version    : 'v2.8'	 // use version 2.8
    });
};
// Load the SDK asynchronously
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
	js.src = "//connect.facebook.net/en_US/sdk.js";
	fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function sendTokenToServer() {
	var state = document.getElementById("fbstate").getAttribute("data-name");
	var access_token = FB.getAuthResponse()['accessToken'];
	console.log("Fetching your acess_token");
	console.log(access_token);
	FB.api('/me',function(response){
		console.log("successful login for: "+ response.name);
		$.ajax({
			type: 'POST',
			url: '/fbconnect?state='+state,
			processData: 'false',
			data: access_token,
			contentType : 'application/octet-stream; charset=utf-8',
			success : function(result){
				if(result){
					$('#result').html('Login successful!</br>'+result+'</br>Redirecting...')
					setTimeout(function(){
						window.location.href = '/';
					},800);
				}
				else{
					$('#result').html("Failed to make server side call, check your configuration and console.");
				}
			}
		});
	});
}
$(document).ready(function(){
                    setTimeout(function() {
            			$('#messages').fadeOut('fast');
            		}, 7000);
        		});