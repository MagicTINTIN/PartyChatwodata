const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const fileManager = require("./fileManager.js");

const xpfactor = 1;
const pointsfactor = 0.1;
const msgfactor = 10;
const reactfactor = 1;

module.exports = {
    // Check general properties of message
    rankinserver: function (guildid, memberid, guildmembercount) {
        const confserv = client.cfgsrvs.get(guildid)
        if (!confserv) return "Not found"
        var classementDict = {};
        const listOfMembers = fs.readdirSync(`./servers/${guildid}/members`).filter(file => file.endsWith('.json'));

        for (const file of listOfMembers) {
            //cmdgifn = require(`../gif/Normal/${file}`);
            try { // Loading previous if it is exist
                //console.log(file);
                const previousfile = JSON.parse(fs.readFileSync(path.resolve(`./servers/${guildid}/members/${file}`)));
                classementDict[file.replace(".json", "")] = confserv.leaderboard.xpfactor * previousfile.xp + confserv.leaderboard.spentpointsfactor * previousfile.stats.spentPoints + confserv.leaderboard.pointsfactor * previousfile.points + confserv.leaderboard.msgfactor * previousfile.stats.messages + confserv.leaderboard.reactfactor * previousfile.stats.reactions + confserv.leaderboard.thankedfactor * previousfile.stats.thanked.length
            } catch (err) {
                //log wtf ?

                console.error(err);
                console.log("-> FILE : " + file);
            }
        }
        //console.log(classementDict);
        // Create items array
        var classementList = Object.keys(classementDict).map(function (key) {
            return [key, classementDict[key]];
        });
        // Sort the array based on the second element
        classementList.sort(function (first, second) {
            return second[1] - first[1];
        });

        let NbOfList = 0;
        let foundInList = false;
        while (NbOfList < classementList.length && !foundInList) {
            if (classementList[NbOfList] && classementList[NbOfList][0] && classementList[NbOfList][0] == memberid)
                foundInList = true;
            else
                NbOfList++;
        }
        // so the first one begin at number 1
        if (confserv.rankcard.rank.type == "talkCountType")
            return (NbOfList + 1) + " / " + (classementList.length + 10);
        else if (confserv.rankcard.rank.type == "memberCountType") {
            NbOfList++;
            if (NbOfList > guildmembercount)
                NbOfList = guildmembercount
            return NbOfList + " / " + guildmembercount;
        }
        else
            return "Config not defined"
    },
}
