const logger = require("./logger.js");
const { Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');
const triggerShop = require("./game/triggerShop.js");
const update = require("./game/update.js");
const gameFunctions = require("./game/gameFunctions.js");

module.exports = {
    // Classic commands
    on: function (reaction, user) {

        if (blacklist.includes(user.id) || user.bot) return

        gameFunctions.onReaction(reaction, user)
    }
}