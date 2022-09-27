const fs = require('fs');
const path = require('path');
const { client } = require("../index.js");
const logger = require("./logger.js");



/*function checkBadwords(msg) {
    badwordlist = badwords.filter(word => msg.content.toLowerCase().includes(word));
    return badwordlist;
}*/


module.exports = {
    // Check general properties of message
    general: function (message) {
        // Check if the message is safe for community
        /*suspiciousWords = checkBadwords(message);
        if (suspiciousWords.length > 0 && !message.author.bot) {
            logger.all(`${message.author.tag} a dit ${suspiciousWords.toString()} dans ${message.channel.name}`);
        }*/
    },
    reactChaline: async function (message) {
        if (configreact === '1') {
            if (message.content.startsWith('PartyChat') && !message.author.bot) { message.reply("T'as envie de jouer ?"); }
        }
    }
}
