const logger = require("./logger.js");
const { Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');
const triggerShop = require("./game/triggerShop.js");

module.exports = {
    // Classic commands
    other: function (interaction) {
        if (blacklist.includes(interaction.user.id) || interaction.user.bot) return interaction.reply({ content: "Tu es banni de l'utilisation de PartyChat", ephemeral: true });

        // check if it is a actshp whether if it is a menu or button interaction
        var btnOrMenuName = ""
        if (interaction.isSelectMenu()) {
            btnOrMenuName = "[˅ Menu]"
        } else if (interaction.isButton()) {
            btnOrMenuName = "[Bouton]"
        }
        if (interaction.isSelectMenu() || interaction.isButton()) {
            var compfound = false;
            var compRow = 0
            while (compRow < interaction.message.components.length && !compfound) {
                var compNb = 0
                while (compNb < interaction.message.components[compRow].components.length && !compfound) {
                    if (interaction.message.components[compRow].components[compNb].customId == interaction.customId) {

                        compfound = true
                        if (interaction.isSelectMenu()) {
                            btnOrMenuName = `[˅ ${interaction.message.components[compRow].components[compNb].placeholder}]`
                        } else if (interaction.isButton()) {
                            btnOrMenuName = `[${interaction.message.components[compRow].components[compNb].label}]`
                        }
                        btnOrMenuName
                    } else
                        compNb++
                }
                if (compfound) {
                    continue
                } else
                    compRow++
            }
        }

        var interactionReply;
        if (interaction.isButton()) {
            //console.log(interaction);
            if (interaction.customId && interaction.customId.startsWith("actshp"))
                interactionReply = triggerShop.act(interaction.guild, interaction.customId.slice(6), `${btnOrMenuName}`, interaction.member, interaction.channel, "novar")
            else if (interaction.customId && interaction.customId.startsWith("partychatautodelete"))
                interactionReply = triggerShop.autodelete(interaction.message)
            else if (interaction.customId && interaction.customId.startsWith("partychatprocessed"))
                interactionReply = triggerShop.processedbtn(interaction.message)
            else
                interactionReply = "Ce bouton ne fonctionne pas :p"
        } else if (interaction.isSelectMenu()) {
            if (interaction.values[0] && interaction.values[0].startsWith("actshp"))
                interactionReply = triggerShop.act(interaction.guild, interaction.values[0].slice(6), `${btnOrMenuName}`, interaction.member, interaction.channel, "novar")
            else
                interactionReply = "Ce menu ne fonctionne pas :p"
        }
        if (interactionReply == null) return
        else if (interactionReply == "#noMSGrecap#")
            interaction.deferUpdate()
        else
            interaction.reply({ content: "\u200B" + interactionReply, ephemeral: true })
    }
}