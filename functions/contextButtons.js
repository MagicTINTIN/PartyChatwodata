const { token, appID } = require('../config/credentials.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType } = require('@discordjs/builders');
const logger = require('./logger');
const { Client, MessageEmbed, Permissions } = require('discord.js');
const cmd = require('../commands/universal/cmd');
const fileManager = require("./game/fileManager.js");

const gmfct = require("./game/gameFunctions.js");

module.exports = {
    // load context menu commands
    loadCoMenus: function () {
        return console.log("◽ refreshing is already done with (/)")
        var coMenuButtons = []
        const rest = new REST({ version: '9' }).setToken(token);

        console.log('Refreshing ◽ contextMenu.');
        // public commands

        coMenuButtons.push(new ContextMenuCommandBuilder()
            .setName("Merci")
            .setType(2) // for USER type
        );
        coMenuButtons.push(new ContextMenuCommandBuilder()
            .setName("Merci")
            .setType(3) // for Message type
        );

        coMenuButtonsjson = coMenuButtons.map(command => command.toJSON());
        rest.put(Routes.applicationCommands(appID), { body: coMenuButtonsjson })
            .then(() => console.log('◽ contextMenu a été rechargé.'))
            .catch(console.error);
    },
    msgTriggered: function (interaction) {
        //console.log(interaction);
        if (interaction.commandName == 'Merci')
            gmfct.onThanks(interaction.member, interaction.targetMessage.member, interaction, interaction.targetMessage)
        else interaction.reply({ content: "Cette fonction n'est pas encore disponible", ephemeral: true });
    },
    usrTriggered: function (interaction) {
        //console.log(interaction);
        console.log("user interact");
        if (interaction.commandName == 'Merci')
            gmfct.onThanks(interaction.member, interaction.targetMember, interaction, "user")
        else interaction.reply({ content: "Cette fonction n'est pas encore disponible", ephemeral: true });
    },
}