const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const points = require("./points.js");
const xp = require("./xp.js");
const xpandpt = require("./xpandpoints.js");
const update = require("./update.js");
const fileManager = require("./fileManager.js");
const { message } = require('./update.js');
const { Permissions } = require('discord.js');

const badwords = JSON.parse(fs.readFileSync(path.resolve(`./config/badwords.json`)));

function checkBadwords(msg) {
    badwordlist = badwords.filter(word => msg.content.toLowerCase().includes(word));
    return badwordlist;
}

const donotrewardoncommand = ["&leaderboard", "&fimport", "&import", "&forceroles", "&forcebadges"]

module.exports = {
    // Check general properties of message
    onMessage: function (message) {

        if (!message.guild || blacklist.includes(message.author.id) || message.author.bot || donotrewardoncommand.includes(message.content.split(" ")[0])) return

        var confserv = client.cfgsrvs.get(message.guild.id)
        if (!confserv) return

        var suspiciousWords = checkBadwords(message);
        if (suspiciousWords.length > 0) return;

        var amountxp, amountpoints;

        if (message.content.length < 500) {
            amountxp = confserv.events.onMessage.xpMin + Math.ceil(message.content.length * (confserv.events.onMessage.xpMax - confserv.events.onMessage.xpMin) / 500);
            amountpoints = Math.ceil(message.content.length * confserv.events.onMessage.pointsMax / 500);
        } else if (message.content.length < 1700) {
            amountxp = confserv.events.onMessage.xpMax + Math.floor(message.content.length / 200);
            amountpoints = confserv.events.onMessage.pointsMax + Math.floor(message.content.length / 400);
        } else {
            amountxp = 1;
            amountpoints = 1;
        }
        var memberinfo = message.guild.members.cache.get(message.author.id);

        if (memberinfo && memberinfo.premiumSinceTimestamp > 0) {
            amountxp = Math.ceil(amountxp * confserv.xpBoostFactor)
            amountpoints = Math.ceil(amountpoints * confserv.pointsBoostFactor)
        }

        update.message(message.author.id, message.guild, amountxp, amountpoints)
    },


    onReaction: function (reaction, user) {
        var message = reaction.message

        if (!message.guild || blacklist.includes(message.author.id) || user.bot) return

        var confserv = client.cfgsrvs.get(message.guild.id)
        if (!confserv) return
        var amountxp, amountpoints;

        amountxp = confserv.events.onReaction.xp;
        amountpoints = confserv.events.onReaction.points;

        var memberinfo = message.guild.members.cache.get(user.id);

        if (memberinfo && memberinfo.premiumSinceTimestamp > 0) {
            amountxp = Math.ceil(amountxp * confserv.xpBoostFactor)
            amountpoints = Math.ceil(amountpoints * confserv.pointsBoostFactor)
        }

        update.reaction(user.id, message.guild, message.channel.id + "-" + message.id, amountxp, amountpoints)
    },


    onBoost: function (member) {

        if (blacklist.includes(member.id) || member.user.bot) return

        var confserv = client.cfgsrvs.get(member.guild.id)
        if (!confserv) return
        var amountxp, amountpoints;

        amountxp = confserv.events.onBoost.xp;
        amountpoints = confserv.events.onBoost.points;

        update.boost(member.id, member.guild, amountxp, amountpoints)
    },


    onThanks: function (giver, receiver, interaction, origin) {
        const { client, botchannels } = require("../../index.js");
        //console.log(giver);
        var confserv = client.cfgsrvs.get(interaction.guild.id)
        if (giver.user.id == receiver.user.id)
            return interaction.reply({ content: "Bah dis donc ça va l'égo ? ah c'est bien les humains ça. Se remercier quand quelque chose se passe bien et dire que c'est la faute de l'autre quand ça se passe mal.\nBref, que ma gamelle va pas se remplir toute seule.", ephemeral: true })
        else if (!confserv)
            return interaction.reply({ content: "Ce serveur n'a pas configuré PartyChat", ephemeral: true })
        else if (blacklist.includes(giver.user.id) || giver.user.bot)
            return interaction.reply({ content: "Tu es banni de l'utilisation de PartyChat", ephemeral: true })
        else if (botchannels.chalineBotsID.includes(receiver.user.id))
            return interaction.reply({ content: "C'est très mignon de nous dire merci.\n*m'enfin on aurait préféré des croquettes*", ephemeral: true })
        else if (blacklist.includes(receiver.user.id) || receiver.user.bot)
            return interaction.reply({ content: "Tu ne peux bien dire merci à ce membre, mais il ne recevra pas de cadeau", ephemeral: true })

        var xpr, ptr;
        if (giver.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            xpr = confserv.events.onThanks.adminXpReceiver;
            ptr = confserv.events.onThanks.adminPointsReceiver;
        } else {
            xpr = confserv.events.onThanks.xpReceiver;
            ptr = confserv.events.onThanks.pointsReceiver;
        }

        try {
            var thankresult = update.thanks(giver, receiver, interaction.guild, confserv.events.onThanks.xpGiver, confserv.events.onThanks.pointsGiver, xpr, ptr)
            interaction.reply({ content: '\u200B' + thankresult, ephemeral: true })

            logger.all(giver.user.tag + "(" + giver.user.id + ") a remercié " + receiver.user.tag + "(" + receiver.user.id + ")")
        } catch (err) {
            interaction.reply({ content: "Une erreur est survenue lors du remerciement", ephemeral: true })
        }
    }
}
