console.log('clara start here');

var Twit = require('twit');	//twit being used to interact with twitter's API

var config = require('./config');	//all the keys and tokens requred to initialize twit with twitter's API

var tracery = require('tracery-grammar');	//tracery node version needed to make grammar for bot's tweets'

var trace_grammar = require('./trace_grammar');	//grammar for tracery kept in seperate file

//create grammar with tracery
var grammar = tracery.createGrammar(trace_grammar);
grammar.addModifiers(tracery.baseEngModifiers); 

console.log(grammar.flatten('#origin#'));

var T = new Twit(config);	//initializing twit with Clara's twitter account keys and tokens 

var stream = T.stream('user');	//setting user stream for interaction features with Clara

//function to check if the tweet went through or not
function tweeted(err, data, response)
{
	if(err)
		console.log('I think something went wrong');
	else {
		console.log('tweeted-' + data.text);
	}
}

setInterval(Claras_tweets, 1000*60*60*7);		//every seven hours bot sends out a tweet

function Claras_tweets(){
	var tweet = {
		status: grammar.flatten('#origin#')
	}

	T.post('statuses/update', tweet, tweeted);
}

stream.on('follow', followed);	//follow event call function followed

function followed(event){
	console.log('someone just followed you');
	var name = event.source.name;
	var screen_name = event.source.screen_name;

	follow_clara(' @' + screen_name + 'thanks for following me');
}

function follow_clara(txt){
	var tweet = {
		status : txt 
	}

	T.post('statuses/update', tweet, tweeted);
}

stream.on('tweet', reply_to_Clara);	//on tweet event call reply_to_clara

function reply_to_Clara(event){
	console.log('someone just replied to you');

	var fs = require('fs');
	var json = JSON.stringify(event, null, 2);
	fs.writeFile("tweet.json",json)	

	//get all the required information from the reply meta data
	var replyto = event.in_reply_to_screen_name;
	var text = event.text;
	var from = event.user.screen_name;

	var hastag = [];
	for(var i = 0; i<event.entities.hashtags.length;i++)
		hastag[i] = event.entities.hashtags[i].text	

	var favourite = event.favorited;
	var retweet = event.retweeted	
	console.log('replyto: ' + replyto + ' text: ' + text + ' from: ' + from)	
	for(var i = 0; i<event.entities.hashtags.length;i++)
		console.log(' hastag: ' + hastag[i]);

	Clara_reply(text,replyto,from,hastag,favourite,retweet);
}

function Clara_reply(txt,replyto,from,hastag,favourite,retweet){
	var tweet = {
		status : txt 
	}
}

