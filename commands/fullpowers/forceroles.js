const fileManager = require('../../functions/game/fileManager.js');
const importer = require('../../functions/game/importer.js');
const fs = require('fs');
const path = require('path');


module.exports = {
    name: 'forceroles',
    description: 'Force role attribution',
    execute(message, args) {
        const { client } = require("../../index.js");

        if (!fullpower.includes(message.author.id)) return


        const confserv = client.cfgsrvs.get(message.guild.id)
        const listOfMembers = fs.readdirSync(`./servers/${message.guild.id}/members`).filter(file => file.endsWith('.json'));

        for (const file of listOfMembers) {
            userfile = fileManager.loadusr(file.replace(".json", ""), message.guild, true)
            member = message.guild.members.cache.get(userfile.memberId)
            if (member) {
                var addedroles = 0
                for (const badge of userfile.badges) {
                    for (const level of confserv.levels) {
                        if (level.levelName == badge)
                            try {
                                member.roles.add(level.roleId)
                                addedroles++
                            } catch (error) {
                                console.log("Impossible de donner rôle " + level.roleId + " à " + member.user.id);
                            }
                    }
                }

                console.log(member.user.id + " + " + addedroles + " roles");
            }
        }
    }
}