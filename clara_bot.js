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
		console.log('I think something went wrong');
	else {
		console.log('tweeted-' + data.text);
	}
}

//Claras_tweets();
setInterval(Claras_tweets, 1000*60*60*7);		//every seven hours bot sends out a tweet

function Claras_tweets(){
	var tweet = {
		status: grammar.flatten('#origin#')
	}

	T.post('statuses/update', tweet, tweeted);
}

var stream = T.stream('user');	//setting user stream for interaction features with Clara

setInterval(make_friends, 1000*60*60*24);

function make_friends()
{
	var check_followers = [];

	//check who follows you
	T.get('followers/ids', { screen_name: 'skywardrown' },  function (err, data, response) {
	check_followers = data.ids;
	console.log(check_followers);
	})

	//check your friends
	stream.on('friends', function (friendsMsg) {
	console.log(friendsMsg);
	for(var i = 0; i<=friendsMsg.friends.length;i++)
		{	
			for(var j = 0; j<=check_followers.length;j++)
				{	
					//if followers are not friends then friend them in their twitter face
					if(check_followers[j] != friendsMsg.friends[i])
						{
								T.post('friendships/create', { id: check_followers[j] },  function (err, data, response) {
								console.log(data.name);
								});
						}
				}
		}
	})
}

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

	var hastag = [];
	for(var i = 0; i<event.entities.hashtags.length;i++)
		hastag[i] = event.entities.hashtags[i].text;

	var favourite = event.favorited;
	var retweet = event.retweeted;
	console.log('replyto: ' + replyto + ' text: ' + text + ' from: ' + from)	
	for(var i = 0; i<event.entities.hashtags.length;i++)
		console.log(' hastag: ' + hastag[i]);

//	Clara_reply(text);
}

function Clara_reply(reply, hastag){
	var tweet = {
		status : reply + hastag
	}

	T.post('statuses/update', tweet, tweeted);
}