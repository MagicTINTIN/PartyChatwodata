const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions, DiscordAPIError, MessageSelectMenu } = require('discord.js');
const fs = require('fs');
const path = require('path');
const other = require("../../functions/other.js");

const maxBtnInaRow = 5;
const maxRow = 4;


module.exports = {

    menu: function () {
        row = new MessageActionRow()
        listChoiceSelection = []
        rowMenuNumber = 1;
        choiceitem = 1
        customidPart = 1
        rowNb = 1
        choicesList = actStep.choicesList

        for (const choice of choicesList) {
            // if we didn't reach the limit of propositions
            if (choiceitem <= 24) {
                choiceitem += 1
            }
            // if we do
            else {
                // only one menu per row
                //add element
                row.addComponents(
                    new MessageSelectMenu()
                        .setCustomId('menuChoice' + customidPart)
                        .setPlaceholder('Choisissez un élément')
                        .addOptions(listChoiceSelection),
                );
                if (rowNb <= maxRow) {
                    btnRows.push(row);
                    row = new MessageActionRow();
                    rowMenuNumber = 1
                    rowNb += 1
                }
                else {
                    return embederror("Fonctionnalité désactivée", "Ce serveur possède trop de channels pour moi. Merci d'utiliser la commande manuellement en tapant `;" + cmd.name + "`")
                }


                listChoiceSelection = []

                customidPart += 1;

                choiceitem = 1
                rowMenuNumber += 1;

            }

            if (!choice.description) {
                descrichoice = choice.action
            }
            else {
                descrichoice = choice.description
            }

            listChoiceSelection.push({
                label: choice.name,
                description: descrichoice,
                value: choice.action
            })
        }
        row.addComponents(
            new MessageSelectMenu()
                .setCustomId('menuChoice' + customidPart)
                .setPlaceholder('Choisissez un élément')
                .addOptions(listChoiceSelection),
        );
        btnRows.push(row);
    },


    channelmenu: function () {
        row = new MessageActionRow()
        listChannelSelction = []
        rowMenuNumber = 1;
        channelitem = 1
        customidPart = 1
        rowNb = 1
        guildChannels = interaction.guild.channels.cache.filter(ch => ch.type === 'GUILD_TEXT').sort((a, b) => a.rawPosition - b.rawPosition);

        for (const choicechannelraw of guildChannels) {
            // if we didn't reach the limit of propositions
            if (channelitem <= 24) {
                channelitem += 1
            }
            // if we do
            else {
                // only one menu per row
                //add element
                row.addComponents(
                    new MessageSelectMenu()
                        .setCustomId('menuChannelChoice' + customidPart)
                        .setPlaceholder('Choisissez un channel')
                        .addOptions(listChannelSelction),
                );
                if (rowNb <= maxRow) {
                    btnRows.push(row);
                    row = new MessageActionRow();
                    rowMenuNumber = 1
                    rowNb += 1
                }
                else {
                    return embederror("Fonctionnalité désactivée", "Ce serveur possède trop de channels pour moi. Merci d'utiliser la commande manuellement en tapant `;" + cmd.name + "`")
                }


                listChannelSelction = []

                customidPart += 1;

                channelitem = 1
                rowMenuNumber += 1;

            }
            const choicechannel = choicechannelraw[1]
            if (choicechannel.parent) {
                descrichannel = choicechannel.parent.name
            }
            else {
                descrichannel = "Pas de catégorie"
            }

            listChannelSelction.push({
                label: choicechannel.name,
                description: descrichannel,
                value: choicechannel.id
            })

        }
        row.addComponents(
            new MessageSelectMenu()
                .setCustomId('menuChannelChoice' + customidPart)
                .setPlaceholder('Choisissez un channel')
                .addOptions(listChannelSelction),
        );
        btnRows.push(row);
    },


    rolemenu: function () {
        row = new MessageActionRow()
        listRoleSelction = []
        rowMenuNumber = 1;
        roleitem = 1
        customidPart = 1
        rowNb = 1
        guildRoles = interaction.guild.roles.cache.sort((a, b) => b.position - a.position)


        if (guildRoles.length < 1) return btnRows = []


        for (const choiceroleraw of guildRoles) {
            // if we didn't reach the limit of propositions
            if (roleitem <= 24) {
                roleitem += 1
            }
            // if we do
            else {
                // only one menu per row
                //add element
                row.addComponents(
                    new MessageSelectMenu()
                        .setCustomId('menuRoleChoice' + customidPart)
                        .setPlaceholder('Choisissez un role')
                        .addOptions(listRoleSelction),
                );
                if (rowNb <= maxRow) {
                    btnRows.push(row);
                    row = new MessageActionRow();
                    rowMenuNumber = 1
                    rowNb += 1
                }
                else {
                    return embederror("Fonctionnalité désactivée", "Ce serveur possède trop de roles pour moi. Merci d'utiliser la commande manuellement en tapant `;" + cmd.name + "`")
                }


                listRoleSelction = []

                customidPart += 1;

                roleitem = 1
                rowMenuNumber += 1;

            }
            //console.log(choiceroleraw);
            const choicerole = choiceroleraw[1]

            descrirole = choicerole.members.map(m => m).length + " membre(s) ont ce rôle"

            listRoleSelction.push({
                label: choicerole.name,
                description: descrirole,
                value: choicerole.id
            })

        }
        row.addComponents(
            new MessageSelectMenu()
                .setCustomId('menuRoleChoice' + customidPart)
                .setPlaceholder('Choisissez un role')
                .addOptions(listRoleSelction),
        );
        btnRows.push(row);
    },


    colormenu: function () {
        btnRows = []
        const row = new MessageActionRow()
            .addComponents(
                new MessageSelectMenu()
                    .setCustomId('colorChoice')
                    .setPlaceholder('Choisissez une couleur')
                    .addOptions([
                        {
                            label: "🔴 - Rouge",
                            description: "ff0000",
                            value: "ff0000",
                        },
                        {
                            label: "🟠 - Orange",
                            description: "ff7700",
                            value: "ff7700",
                        },
                        {
                            label: "🟡 - Jaune",
                            description: "ffff00",
                            value: "ffff00",
                        },
                        {
                            label: "🟢 - Vert",
                            description: "00ff00",
                            value: "00ff00",
                        },
                        {
                            label: "🔵 - Cyan",
                            description: "00ffff",
                            value: "00ffff",
                        },
                        {
                            label: "👤 - Bleu",
                            description: "0000ff",
                            value: "0000ff",
                        },
                        {
                            label: "🟣 - Violet",
                            description: "ff00ff",
                            value: "ff00ff",
                        },
                        {
                            label: "🌸 - Rose",
                            description: "8800ff",
                            value: "8800ff",
                        },
                        {
                            label: "⚪ - Blanc",
                            description: "ffffff",
                            value: "ffffff",
                        },
                        {
                            label: "⚫ - Noir",
                            description: "000000",
                            value: "000000",
                        },
                    ]),
            );
        btnRows.push(row);
    },
}