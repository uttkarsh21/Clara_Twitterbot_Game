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

function random_tweet(some_array_length)
{
	var index = Math.floor(Math.random()*some_array_length);
	return index;
}

setInterval(Claras_tweets, 1000*60*60*7);		//every seven hours bot sends out a tweet

Claras_tweets();

function Claras_tweets(){
	var tweet = {
		status: grammar.flatten('#origintweet#')
	}

	//T.post('statuses/update', tweet, tweeted);

//	setTimeout(finding_tweet, 100);
}

function finding_tweet()
{
	find_tweet(grammar.flatten('#originhastags#'));
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

		if(hastag[i] == 'DoctorWho' || hastag[i] == 'TARDIS' || hastag[i] == 'Gallifrey')
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
	console.log(directMsg.direct_message.text);

	var param_dm;

	var hashtag_here = directMsg.direct_message.entities.hashtags;

	for(var i = 0; i < directMsg.direct_message.entities.hashtags.length;i++)
		if(hashtag_here[i].text.toLowerCase() == 'youarebot' || hashtag_here[i].text.toLowerCase() == 'revealyourself' || hashtag_here[i].text.toLowerCase() == 'whoareyou')
			{
				console.log('you win ');

				if(directMsg.direct_message.sender_id_str != '961297109726257153')
					check_winners(directMsg.direct_message.sender_id_str);
			}
		else if(hashtag_here[i].text == 'realclara')
			{
				console.log('you lose ');

				if(directMsg.direct_message.sender_id_str != '961297109726257153')
					check_losers(directMsg.direct_message.sender_id_str);
			}
		else
			{
				param_dm = {
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

				if(directMsg.direct_message.sender_id_str != '961297109726257153')
					setTimeout(posting, 10000);
			}

	function posting()
	{
		post_dm(param_dm)
	}
}

function post_dm(param)
{
		T.post('direct_messages/events/new', param, function(msgSent){
				console.log('sent');
			});
}

//========================================
//It looks for tweets online that it likes
//========================================

//find_tweet('#DoctorWho');

function find_tweet(query)
{
	console.log('query is ' + query);

	var params = {
        q: query + ' -filter:retweets',  // REQUIRED
        result_type: 'mixed',
		  count: '99',
        lang: 'en'
    }
	  T.get('search/tweets', params, function(err, data) {
		//console.log(data);
		
		var tweet =[];
		var count = 0;

		for(var i = 0; i<data.statuses.length; i++)
			{
				if(data.statuses[i].favorite_count > 100)
					{
						tweet[count] = data.statuses[i];
						console.log(data.statuses[i].text);
								console.log(' ');
					count++;
					}
			}
		var index = random_tweet(tweet.length);

		console.log(tweet.length)

		//retweet(tweet[index])
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

		var param_dm;

		if(data.errors == undefined)	//if member then send dm for already winner
			{
			param_dm = {
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

			setTimeout(posting, 10000);
			}
		else	//else send dm for becoming winner
			{
				param_dm = {
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

				setTimeout(posting, 10000);
			}

	function posting()
	{
		post_dm(param_dm)
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

		if(data.errors == undefined)	//if member then send dm for already loser
			{
			param_dm = {
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

			setTimeout(posting, 10000);
			}
		else	//else send dm for becoming loser
			{
				param_dm = {
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

				setTimeout(posting, 10000);
			}
			
	function posting()
	{
		post_dm(param_dm)
	}
	});
}

//==============================
//It adds to losers list
//==============================

function add_loser(id_str)
{
	T.post('lists/members/create', {list_id: '964582257154560001', user_id: id_str}, function (err,data,reponse){
		console.log('added to loser list: ' + id_str);
	});
}

//==============================
//It removes from losers list
//==============================

function remove_loser(id_str)
{
	T.post('lists/members/destroy', {list_id: '964582257154560001', user_id: id_str}, function (err,data,reponse){
		console.log('removed from loser list: ' + id_str);
	});
}

//==============================
//It adds to winners list
//==============================

function add_winner(id_str)
{
	T.post('lists/members/create', {list_id: '964582121015783424', user_id: id_str}, function (err,data,reponse){
		console.log('added to winner list: ' + id_str);
	});
}