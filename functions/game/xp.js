const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const logger = require("../logger.js");
const fileManager = require("./fileManager.js");

module.exports = {
    // Check general properties of message
    give: function (member, guild, amount) {
        confserv = client.cfgsrvs.get(guild.id)
        if (!confserv) return console.log("nothing found", client.cfgsrvs, guild);;

        filememberjson = fileManager.loadusr(member, guild)
        if (!filememberjson) return console.log("No filemember")
        filememberjson.xp += amount;

        fileManager.saveusr(member, guild, filememberjson);
    },


    set: function (member, guild, amount) {
        confserv = client.cfgsrvs.get(guild.id)
        if (!confserv) return //console.log("nothing found", client.cfgsrvs, guild.id);

        filememberjson = fileManager.loadusr(member, guild)
        if (!filememberjson) return console.log("No filemember")
        filememberjson.xp = amount;

        fileManager.saveusr(member, guild, filememberjson);
    },
}
