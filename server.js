/*
 * Intro  : example Twitter OAuth and OAuth2 client which works with EJS in express.js 
 * Date   : 27-11-2013
 * Author : Milian
 */

var express = require('express')
  , request = require("request")
  qs = require("qs");

var config = require('./config.js');
console.log(config.PORT);

var oauth = require('oauth');

var app = express();

app.use(express.cookieParser("tweet much?"));
app.use(express.session());
app.use(express.static(__dirname));

var _twitterConsumerKey = config.TWITTER_CONSUMER_KEY;
var _twitterConsumerSecret = config.TWITTER_CONSUMER_SECRET;
console.log("_twitterConsumerKey: %s and _twitterConsumerSecret %s", _twitterConsumerKey, _twitterConsumerSecret);
var _twitterTimelineUrl = "https://api.twitter.com/1.1/statuses/user_timeline.json?";
var _twitterFriendsUrl = "https://api.twitter.com/1.1/friends/list.json?";


var oa =  new oauth.OAuth('https://api.twitter.com/oauth/request_token', 
    'https://api.twitter.com/oauth/access_token', 
     _twitterConsumerKey, 
     _twitterConsumerSecret, 
     "1.0A", 
     config.HOSTPATH+'/callback', 
     "HMAC-SHA1");

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');


app.get('/', function(req, res){
//console.log(str);
//  ejs.render(str);

res.render('index', {
    title: "Twitter example",
    header: "Some users"
  });
  
  
});

app.get('/connect', function(req, res){
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
      if (error) {
      res.send("Error getting OAuth request token : " + error);
    } else { 
			req.session.oauth = {};
            req.session.oauth.token = oauth_token;
            req.session.oauth.token_secret = oauth_token_secret;

            res.redirect("https://twitter.com/oauth/authenticate?oauth_token=" + oauth_token);
		}
  });
});


app.get('/callback', function(req, res){

    if (req.session.oauth !== undefined) {
			req.session.oauth.verifier = req.query.oauth_verifier;
			var oauth = req.session.oauth;
        
			oa.getOAuthAccessToken(oauth.token, oauth.token_secret, oauth.verifier, function(error, oauth_access_token, oauth_access_token_secret, results) {
            if (error) {
                console.log(error);
                res.end("Error occured with callback: " + error);
            } else {
                req.session.oauth.access_token = oauth_access_token;
                req.session.oauth.access_token_secret = oauth_access_token_secret;
                req.session.oauth.screen_name = results.screen_name;

				res.render('callback', {
					title: "Twitter Connected",
					name: results.screen_name,
					response: results
				  });
			}
        });
	}
});
app.get('/Profile',function(req,res){
	 if (req.session.oauth !== undefined) {
					oa.get("https://api.twitter.com/1.1/account/verify_credentials.json",
								req.session.oauth.access_token,
								req.session.oauth.access_token_secret,
								function (error, data, response) {
						data = JSON.parse(data);								
						//res.send(data);
						res.render('Profile', {
							title: "Twitter Profile",
							user: data
						  });
					});	
   }
});

app.get('/Timeline',function(req,res){
	 
	     if (req.session.oauth !== undefined && req.session.oauth.screen_name !== undefined) {
    				 var params = {
							screen_name: req.session.oauth.screen_name,
							count:10
					 };
	    var url = _twitterTimelineUrl + "screen_name=twitterapi&count=2" ;
        var oauth = {
            consumer_key: _twitterConsumerKey,
            consumer_secret: _twitterConsumerSecret,
            token: req.session.oauth.access_token,
            token_secret: req.session.oauth.access_token_secret
        };
        request.get({
            url: url,
            oauth: oauth,
            json: true
        }, function(error, response, body) {
            //data = JSON.parse(data);								
			//res.send(body);
			res.render('Timeline', {
				title: "Twitter Timeline",
				name: req.session.oauth.screen_name,
				user: body
			});
        });
    } else {
        res.redirect("/");
    }
});


// Try out the access_token by making an API call
app.get("/Friends", function(req, res) {
    if (req.session.oauth !== undefined && req.session.oauth.screen_name !== undefined) {
        var params = {
            screen_name: req.session.oauth.screen_name
        };
        var url =  _twitterFriendsUrl + qs.stringify(params);
        var oauth = {
            consumer_key: _twitterConsumerKey,
            consumer_secret: _twitterConsumerSecret,
            token: req.session.oauth.access_token,
            token_secret: req.session.oauth.access_token_secret
        };
        request.get({
            url: url,
            oauth: oauth,
            json: true
        }, function(error, response, body) {
            if (error) {
                console.log("Error occured: " + error);
            } else {
                output = "<h1>@" + req.session.oauth.screen_name + "'s friends</h1>";
                
				var users =  [];
				
				for (var i = 0; i < body.users.length; i++) 
				{
					obj = {};
					obj['image'] = body.users[i].profile_image_url;
					obj['name'] = body.users[i].screen_name;
					users.push(obj);
                }
				
				res.render('Friends', {
					title: "Twitter Friends",
					name: req.session.oauth.screen_name,
					users: users
				  });

            }
        });
    } else {
        res.redirect("/");
    }
});


app.listen(parseInt(config.PORT || 80));
