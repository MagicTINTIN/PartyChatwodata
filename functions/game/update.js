const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const fileManager = require("./fileManager.js");
const xpandpt = require("./xpandpoints.js");

const badwords = JSON.parse(fs.readFileSync(path.resolve(`./config/badwords.json`)));

function checkBadwords(msg) {
    badwordlist = badwords.filter(word => msg.content.toLowerCase().includes(word));
    return badwordlist;
}


function updateLevel(fileManager, confserv, sendMessageInfo) {
    for (let lvl = 0; lvl < confserv.levels.length; lvl++) {

        if (confserv.levels[lvl].levelName != "undefined" && fileManager.xp >= confserv.levels[lvl].xpmin) {
            // add role
            if (fileManager.level < lvl) {
                if (sendMessageInfo && confserv.events.onNextLvl.announceInMp)
                    try {
                        fileManager.level = lvl;
                        console.log(fileManager.memberId + " got messaged for lvl " + lvl);
                        client.users.cache.get(fileManager.memberId).send(confserv.events.onNextLvl.message
                            .split("$lvl").join(lvl))
                    }
                    catch (err) {
                        //
                    }
            }

            if (!fileManager.badges.includes(confserv.levels[lvl].levelName)) {
                fileManager.badges.push(confserv.levels[lvl].levelName)
            }
        }

    }
    return fileManager;
}

module.exports = {
    lvl: function (usrJsonToUpdate, servConf, sendmsg) {
        return updateLevel(usrJsonToUpdate, servConf, sendmsg)
    },

    message: function (memberid, guild, xp, points) {
        var confserv = client.cfgsrvs.get(guild.id)
        if (!confserv || blacklist.includes(memberid)) return
        var filememberjson = fileManager.loadusr(memberid, guild)
        if (!filememberjson) return console.log("No filemember in message reward")
        filememberjson.stats.messages += 1;
        filememberjson.xp += xp;
        filememberjson.points += points;

        filememberjson = updateLevel(filememberjson, confserv, true);

        fileManager.saveusr(memberid, guild, filememberjson);
    },

    reaction: function (memberid, guild, messageid, xp, points) {
        var confserv = client.cfgsrvs.get(guild.id)
        if (!confserv || blacklist.includes(memberid)) return
        var filememberjson = fileManager.loadusr(memberid, guild)
        if (!filememberjson) return console.log("No filemember in reaction reward")

        if (filememberjson.stats.reactionList.includes(messageid)) return

        filememberjson.stats.reactions += 1;
        filememberjson.stats.reactionList.push(messageid)
        filememberjson.xp += xp;
        filememberjson.points += points;

        filememberjson = updateLevel(filememberjson, confserv, true);

        fileManager.saveusr(memberid, guild, filememberjson);
    },

    boost: function (memberid, guild, xp, points) {
        var confserv = client.cfgsrvs.get(guild.id)
        if (!confserv || blacklist.includes(memberid)) return
        var filememberjson = fileManager.loadusr(memberid, guild)
        if (!filememberjson) return console.log("No filemember in boost reward")

        if (!filememberjson.badges.includes("formerbooster"))
            filememberjson.badges.push("formerbooster")

        filememberjson.stats.hasboosted.push(Date.now())
        filememberjson.xp += xp;
        filememberjson.points += points;

        filememberjson = updateLevel(filememberjson, confserv, true);

        fileManager.saveusr(memberid, guild, filememberjson);
    },


    thanks: function (gver, rcvr, guild, gxp, gpoints, rxp, rpoints) {
        var datetime = Date.now()
        var confserv = client.cfgsrvs.get(guild.id)
        if (!confserv) return "Remerciement impossible : Le serveur n'a pas configuré PartyChat"
        if (blacklist.includes(gver)) return "Tu es banni du réseau Chaline. Tu ne peux donc pas utiliser les fonctions de PartyChat"
        if (blacklist.includes(rcvr)) return "Impossible de remercier ce membre."
        var gverJson = fileManager.loadusr(gver.user.id, guild)
        var rcvrJson = fileManager.loadusr(rcvr.user.id, guild)
        if (!gverJson || !rcvrJson) { console.log("No filemember for gver or rcver in thanks reward"); return "Une erreur est survenue lors du remerciement."; }
        if (!gverJson.canThank) return "Tu es partiellement banni de PartyChat, raison : " + gverJson.cantThankReason
        var thankTimeout = gverJson.stats.lastthank + confserv.events.onThanks.thankCooldown
        var nottimeoutmsg = "Tu dois attendre " + (Math.floor((thankTimeout - datetime) / 60000)) + "min et " + (Math.floor((thankTimeout - datetime - Math.floor((thankTimeout - datetime) / 60000) * 60000) / 1000)) + "s avant de pouvoir donner un Merci"
        if (datetime < thankTimeout) return nottimeoutmsg
        // giver update
        if (gpoints < 0 && gverJson.points < Math.abs(gpoints) && !(gverJson.isGod || gverJson.specialRole.includes("free"))) return "Tu n'as pas assez de points pour offrir ton Merci, " + (Math.abs(gpoints) - gverJson.points) + " points manquants"
        gverJson.xp += gxp;
        if (gpoints > 0 || !(gverJson.isGod || gverJson.specialRole.includes("free")))
            gverJson.points += gpoints;
        gverJson.stats.lastthank = datetime;
        gverJson.stats.thanks.push({ thanked: rcvr.user.id, time: datetime })

        gverJson = updateLevel(gverJson, confserv, true)

        // receiver update
        if (rcvrJson.thankable == true) {
            rcvrJson.xp += rxp;
            rcvrJson.points += rpoints;
            rcvrJson.stats.thanked.push({ thanker: gver.user.id, time: datetime })

            rcvrJson = updateLevel(rcvrJson, confserv, true)
        }



        fileManager.saveusr(gver.user.id, guild, gverJson);
        fileManager.saveusr(rcvr.user.id, guild, rcvrJson);
        return "Tu viens de remercier " + rcvr.user.tag
    },
}
