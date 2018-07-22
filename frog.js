/*
  Author: Desmond Grey
  Version: 2.5
  Laste Date Updated: 3/24/2018
  
  Chocolate Frog Card Bot
*/

const Discord = require('discord.js');
const client = new Discord.Client();
const MESSAGE_CHAR_LIMIT = 2000;
var schedule = require('node-schedule');
const talkedRecently = new Set();

const sql = require("sqlite");
sql.open("./chococard.sqlite");

var usedArray = '';
var res = '';
var frogs = false;
var playRes = 0;
var randomSelect = 0;

var j = schedule.scheduleJob('00 00 05 * * *', function(){
	console.log("Database Reset.")
	sql.run("UPDATE users SET drawn_times = " + 0);
});

client.on('ready', () => {
  console.log('I am ready!');
});

//this is a listener. It waits for a message and listens to see if the message starts with a certain command
client.on('message', message => {
 if (message.channel.type === "dm") 
	 return; // Ignore DM channels.
 if (message.author.bot)
	 return;
  if(talkedRecently.has(message.author.id) && message.content.toUpperCase() === "C!FROG")
  {
	  message.reply("Please stop spamming this command.");
		return;
  }
 if(message.content.toUpperCase() === "C!FROG")
 {
	//50-common 35-uncommon 14- rare 1- legendary
	 randomSelect = Math.floor(Math.random()*100) +1;
	 talkedRecently.add(message.author.id);
	 if(randomSelect <=50)
	 {
		 /**playRes = Math.floor(Math.random()*commonArray.length);
		 usedArray = commonArray;**/
		 
		 sql.get("SELECT * FROM commonCards ORDER BY RANDOM() LIMIT 1").then(row => {
				usedArray = row.name;
		 }).catch(() => {
			 console.error;
			message.reply("There was an error obtaining Common Card Collection"); 
		 });
	 }
	 else if(randomSelect > 50 && randomSelect <= 85)
	 {
		 /**playRes = Math.floor(Math.random()*uncommonArray.length);
		 usedArray = uncommonArray;**/
		  sql.get("SELECT * FROM uncommonCards ORDER BY RANDOM() LIMIT 1").then(row => {
				usedArray = row.name;
		 }).catch(() => {
			 console.error;
			message.reply("There was an error obtaining Uncommon Card Collection"); 
		 });
	 }
	 else if(randomSelect > 81 && randomSelect <= 99)
	 {
		/** playRes = Math.floor(Math.random()*rareArray.length);
		 usedArray = rareArray; **/
		 
		  sql.get("SELECT * FROM rareCards ORDER BY RANDOM() LIMIT 1").then(row => {
				usedArray = row.name;
		 }).catch(() => {
			 console.error;
			message.reply("There was an error obtaining Rare Card Collection"); 
		 });
	 }
	 else if(randomSelect > 99)
	 {
		 /**playRes = Math.floor(Math.random()*legendArray.length);
		 usedArray = legendArray;**/
		  sql.get("SELECT * FROM LegendCards ORDER BY RANDOM() LIMIT 1").then(row => {
				usedArray = row.name;
		 }).catch(() => {
			 console.error;
			message.reply("There was an error obtaining Legendary Card Collection"); 
		 });
		 
	 }
	 // playRes = Math.floor(Math.random()*frogArray.length);
	  var da = Date.now()
	  //var timeRes = 
		
	 sql.get("SELECT * FROM users WHERE userId = '" +message.author.id + "'").then(row => {
		if(row)
		 {
			 if(row.drawn_times <= 2)
			 {
				 sql.run("UPDATE users SET drawn_times =" + (row.drawn_times+1) + ", time_stamp =" + da +" WHERE userId = '" + message.author.id +"'");
				 
				 if(row.drawn_times >=3)
				 {
					 frogs = true;
				 }
			 }
			 else if(row.drawn_times >= 3)
			 {
				message.reply("You're gonna get sick if you keep eating chocolate!");
				frogs = true;
			 }
		 }
		 else
		 {
			  sql.run("INSERT INTO users (userId, time_stamp, drawn_times) VALUES (?, ?, ?)", [message.author.id, da, 1]);
		 }
		
		 }).catch(() => {
			 sql.run("CREATE TABLE IF NOT EXISTS users (userId TEXT, time_stamp TEXT, drawn_times INTEGER)").then(() => {
				  sql.run("INSERT INTO users (userId, time_stamp, drawn_times) VALUES (?, ?, ?)", [message.author.id, da, 1]);
	  
    });
  });

  setTimeout(delayTime2,250);
  setTimeout(()=>{
				// Removes the user from the set after 2.5 seconds
				talkedRecently.delete(message.author.id);
				}, 3000);
 }
 else if(message.content.toUpperCase() === "C!HELP")
 {
	 message.reply("Available Commands:\n"
	 +"**c!help**: Use this command to verify what commands can be used.\n" 
	 +"**c!frog**: Use this command to draw chocolate frog cards. Limited to three a day.\n" 
	 +"**c!cards* *<collection_type>*: Use this command to view your card collection by type. Leave the collection type blank to view your ENTIRE collection. \n"
	 +"**c!read** *<firstname> <lastname>*: Use this command to read a card's description.\n"
	 +"**c!userinfo**: Use this command to share your user info for card trading.\n"
	 +"**c!trade** *<other_user_id>* *<firstname> <lastname>*: Use this command to trade your card with another user. Ex: c!trade 123456 Albus Dumbledore.\n"
	 +"**c!add** *<other_user_id>* *<firstame> <lastname>*: Use this command to add a card to a user's collection. **ADMIN ONLY!**\n"
	 +"**c!remove** *<other_user_id>* *<firstame> <lastname>*: Use this command to remove a card to a user's collection. **ADMIN ONLY!**\n"
	 +"**c!reset** *<other_user_id>*: Use this command to reset a user's card draws. Leave the user ID out to reset it for the entire playerbase. **ADMIN ONLY!**");
 }
 else if(message.content.toUpperCase() === "C!USERINFO")
 {
	message.reply(message.author.id); 
 } 
 
 var contents = message.content.trim().split(" ");
 if(contents[0].toUpperCase() === "C!READ_CARD" || contents[0].toUpperCase() === "C!READ")
 {
	var contentis = contents.shift();
	var cardDesc = contents.join(" ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
	
	if(cardDesc === undefined)
	{
		message.reply("You try to read a card, but you look down at your hand and you see that there's nothing there. You suddenly feel sad.");
	}
	else
	{
		sql.get("SELECT * FROM cards WHERE name ='" + cardDesc + "' COLLATE NOCASE").then(row => {
			 if(!row)
			 {
				 message.reply("That card does not exist.");
			 }
			 else
			 {
				 message.reply("**" + row.name + "**, *" +row.type + "* : " + row.card_desc);
			 }
		  }).catch(() =>{
		 console.error;
		 message.reply("There was an error reading this card.");
	 });
	 }
}
 else if(contents[0].toUpperCase() === "C!CARDS")
 {
	var contentis = contents.shift();
	contents.join(" ").toLowerCase();
	var colType = contents.shift();
	//message.reply(colType);
	
 sql.get('SELECT * FROM userTab WHERE userId =' + message.author.id).then(row => {
	
	 if(!row)
	 {
		 message.author.send("You don't have any cards.");
	 }
	 else
	 {
		 if(colType === undefined)
		 {
			sql.each("SELECT * FROM userTab, cards WHERE userTab.name = cards.name AND userTab.userId=" + message.author.id, function(err, row) {  
			
			  res = res + "**" + row.name + "** - *" + row.type + "* - **[x" + row.num_cards + "]**\n";
			}).catch(()=> {
				console.error;
				message.reply("There was an error trying to retrieve your card collection");
			});
			message.reply("Information has been DM'd to you.");
			//have to set a delay so sql can run, else results are sent empty
			setTimeout(delayTime, 250);
		 }
		 else
		 {
			 colType = colType.toLowerCase();
			if(colType != "common" && colType != "uncommon" && colType != "rare" && colType != "legendary")
			{
				message.reply("That's not a correct card collection type.");
			}
			else
			{
				sql.each("SELECT * FROM userTab, cards WHERE userTab.name = cards.name AND userTab.userId= '" + message.author.id + "' AND cards.type = '" + colType + "' COLLATE NOCASE", function(err, row) {  			
				  res = res + "**" + row.name + "** - *" + row.type + "* - **[x" + row.num_cards + "]**\n";
				}).catch(()=> {
					console.error;
					message.reply("There was an error trying to retrieve your card collection");
				});
				message.reply("Information has been DM'd to you.");
				//have to set a delay so sql can run, else results are sent empty
				setTimeout(delayTime, 250);
			}
		 }
		
	 }
  
 }).catch(() => {
    console.error;
    sql.run("CREATE TABLE IF NOT EXISTS userTab (userId TEXT, name TEXT, num_cards INTEGER)").then(() => {
       message.author.send("You don't have cards.");
    });
 });	
 }
 
 else if(contents[0].toUpperCase() == "C!TRADE")
 {
	var contentis = contents.shift();
	contents.join(" ").toLowerCase();
	var userID = contents.shift();
	var cardName = contents.join(" ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
	
	if(userID === undefined)
	{
		message.reply("Trading with a ghost is not allowed.");
	}
	else if(userID === message.author.id)
	{
		message.reply("Why are you trying to trade your own cards with... yourself?");
	}
	else if(cardName === undefined || cardName === '')
	{
		message.reply("You can't just *not* give a person a card if you're trying to trade with them!");
	}
	else
	{
		sql.get("SELECT * FROM users WHERE userId = '" + userID +"'").then(row => {
			if(!row)
			{
				message.reply("This user does not exist.");
			}
			else
			{
				sql.get("SELECT * FROM userTab WHERE userId = '" + message.author.id + "' AND name = '" + cardName + "' COLLATE NOCASE").then(row2 => {
					if(!row2)
					{
						message.reply("You don't have this card, or this card does not exist.");
					}
					else
					{
						if(row2.num_cards <= 0)
						{
							message.reply("You no longer have this card.");
						}
						else
						{
							 sql.run("UPDATE userTab SET num_cards ="+ (row2.num_cards-1) +" WHERE userId =" + message.author.id+" AND name ='" + cardName+"' COLLATE NOCASE");
							 
							 sql.get("SELECT * FROM userTab WHERE userId = '" + userID + "' AND name = '" + cardName + "' COLLATE NOCASE").then(row3 => {
								 if(!row3)
								 {
									  sql.run("INSERT INTO userTab (userId, name, num_cards) VALUES (?, ?, ?)", [userID, cardName, 1]);
									  message.reply("Trade successful.");
								 }
								 else
								 {
									 sql.run("UPDATE userTab SET num_cards ="+ (row3.num_cards+1) +" WHERE userId ='" + userID+"' AND name ='" + cardName+"'");
									 message.reply("Trade successful.");
								 }
							 }).catch(() => {
								console.error;
								message.reply("There was an error reading other user's card collection.");
						});
						}
					}
				}).catch(() =>{
					console.error;
					message.reply("There was an error reading your card collection.");
				});
			}
		}).catch(() =>{
			console.error;
			message.reply("There was an error trying to find user.");
		});
		
	}
 }
 
 else if(contents[0].toUpperCase() == "C!ADD")
 {	
	if(message.member.roles.find("name", "Admin"))
	{
		var contentis = contents.shift();
		contents.join(" ").toLowerCase();
		var userID = contents.shift();
		var cardName = contents.join(" ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
		
		if(userID === undefined)
		{
			message.reply("Please enter UserID.");
		}
		else if(cardName === undefined || cardName === '')
		{
			message.reply("Please enter a card name.");
		}
		else
		{
			sql.get("SELECT * FROM users WHERE userId = '" + userID +"'").then(row => {
				if(!row)
				{
					message.reply("This user does not exist.");
				}
				else
				{
					sql.get("SELECT * FROM cards WHERE name = '" + cardName + "' COLLATE NOCASE").then(row0 => {
						if(!row0)
						{
							message.reply("This card does not exist.");
						}
						else
						{
					
							sql.get("SELECT * FROM userTab WHERE userId = '" + userID + "' AND name = '" + cardName + "' COLLATE NOCASE").then(row2 => {
								if(!row2)
								{
									sql.run("INSERT INTO userTab (userId, name, num_cards) VALUES (?, ?, ?)", [userID, cardName, 1]);
									message.reply("Added card to user's collection successfully.");
								}
								else
								{
									 sql.run("UPDATE userTab SET num_cards ="+ (row2.num_cards+1) +" WHERE userId ='" + userID+"' AND name ='" + cardName+"'");
									 message.reply("Added card to user's collection successfully.");
								}
							}).catch(() =>{
								console.error;
								message.reply("There was an error reading user's card collection.");
							});
						}
					
					}).catch(() =>{
						console.error;
						message.reply("There was an error trying to find card in database.");
					});
				}
			}).catch(() =>{
				console.error;
				message.reply("There was an error trying to find user.");
			});
			
		}
	}
	else
	{
		message.reply("You are not an Admin!");
	}
 }
  else if(contents[0].toUpperCase() == "C!REMOVE")
 {	
	if(message.member.roles.find("name", "Admin"))
	{
		var contentis = contents.shift();
		contents.join(" ").toLowerCase();
		var userID = contents.shift();
		var cardName = contents.join(" ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
		
		if(userID === undefined)
		{
			message.reply("Please enter UserID.");
		}
		else if(cardName === undefined || cardName === '')
		{
			message.reply("Please enter a card name.");
		}
		else
		{
			sql.get("SELECT * FROM users WHERE userId = '" + userID +"'").then(row => {
				if(!row)
				{
					message.reply("This user does not exist.");
				}
				else
				{
					sql.get("SELECT * FROM userTab WHERE userId = '" + userID + "' AND name = '" + cardName + "' COLLATE NOCASE").then(row2 => {
						if(!row2)
						{
							message.reply("User does not have this card.");
						}
						else
						{
							if(row2.num_cards <= 0)
							{
								message.reply("User no longer has this card.");
							}
							else
							{
								sql.run("UPDATE userTab SET num_cards ="+ (row2.num_cards-1) +" WHERE userId ='" + userID+"' AND name ='" + cardName+"'");
								message.reply("Removed card from user collection.");
							}
						}
					}).catch(() =>{
						console.error;
						message.reply("There was an error reading user's card collection.");
					});
				}
			}).catch(() =>{
				console.error;
				message.reply("There was an error trying to find user.");
			});
			
		}
	}
	else
	{
		message.reply("You are not an Admin!");
	}
 }
 else if(contents[0].toUpperCase() == "C!RESET")
 {	
	if(message.member.roles.find("name", "Admin"))
	{
		var contentis = contents.shift();
		contents.join(" ").toLowerCase();
		var userID = contents.shift();
		
		if(userID === undefined)
		{
			sql.run("UPDATE users SET drawn_times="+ 0);
			message.reply("Card drawing reset for everyone.");
		}
		else
		{
			sql.get("SELECT * FROM users WHERE userID= '" + userID +"'").then(row => {
				if(!row)
				{
					message.reply("This user does not exist.");
				}
				else
				{
					
					sql.run("UPDATE users SET drawn_times="+ 0 +" WHERE userId='" + userID +"'");
					message.reply("Card drawing reset for User.");
				}
			}).catch(() =>{
				console.error;
				message.reply("There was an error trying to find user.");
			});			
		}
	}
	else
	{
		message.reply("You are not an Admin!");
	}
 }
 function delayTime(){
	 //just time to pass	
	 message.author.send("These are the Chocolate Frog Cards in your collection: \n" + res, {split : true });
	// splitString(res, "","");
			res = '';
 }
 function delayTime2()
 {
	 
	if(!frogs)
	{		
		sql.get("SELECT * FROM userTab WHERE userId=" + message.author.id + " AND name='" +usedArray + "' COLLATE NOCASE").then(row => {
				
			if (!row) 
			{
				sql.run("INSERT INTO userTab (userId, name, num_cards) VALUES (?, ?, ?)", [message.author.id, usedArray, 1]);
			  
			} 
			else
			{
				sql.run("UPDATE userTab SET num_cards="+ (row.num_cards+1) +" WHERE userId=" + message.author.id +" AND name='" + usedArray +"' COLLATE NOCASE");
			}
	  
	  }).catch(() => {
		console.error;
		sql.run("CREATE TABLE IF NOT EXISTS userTab (userId TEXT, name TEXT, num_cards INTEGER)").then(() => {
		  sql.run("INSERT INTO userTab (userId, name, num_cards) VALUES (?, ?, ?)", [message.author.id, usedArray, 1]);
		  
		});
	  });
			 
		 message.reply('You got a **' + usedArray+ '** Chocolate Frog card!');
	}
	frogs = false;
	
 }

client.user.setActivity("Type c!help for help!");
});

//chocobot--> thanks I learned my lesson
client.login('token_here');
//test bot
//client.login('Token_here');
