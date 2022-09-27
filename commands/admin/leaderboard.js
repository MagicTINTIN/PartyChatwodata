var request = require('request');
const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const { Permissions, Client, MessageEmbed } = require('discord.js');

function normalize(string, n, align = "left", min = 0) {
    if (n < min)
        n = min
    if (string.length >= n)
        return string.substring(0, n)

    const spacestr = " "
    if (align == "left")
        return string + spacestr.repeat(n - string.length)
    else if (align == "right")
        return spacestr.repeat(n - string.length) + string
}

module.exports = {
    name: 'leaderboard',
    description: 'get leaderboard',
    execute(message, args) {
        const { client } = require("../../index.js");
        if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send('Tu n\'est pas administrateur !');
        try {


            const confserv = client.cfgsrvs.get(message.guild.id)
            //console.log(confserv);
            if (!confserv) return message.channel.send({ content: "Ce serveur n'a pas configuré PartyChat" });

            let number = args[0];
            let fullinfo = args[1]

            if (!number)
                number = 20;
            else if (number == "help")
                return message.channel.send("Par défaut retourne les 20 premiers membres. Pour plus indiquer un nombre")
            else
                number = parseInt(number)


            // getting rank list
            var classementDict = {};
            var detail = {};
            const listOfMembers = fs.readdirSync(`./servers/${message.guild.id}/members`).filter(file => file.endsWith('.json'));

            for (const file of listOfMembers) {
                try {
                    const previousfile = JSON.parse(fs.readFileSync(path.resolve(`./servers/${message.guild.id}/members/${file}`)));
                    classementDict[file.replace(".json", "")] = confserv.leaderboard.xpfactor * previousfile.xp + confserv.leaderboard.spentpointsfactor * previousfile.stats.spentPoints + confserv.leaderboard.pointsfactor * previousfile.points + confserv.leaderboard.msgfactor * previousfile.stats.messages + confserv.leaderboard.reactfactor * previousfile.stats.reactions + confserv.leaderboard.thankedfactor * previousfile.stats.thanked.length
                    if (fullinfo && fullinfo == "full")
                        detail[file.replace(".json", "")] = `${normalize(`${confserv.leaderboard.xpfactor}`, 2, "right")}x${normalize(`${previousfile.xp}`, 8, "right")}❇️|${normalize(`${confserv.leaderboard.pointsfactor}`, 3, "right")}x${normalize(`${previousfile.points}`, 7, "right")}🪙|${normalize(`${confserv.leaderboard.spentpointsfactor}`, 3, "right")}x${normalize(`${previousfile.stats.spentPoints}`, 8, "right")}🪙🛒|${normalize(`${confserv.leaderboard.msgfactor}`, 2, "right")}x${normalize(`${previousfile.stats.messages}`, 6, "right")}💬|${normalize(`${confserv.leaderboard.reactfactor}`, 2, "right")}x${normalize(`${previousfile.stats.reactions}`, 4, "right")}🔳|${normalize(`${confserv.leaderboard.thankedfactor}`, 3, "right")}x${normalize(`${previousfile.stats.thanked.length}`, 4, "right")}🤝`
                    else
                        detail[file.replace(".json", "")] = normalize(`${Math.floor(classementDict[file.replace(".json", "")])}`, 20, "right") + " 🏆"
                    //detail[file.replace(".json", "")] = `${confserv.leaderboard.xpfactor}x \`${previousfile.xp}❇️\` + ${confserv.leaderboard.pointsfactor}x \`${previousfile.points}🪙\` + ${confserv.leaderboard.spentpointsfactor}x \`${previousfile.stats.spentPoints}🪙🛒\` + ${confserv.leaderboard.msgfactor}x \`${previousfile.stats.messages}💬\` + ${confserv.leaderboard.reactfactor}x \`${previousfile.stats.reactions}🔳\` + ${confserv.leaderboard.thankedfactor}x \`${previousfile.stats.thanked.length}🤝\``
                } catch (err) {
                    //log wtf ?

                    console.error(err);
                    console.log("-> FILE : " + file);
                }
            }
            // Create items array
            var classementList = Object.keys(classementDict).map(function (key) {
                return [key, classementDict[key], detail[key]];
            });
            // Sort the array based on the second element
            classementList.sort(function (first, second) {
                return second[1] - first[1];
            });

            let NbOfList = 0;
            var msgtosend = "```\n"
            var position = ""
            while (NbOfList < classementList.length && NbOfList < number) {

                if (msgtosend.length > 1700) {
                    message.channel.send(msgtosend + "```")
                    msgtosend = "```\n"
                }

                var memberofposition, infomember;
                if (!classementList[NbOfList] || !classementList[NbOfList][0] || !classementList[NbOfList][2]) {
                    infomember = "No more information"
                    memberofposition = false;
                }
                else {
                    memberofposition = client.users.cache.get(classementList[NbOfList][0]);
                    infomember = classementList[NbOfList][2]
                }
                var membertag;
                if (!memberofposition) {
                    membertag = "Unknown Member#0000"
                } else
                    membertag = memberofposition.tag

                NbOfList++;

                if (NbOfList == 1)
                    position = "🥇"
                else if (NbOfList == 2)
                    position = "🥈"
                else if (NbOfList == 3)
                    position = "🥉"
                else
                    position = `${NbOfList}`
                msgtosend += normalize(position, `${number}`.length, "right", 2) + " - " + normalize(membertag, 22, "right") + " : " + infomember + "\n"
            }

            message.channel.send(msgtosend + "```")

        } catch (error) {
            console.log(error);
            message.channel.send("Une erreur s'est produite")
        }
    }
}