$(document).ready(function() {
    		setTimeout(function() {
	    		$('form:first *:input[type!=hidden]:first').focus();
	    	}, 400); 

			$("#download-pkey").hide();
			
			//JS string to array
			//var string = "*.domain1.com, domain2.com,domain3.net, domain4.in,domain5.co, domainsl.com, dofff.in";
			//var string_filtered = string.replace(" ", "");
			//var array = string_filtered.split(",");
			//alert(array[3]);
			
			//Convert comma separated domains to array
			
			//CN = array[0]
			
			//compute SAN from the array
			
		});	
    	
    	
    	var fbButton = document.getElementById('fb-share-button');
    	var url = window.location.href;

    	fbButton.addEventListener('click', function() {
    	    window.open('https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Ffreessl.tech%2F&src=share_button',
    	        'facebook-share-dialog',
    	        'width=600,height=500'
    	    );
    	    return false;
    	});
    	
    	    	
    	var fbLikeButton = document.getElementById('fb-like-button');
    	var url = window.location.href;

    	fbLikeButton.addEventListener('click', function() {
    	    window.open('https://www.facebook.com/freessl',
    	        'facebook-share-dialog',
    	        'width=800,height=600'
    	    );
    	    return false;
    	});
    	
    	    			
    	var TweetButton = document.getElementById('tweet-button');
    	var url = window.location.href;

    	TweetButton.addEventListener('click', function() {
    	    window.open('https://twitter.com/intent/tweet?text=Issued%20my%20Free%20CSR%20from&url=https://freessl.tech&hashtags=FreeSSLCertificate,FreeSSL,Free_SSL_Certificate,Free_SSL&via=free_ssl',
    	        'facebook-share-dialog',
    	        'width=600,height=300'
    	    );
    	    return false;
    	});		