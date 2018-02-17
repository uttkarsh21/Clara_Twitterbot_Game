console.log('clara start here');

var Twit = require('twit');	//twit being used to interact with twitter's API

var config = require('./config');	//all the keys and tokens requred to initialize twit with twitter's API

var tracery = require('tracery-grammar');	//tracery node version needed to make grammar for bot's tweets'

var trace_grammar = require('./trace_grammar');	//grammar for tracery kept in seperate file

//create grammar with tracery
var grammar = tracery.createGrammar(trace_grammar);
grammar.addModifiers(tracery.baseEngModifiers); 

var T = new Twit(config);	//initializing twit with Clara's twitter account keys and tokens 

//function to check if the tweet went through or not
function tweeted(err, data, response)
{
	if(err)
		console.log('I think something went wrong while tweeting');
	else {
		console.log('tweeted-' + data.text);
	}
}

//========================================
//It Tweets
//========================================

setInterval(Claras_tweets, 1000*60*60*7);		//every seven hours bot sends out a tweet

function Claras_tweets(){
	var tweet = {
		status: grammar.flatten('#origintweet#')
	}

	T.post('statuses/update', tweet, tweeted);

	//find tweet
}

//========================================

var stream = T.stream('user');	//setting user stream for interaction features with Clara

//========================================
//It Replies Back
//========================================

stream.on('tweet', reply_to_Clara);	//on tweet event call reply_to_clara

function reply_to_Clara(event){
	console.log('someone just replied to you');

	//write a json file to read metadata with ease
	//var fs = require('fs');
	//var json = JSON.stringify(event, null, 2);
	//fs.writeFile("tweet.json",json);

	//get all the required information from the reply meta data
	var replyto = event.in_reply_to_screen_name;
	var text = event.text;
	var from = event.user.screen_name;
	var idstr = event.user.id_str;

	var hastag = [];
	for(var i = 0; i<event.entities.hashtags.length;i++)
		hastag[i] = event.entities.hashtags[i].text;

	console.log('replyto: ' + replyto + ' text: ' + text + ' from: ' + from)	
	for(var i = 0; i<event.entities.hashtags.length;i++)
	{
		console.log(' hastag: ' + hastag[i]);
		if(hastag[i].toLowerCase() == 'youarebot' || hastag[i].toLowerCase() == 'revealyourself' || hastag[i].toLowerCase() == 'whatareyou')
			console.log(' hastag: ' + hastag[i]);
			//call clara reply and add flag

		if(hastag[i] == 'DoctorWho' || hastag[i] == 'TARDIS')
			console.log(' hastag: ' + hastag[i]);
			favourite(idstr);
	}

//	check flag and Clara_reply(text);
}

function Clara_reply(reply, hashtag){
	var tweet = {
		status : reply + ' #' + hashtag 
	}

	T.post('statuses/update', tweet, tweeted);
}

//========================================
//It Follows
//========================================

setInterval(make_friends, 1000*60*60*3);	//make friends with followers every 3 hours

//setInterval(make_friends, 10000);

function make_friends()
{
var friends = [];
var check_followers = [];
var follower_screen_name = [];
var not_friend = true;

//check who follows you
T.get('followers/list', { screen_name: 'skywardrown' }, function (err, data, response){

	for(var i = 0; i<data.users.length; i++)
		{
		check_followers[i] = data.users[i].id_str;
		follower_screen_name[i] = data.users[i].screen_name;
		}

	//check your friends
	T.get('friends/list', {screen_name: 'skywardrown'}, function (err, data, response) {
	
	for(var i = 0; i<data.users.length; i++)
		friends[i] = data.users[i].id_str;

	console.log('friends testing  ' + data);
	for(var i = 0; i<check_followers.length;i++)
		{
			console.log('follower ' + check_followers[i]);
			not_friend = true;

			for(var j = 0; j<friends.length;j++)
				{	console.log('friend ' + friends[j]);

					//mark if follower is friend or not
					if(check_followers[i] == friends[j])
						{
							not_friend = false;
							break;
						}
				}

			console.log('not friend ' + not_friend);
			console.log('which follower ' + check_followers[i]);
			//if follower not friend then friend them in their twitter face
			if(not_friend)
				{
					T.post('friendships/create', { id: check_followers[i] },  function (err, data, response) {
						console.log('friends ' + data.name);

						//use clara reply here with follow rules grammar tracery
					});
				}
		}
	});
});
}

//========================================
//It Chats
//========================================

stream.on('direct_message', dm_clara);


function dm_clara(directMsg){
	console.log(directMsg);

	var param_dm = {
		"event": {
    		"type": "message_create",
    		"message_create": {
    		  "target": {
    		    "recipient_id": directMsg.direct_message.sender_id_str
    		 	},
    		  "message_data": {
    		    "text": grammar.flatten('#origintweet#'),
    			}
   		}
 		}
	}

	for(var i = 0; i < directMsg.direct_message.entities.hashtags.length;i++)
		if(directMsg.direct_message.entities.hashtags[i].toLowerCase() == 'youarebot' || directMsg.direct_message.entities.hashtags[i].toLowerCase() == 'revealyourself' || directMsg.direct_message.entities.hashtags[i].toLowerCase() == 'whoareyou')
			console.log('postdm ')

	if(directMsg.direct_message.sender_id_str != '961297109726257153')
		setTimeout(posting, 10000);

	function posting()
	{
		post_dm(false,false,param_dm)
	}
}

function post_dm(winner,loser,param)
{
	if(winner)
		console.log('winner');
	else if(loser)
		console.log('loser')
	else
		T.post('direct_messages/events/new', param, function(msgSent){
				console.log('sent');
			});
}

//========================================
//It looks for tweets online that it likes
//========================================

function random_tweet(some_array_length)
{
	var index = Math.floor(Math.random()*some_array_length);
	return index;
}
//find_tweet('#DoctorWho');
function find_tweet(what_hashtag)
{
	var params = {
        q: what_hashtag,  // REQUIRED
        result_type: 'mixed',
        lang: 'en'
    }
	  T.get('search/tweets', params, function(err, data) {
		//console.log(data);
		
		var tweet =[];

		for(var i = 0; i<data.statuses.length; i++)
			{
				if(data.statuses[i].favorite_count > 500)
					tweet[i] = data.statuses[i];
			}
		var index = random_tweet(tweet.length);
		console.log(tweet[index].id_str);
	  });

	
}

//========================================
//It retweets
//========================================

function retweet(id_str)
{
	
	T.post('statuses/retweet/:id', {id: id_str}, function(err,response){
		if(response)
			console.log('retweeted ' + response);
		else
			console.log('something went wrong with the retweet');
	});
}


//==============================
//It favourites
//==============================

function favourite(id_str)
{
	T.post('favorites/create', {id: id_str}, function(err,response){
		if(response)
			console.log('favourited ' + response);
		else
			console.log('something went wrong while favouriting a tweet');
	});
}

//==============================
//It checks winners
//==============================

//check_winners('963527237453697026');

function check_winners(id_str)
{

	var param = {
		list_id: '964582121015783424',
		user_id: id_str
	}

	T.get('lists/members/show', param, function(err,data,response){
		console.log('winners member');
		console.log(data);

		var param_dm = {
		"event": {
    		"type": "message_create",
    		"message_create": {
    		  "target": {
    		    "recipient_id": id_str
    		 	},
    		  "message_data": {
    		    "text": grammar.flatten('#origintweet#'),
    			}
   			}
 			}
		}

		if(data.errors == undefined)	//if member then send dm for winner
			{
			setTimeout(posting, 10000);
			}
		else	//else send dm for not winner ie normal dm
			setTimeout(posting, 10000);

	function posting()
	{
		post_dm(false,false,param_dm)
	}
	});
}

//==============================
//It checks losers
//==============================

function check_losers(id_str)
{
	var param = {
		list_id: '964582257154560001',
		user_id: id_str		
	}

	T.get('lists/members/show', param, function(err,data,response){
		console.log('losers member');
		
		var param_dm = {
		"event": {
    		"type": "message_create",
    		"message_create": {
    		  "target": {
    		    "recipient_id": id_str
    		 	},
    		  "message_data": {
    		    "text": grammar.flatten('#origintweet#'),
    			}
   			}
 			}
		}

		if(data.errors == undefined)	//if member then send dm for loser
			{
			setTimeout(posting, 10000);
			}
		else	//else send dm for not loser ie normal dm
			setTimeout(posting, 10000);

	function posting()
	{
		post_dm(false,false,param_dm)
	}
	});
}