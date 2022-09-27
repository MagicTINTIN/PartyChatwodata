const logger = require("./logger.js");
const { prefix, gifix } = require('../config/config.json');
const { Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    // Classic commands
    classic: function (message) {
        const { client, botchannels } = require("../index.js");

        if (!message.content.startsWith(prefix) || blacklist.includes(message.author.id) || message.author.bot) return;
        if (message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || whitelist.includes(message.author.id)) {
            const args = message.content.slice(prefix.length).split(/ +/);
            const command = args.shift().toLocaleLowerCase();

            if (!client.commands.has(command)) return;

            try {
                // execute
                client.commands.get(command).execute(message, args);

                // classic log
                logger.all(`${message.author.tag} a utilisé ${message.content} sur ${message.guild.name} dans #${message.channel.name}(${message.channel.id})`);

            } catch (error) {
                console.error(error);
                message.reply("Une erreur est survenue ! (ça tourne mal)");
            }
        }
    }
}