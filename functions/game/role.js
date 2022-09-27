const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const fileManager = require("./fileManager.js");

module.exports = {
    give: function (member, guild, rolename) {
        confserv = client.cfgsrvs.get(guild.id)
        if (!confserv) return console.log("nothing found", client.cfgsrvs, guild);;

        filememberjson = fileManager.loadusr(member, guild)
        if (!filememberjson) return console.log("No filemember")
        filememberjson.specialRole += " " + rolename

        fileManager.saveusr(member, guild, filememberjson);
    }
}
