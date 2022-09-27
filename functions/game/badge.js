const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const fileManager = require("./fileManager.js");

module.exports = {
    give: function (member, guild, badgename) {
        confserv = client.cfgsrvs.get(guild.id)
        if (!confserv) return console.log("nothing found", client.cfgsrvs, guild);;

        filememberjson = fileManager.loadusr(member, guild)
        if (!filememberjson) return console.log("No filemember")
        filememberjson.badges.push(badgename)

        fileManager.saveusr(member, guild, filememberjson);
    }
}
