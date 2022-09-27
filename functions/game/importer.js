var request = require('request');
const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const fileManager = require('../../functions/game/fileManager.js');

const simulation = false
var nBElementsInSim = 5

module.exports = {
    api: async function (message, args) {


        function dlFromMEE6Api(message, pageNb, confserv) {
            return new Promise(resolve => {
                if (simulation) {
                    console.log("connecting to : " + pageNb);
                    if (pageNb < nBElementsInSim)
                        setTimeout(() => {

                            console.log("Connected...")
                            resolve(["liste non finie", false])
                        }, 500);
                    else
                        setTimeout(() => {

                            console.log("Connection ended")
                            resolve(["fin de la liste", true])
                        }, 500);
                }
                else
                    request('https://mee6.xyz/api/plugins/levels/leaderboard/' + message.guild.id + "?page=" + pageNb, function (error, response, body) {
                        console.log("connecting to : " + pageNb);
                        if (!error && response.statusCode == 200) {
                            var data = JSON.parse(body)
                            console.log("Connected...")
                            var playersList = data.players;



                            //////////////

                            if (!playersList || data.players == [] || playersList == []) {
                                endOfList = true;
                                resolve(["every user has been updated", true])
                            } else {
                                var nbplayerupdated = 0
                                for (playerNb in playersList) {

                                    let player = playersList[playerNb];

                                    let filememberjson = fileManager.loadusr(player.id, message.guild, true);

                                    if (!filememberjson || filememberjson == null) return message.channel.send("Error while generating new leaderboard")

                                    filememberjson.xp = player.xp;
                                    filememberjson.points = Math.floor(player.xp / (confserv.events.onMessage.xpMax / confserv.events.onMessage.pointsMax));
                                    filememberjson.stats.messages = player.message_count;

                                    for (let lvl = 0; lvl < confserv.levels.length; lvl++) {

                                        if (confserv.levels[lvl].levelName != "undefined" && filememberjson.xp >= confserv.levels[lvl].xpmin) {
                                            // add role
                                            filememberjson.level = lvl;

                                            if (!filememberjson.badges.includes(confserv.levels[lvl].levelName)) {
                                                filememberjson.badges.push(confserv.levels[lvl].levelName)
                                            }
                                        }

                                    }

                                    fileManager.saveusr(player.id, message.guild, filememberjson)

                                    nbplayerupdated++
                                }
                                if (nbplayerupdated == 0)
                                    resolve(["no more user to update", true])
                                else
                                    resolve(["**not** every user has been updated", false])
                            }
                        }
                        else {
                            console.log("Error while connecting to ?page=" + pageNb)
                            console.log(response)
                            //console.error(error);
                            resolve(["error while connecting ?page=" + pageNb, true])
                        }

                    })
            })

        }



        const { client } = require("../../index.js");
        if (fullpower.includes(message.author.id)) {
            try {
                let type = args[0];

                const confserv = client.cfgsrvs.get(message.guild.id)
                //console.log(confserv);
                if (!confserv) return message.channel.send({ content: "Ce serveur n'a pas configuré PartyChat" });


                if (type == "MEE6") {

                    var endOfList = false;
                    var pageNb = 0;
                    var loopNb = 0;
                    var logArray = []


                    console.log("--- Starting import ---")
                    // create profiles !


                    while (!endOfList && loopNb < 100) {
                        console.log("Page n°" + loopNb)
                        const lastpagefound = await dlFromMEE6Api(message, loopNb, confserv)
                        console.log(lastpagefound);
                        logArray.push(lastpagefound)
                        if (lastpagefound[1])
                            endOfList = true
                        else
                            loopNb++;


                    }


                    console.log("--- End import ---", logArray[logArray.length - 1][0])
                    message.channel.send("End importation : " + logArray[logArray.length - 1][0])
                }
                else {
                    message.channel.send("I can't import data from " + args[0])
                }


            } catch (error) {
                console.log(error);
                message.channel.send("Une erreur s'est produite")
            }
        }
    }
}