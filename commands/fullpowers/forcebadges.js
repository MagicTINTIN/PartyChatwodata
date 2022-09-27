const fileManager = require('../../functions/game/fileManager.js');
const importer = require('../../functions/game/importer.js');
const fs = require('fs');
const path = require('path');


module.exports = {
    name: 'forcebadges',
    description: 'Force badge attribution',
    execute(message, args) {
        const { client } = require("../../index.js");

        if (!fullpower.includes(message.author.id)) return

        if (!args[2])
            return message.channel.send("&forcebadges type(firstmembers) value(100) badgename")
        if (args[0] == "firstmembers") {

            const confserv = client.cfgsrvs.get(message.guild.id)

            var classementDict = {}

            const memberList = message.guild.members.cache//.get(userfile.memberId)

            //console.log(memberList);

            for (const member of memberList) {
                try {
                    classementDict[member[1].joinedTimestamp] = member[1]
                } catch (err) {
                    //log wtf ?

                    console.error(err);
                    console.log("-> MEMBER : " + member);
                }
            }
            // Create items array
            var classementList = Object.keys(classementDict).map(function (key) {
                return [key, classementDict[key]];
            });
            // Sort the array based on the second element
            classementList.sort(function (first, second) {
                return first[0] - second[0];
            });
            //console.log(classementList);
            let NbOfList = 0;
            let memberaffected = 0
            while (NbOfList < classementList.length && memberaffected < parseInt(args[1])) {
                const actmember = classementList[NbOfList][1]
                if (!actmember.user.bot) {
                    var userfile = fileManager.loadusr(actmember.user.id, message.guild, true)
                    userfile.badges.push(args[2])
                    fileManager.saveusr(actmember.user.id, message.guild, userfile, true)
                    memberaffected++
                    console.log(actmember.user.tag + " (" + actmember.user.id + ") + " + args[2] + " badge");
                }
                NbOfList++
            }

        }
    }
}