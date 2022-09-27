const { Client, MessageEmbed, Permissions } = require('discord.js');
const panels = require("./panels.js")
const exec = require("./exec.js");
const logger = require('../../functions/logger.js');


module.exports = {
    tirggered: async function (message) {

        const filter = i => {
            i.deferUpdate();
            if (i.user.id === message.user.id) {
                return true
            } else {
                i.channel.send({ content: `KSS <@${i.user.id}>, touche pas aux croque- commandes des autres` });
                return false
            }
        };

        const { client } = require("../../index.js");

        if (blacklist.includes(message.user.id) || message.user.bot) {
            if (blacklistinfo[message.user.id]) {
                reasonban = blacklistinfo[message.user.id];
            } else {
                reasonban = "T'as volé les croquettes de la colocat";
            }
            logger.all("Mais " + message.user.tag + " est ban")
            return message.reply({ content: "😾 Tu es __banni__ de l'utilisation du réseau Chaline\nRaison : `" + reasonban + "`", ephemeral: true });
        }

        const command = {
            commandtype: "slash",
            channelID: message.channelId,
            messageID: message.id,
            interaction: message,
            user: message.user,
            member: message.member
        }

        if (devlist.includes(message.user.id) || fullpower.includes(message.user.id) || message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            message.reply(panels.commandtype(command))

            sent = await message.fetchReply()

            sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                .then(i => {

                    // public choice
                    if (i.customId === 'public') {
                        sent.edit(panels.publiclist(command));

                        sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                            .then(interaction => {
                                exec.command(command, sent, { name: interaction.customId, type: "public" })
                            })
                            .catch(err => {
                                console.error(err);
                                console.log(`No command was collected.`)
                                sent.edit(panels.expired(command));
                            });
                    }

                    // admin choice
                    else if (i.customId === 'admin') {
                        sent.edit(panels.adminlist(command));

                        sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                            .then(interaction => {
                                exec.command(command, sent, { name: interaction.customId, type: "admin" })
                            })
                            .catch(err => {
                                console.log(`No command was collected.`)
                                sent.edit(panels.expired(command));
                            });
                    }

                    // dev choice
                    else if (i.customId === 'dev') {
                        sent.edit(panels.devlist(command));

                        sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                            .then(interaction => {
                                exec.command(command, sent, { name: interaction.customId, type: "dev" })
                            })
                            .catch(err => {
                                console.log(`No command was collected.`)
                                sent.edit(panels.expired(command));
                            });
                    }

                    // fullpowers choice
                    else if (i.customId === 'fullpowers') {
                        sent.edit(panels.fullpowerslist(command));

                        sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                            .then(interaction => {
                                exec.command(command, sent, { name: interaction.customId, type: "fullpowers" })
                            })
                            .catch(err => {
                                console.log(`No command was collected.`)
                                sent.edit(panels.expired(command));
                            });
                    }

                })
                .catch(err => {
                    console.error(err);
                    console.log(`No type of command was collected.`)
                    sent.edit(panels.expired(command));
                });

        } else {
            if (message.member.roles.cache.some(role => `<@&${role.id}>` === configcommand) || configcommand === "e" || message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR) || whitelist.includes(message.user.id)) {
                message.reply(panels.publiclist(command))
                sent = await message.fetchReply()
                sent.awaitMessageComponent({ filter, componentType: 'BUTTON', time: 15000 })
                    .then(interaction => {
                        exec.command(command, sent, { name: interaction.customId, type: "public" })
                    })
                    .catch(err => {
                        console.log(`No command was collected.`)
                        sent.edit(panels.expired(command));
                    });
            } else {
                return message.reply({ content: "On dirait que l'administrateur du serveur n'a pas activé les commandes sur ce serveur.", ephemeral: true });
            }
        }



    }
}