var app = {
    initialize: function() {
        $.mobile.defaultPageTransition = 'none';
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        // init Facebook params
        app.initFB();
        
        // Hide the spalsh screen
        navigator.splashscreen.hide();
        
        // Test contacts lookup and filter
		// contactsObj.search("Bri");
		
		// clear localStorage
		// localStorage.clear();
        
        // note that this is an event handler so the scope is that of the event
        // so we need to call app.report(), and not this.report()
        app.report('deviceready');
    },
    report: function(id) {
        console.log("report:" + id);
        // hide the .pending <p> and show the .complete <p>
        document.querySelector('#' + id + ' .pending').className += ' hide';
        var completeElem = document.querySelector('#' + id + ' .complete');
        completeElem.className = completeElem.className.split('hide').join('');
    },
    initFB: function() {
        console.log('Device is ready! Make sure you set your app_id below this alert.');
        FB.init({ appId: "288324391269464", nativeInterface: CDV.FB, useCachedDialogs: false });
        
        // Subscribe to any change events from Facebook
        FB.Event.subscribe('auth.login', function(response) {
                           console.log('auth.login event');
                           });
        
        FB.Event.subscribe('auth.logout', function(response) {
                           console.log('auth.logout event');
                           });
        
        FB.Event.subscribe('auth.sessionChange', function(response) {
                           console.log('auth.sessionChange event');
                           });
        
        FB.Event.subscribe('auth.statusChange', function(response) {
                           console.log('auth.statusChange event');
                           });
    }
};

var beer = {
	to: {},
	getTo: function () {
		return this.to;
	},
	location: {},
	getLocation: function () {
		return this.location;
	},
	select: function(type) {
		localStorage.setItem("type-selected", type);
		
		if(type == 'craft')
		{
			$('#select-craft.unselect').removeClass("unselect");
			$('#select-craft').addClass("select");
			
			$('#select-beer.select').removeClass("select");
			$('#select-beer').addClass("unselect");
			
			/* TODO: clean up this logic to use the price passed in from the other page. */
			$('#price').html('$4.00');
		}
		else
		{
			$('#select-craft.select').removeClass("select");
			$('#select-craft').addClass("unselect");
			
			$('#select-beer.unselect').removeClass("unselect");
			$('#select-beer').addClass("select");
			
			/* TODO: clean up this logic to use the price passed in from the other page. */
			$('#price').html('$3.00');
		}
	},
	send: function () {
		// var number = localStorage.getItem("mobile-number");
        // var number = $("#mobile-num").val();
		var number = "7202616417";

		var to = localStorage.getItem("contact-to-lookup");
		var from = "Ted Coleman";
		var location = localStorage.getItem("current-location");
		
		// Save these for later, and use the getter to get them...
		this.to = to;
		this.location = location;
		
		console.log("Sending beer to..." + to + " at " + location + " from " + from + " using phone number " + number);
		
		$.getJSON('http://www.offsetevil.com/services/sms_rest.php?',
			{
				number: number,
			    to: to,
			    from: from,
				location: location,
			},
			function(data) 
			{
				console.log("SMS sent with data= " + data);

				// Create a success message on the phone
				$("#congrats").html("Well done! You just bought " + beer.getTo() + " a drink at " + beer.getLocation() + "!");
				$("#congrats").fadeIn();
				
				// clear localStorage
				// localStorage.clear();															
			});
	}
};

var contactsObj = {
	contact: {},
    getContact: function() {
        return this.contact;
    },
    search: function(searchCriteria) {
		// cue the page loader 			
		$.mobile.showPageLoadingMsg();
	    // TESTING!!!
        // cue the page loader
        $.mobile.hidePageLoadingMsg();
		
        console.log("searchCriteria= " + searchCriteria);
        // specify contact search criteria
        // var options = new ContactFindOptions();
        // options.filter=searchCriteria;          // empty search string returns all contacts
        // options.multiple=true;                  // return multiple results
        // var fields = ['name', 'phoneNumbers'];               // return contact.displayName field
    
        // find contacts
        // navigator.contacts.find(fields, contactsObj.onSuccess, contactsObj.onError, options);
    },
    // onSuccess: Get a snapshot of the current contacts
    //
    onSuccess: function(contacts) {
        console.log('search onSuccess with contacts.length= ' + contacts.length);
        
        for (var i=0; i<contacts.length; i++)
        {
            console.log(contacts[i].name.formatted);
            console.log(contacts[i].phoneNumbers);
            
            // Set the contact
            contactsObj.contact.formatted = contacts[i].name.formatted;
            
            for(var j=0; j < contacts[i].phoneNumbers.length; j++)
            {
                if(contacts[i].phoneNumbers[j].type == "mobile")
                    contactsObj.contact.mobile = contacts[i].phoneNumbers[j].value;
                
                if(contacts[i].phoneNumbers[j].type == "home")
                    contactsObj.contact.home = contacts[i].phoneNumbers[j].value;

                if(contacts[i].phoneNumbers[j].type == "other")
                    contactsObj.contact.other = contacts[i].phoneNumbers[j].value;
            }
            
            console.log("Mobile Number Check= " + contactsObj.getContact().mobile);

			// display the current contact info
			$("#contact-name").html(contactsObj.getContact().formatted);
			$("#mobile-num").val(contactsObj.getContact().mobile);
			
			// Set the mobile number to local storage
			// TODO: maybe just save the whole contactObj to localStorage??? I think so...
            // TESTING: Commented out to send text value...
			// localStorage.setItem("mobile-number", contactsObj.getContact().mobile);

			// cue the page loader 			
			// $.mobile.hidePageLoadingMsg();
        }
        
        // TESTING!!!
        // cue the page loader
        $.mobile.hidePageLoadingMsg();
    },
    // onError: Failed to get the contacts
    //
    onError: function(contactError) {
        console.log('onError!');
    }
	
};

/** Page bindings for onload events **/
$("#categories").live( "pageshow", function(event) {
    facebook.getLoginStatus();
});

$("#checkins").live( "pagehide", function(event) {
    $("#fb-data ul").remove();
});

$("#checkins").live( "pageshow", function(event) {
	
	//cue the page loader 			
	$.mobile.showPageLoadingMsg();

    // get Facebook accessToken from the facebook variable loaded in fb.js
    var graphUrl = "https://graph.facebook.com/search?type=checkin&access_token=";
    var accessToken = facebook.getAccessToken();
    var profilePicUrl = "https://graph.facebook.com/";
                
    console.log("Request Url= " + graphUrl + accessToken);
	$.getJSON(graphUrl + accessToken,
	    function(data) {
        	// BEGIN HTML5 TEST
          	var items = [];
                    
         	for(var i=0; i<data.data.length; i++)
          	// for(var i=0; i<25; i++)
          	{
	
				var imgSrc = "assets/list/wizard_zelda.png";
				var name = "Ted Coleman";
				var place = "Uptown Tavern";
				var imgSrc = profilePicUrl + data.data[i].from.id  + "/picture";
				var name = data.data[i].from.name;
				var place = data.data[i].place.name;
              	items.push("<li><a href='#selectbeer' data-transition='none'>");
              	items.push("<div class='thumbnail'><img src='"+imgSrc+"'></div>");
              	items.push("<div class='info'><h4>"+name+"</h4><p>"+place+"</p></div>");
				items.push("</a></li>");
        	}
                    
            $('<ul/>', {
       			'data-role': 'listview',
                'data-inset': 'false',
                'data-filter': 'false',
                html: items.join('')
      		}).appendTo('#fb-data');
                    
      		// bind all li's to alert message
    		$('#fb-data li').each(function(index) {
         		$(this).click(function()
           		{
                	localStorage.setItem("contact-to-lookup", $("h4", this).html());
                 	localStorage.setItem("current-location", $("p", this).html());
					$('#nameplate .thumbnail').html($(".thumbnail", this).html());
           		}); 
    		});
                    
     		$("#fb-data ul").listview();
       		$("#fb-data").show();
        
       		//cue the page loader
        	$.mobile.hidePageLoadingMsg();
      		// END HTML5 TEST
		});
});

/** Facebook events and methods **/
var facebook = {
    accessToken: '',
    getAccessToken: function () {
        return this.accessToken;
    },
    login: function() {
        FB.login(function(response)
        {
            if (response.session) {
                 console.log('logged in');
            }
            else {
                 console.log('not logged in');
            }
        },
        { scope: 'user_status, friends_status' });
    },
    getLoginStatus: function() {
        console.log('Attempting to login to Facebook...');
        FB.getLoginStatus(function(response) {
            if (response.status == 'connected') {
                console.log('logged in');
                          
                // Set the accessToken
                facebook.accessToken = response.authResponse.accessToken;
                          
                // console.log('logged in with accessToken= ' + this.accessToken);
                console.log('getAccessToken()= ' + facebook.getAccessToken());
            }
            else {
                console.log('not logged in');
            }
        });
    },
    logout: function() {
        FB.logout(function(response) {
            console.log('the user is logged out.');
        });
    },
    permissions: function() {
        
        // get Facebook accessToken from the facebook variable loaded in fb.js
        var graphUrl = "https://graph.facebook.com/me/permissions?access_token=";
        var accessToken = facebook.getAccessToken();
        
        $.getJSON(graphUrl + accessToken,
            function(data)
            {
                  console.log("permissions: " + JSON.stringify(data.data[0]));
            });
    },
    promptExtendedPermissions: function() {
        FB.login(function()
            {
                 setAction("The 'friends_status' permission has been granted.", false);
                 setTimeout('clearAction();', 2000);
            }, {scope: 'friends_status'});
    }
};

/** Pageshow/Pagehide events **/
$('#home').live("pageshow", function() {

});

$('#selectbeer').live("pageshow", function() {
  	/*$('#nameplate').slideDown(1400, function() {
		console.log('buyabeer is showing now.');
  	});*/
	showNameplate();
});
$('#selectbeer').live("pagehide", function() {
	hideNameplate();
});


$("#confirm").live( "pageshow", function(event) {	
	$("#contact-name h2").html(localStorage.getItem("contact-to-lookup"));
	
	// get the selected freind from localStorage
	contactsObj.search(localStorage.getItem("contact-to-lookup"));
	
	$("#send-beer").click( function()
       {
         	beer.send();
       }
    );
});

function showNameplate() {
	$("#nameplate .info h2").html(localStorage.getItem("contact-to-lookup"));
	$("#nameplate .info p").html(localStorage.getItem("current-location"));
	
	$('#nameplate').animate({
        marginTop: '0px'
    }, 500);
}
function hideNameplate() {
	$('#nameplate').animate({
        marginTop: '-117px'
    }, 100);
}