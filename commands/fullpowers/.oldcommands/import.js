var request = require('request');
const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");

module.exports = {
    name: 'import',
    description: 'Import data from',
    execute(message, args) {
        const { client } = require("../../index.js");
        if (fullpower.includes(message.author.id)) {
            try {
                let type = args[0];

                const confserv = client.cfgsrvs.get(message.guild.id)
                //console.log(confserv);
                if (!confserv) return message.channel.send({ content: "Ce serveur n'a pas configuré PartyChat" });


                if (type == "MEE6") {
                    request('https://mee6.xyz/api/plugins/levels/leaderboard/' + message.guild.id, function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            var data = JSON.parse(body)
                            message.channel.send("Connected...")
                            playersList = data.players;

                            console.log("--- Starting import ---")
                            // create profiles !
                            for (playerNb in playersList) {

                                let player = playersList[playerNb];

                                let filememberjson = null;
                                // Does Player already exist ?
                                try { // Loading previous if it is exist
                                    const previousfile = JSON.parse(fs.readFileSync(path.resolve(`./servers/${message.guild.id}/members/${player.id}.json`)));
                                    //console.log("fichier précédent rechargé")
                                    filememberjson = previousfile;
                                } catch (err) {
                                    //console.log("pas de fichier précédent à recharger");
                                    filememberjson = {
                                        memberId: player.id,
                                        points: 0,
                                        xp: 0,
                                        level: 0,
                                        badges: [],
                                        stats: {
                                            messages: 0,
                                            reactions: 0,
                                            lastmessage: "",
                                            lasthello: "",
                                            memory: 0,
                                            quiz: 0,
                                            participations: 0
                                        },
                                        events: {
                                            participations: 0,
                                            list: []
                                        }
                                    }
                                }
                                if (filememberjson == null) return message.channel.send("Error while generating new leaderboard")

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

                                const jsonStringcfg = JSON.stringify(filememberjson);
                                fs.writeFile(`./servers/${message.guild.id}/members/${player.id}.json`, jsonStringcfg, err => {
                                    if (err) {
                                        console.log(`Error writing file of ${message.guild.id} - ${player.id}`, err)
                                    } else {
                                        console.log(`Successfully wrote file of ${message.guild.id} - ${player.id}`)
                                    }
                                })
                            }
                            console.log("--- End import ---")
                            message.channel.send("Every user has been updated")
                        } else {
                            console.log("error while connecting : https://mee6.xyz/api/plugins/levels/leaderboard/" + message.guild.id, response.statusCode)
                            console.log(response);
                            message.channel.send("Error while connecting")
                        }
                    })
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