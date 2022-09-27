const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');
const other = require("../../functions/other.js");

const maxBtnInaRow = 5;
const maxRow = 4;

/*command = {
    commandtype : "slash || msg",
    channelID : "XXXXX",
    messageID : "XXXXXX",
    message : message,
    user : 'type user',
    member : 'member'
}*/

module.exports = {
    // message vide
    expired: function (cmd) {
        const embed = new MessageEmbed()
            .setTitle('PartyChat - Temps expiré')
            .setColor(0xff0000)
            .setDescription(`Hey ${cmd.user.tag}, tu as mis trop de temps à exécuter la commande`)
            .setFooter({ text: `La commande a expiré mais tu peux toujours la relancer avec /cmd` });
        return { embeds: [embed], components: [] }
    },
    // affiche panneau 
    commandtype: function (cmd) {
        const row = new MessageActionRow()
            .addComponents(
                new MessageButton()
                    .setCustomId('public')
                    .setLabel('Public')
                    .setStyle('SECONDARY'),
            );
        if (cmd.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('admin')
                    .setLabel('Mod & Admin')
                    .setStyle('PRIMARY'),
            )
        }
        if (devlist.includes(cmd.user.id)) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('dev')
                    .setLabel('Developper')
                    .setStyle('DANGER'),
            )
        }
        if (fullpower.includes(cmd.user.id)) {
            row.addComponents(
                new MessageButton()
                    .setCustomId('fullpowers')
                    .setLabel('Full powers')
                    .setStyle('DANGER'),
            )
        }

        const embed = new MessageEmbed()
            .setTitle('PartyChat')
            .setColor(0xffffff)
            .setDescription("Cliquez sur le bouton de votre choix parmi les différents types de commande ci-dessous")
            .setFooter({ text: `${cmd.user.tag} doit cliquer sur un bouton dans moins de 15 secondes`, iconURL: cmd.user.displayAvatarURL({ format: 'png' }) });

        return { embeds: [embed], components: [row] }
    },


    // public pannel
    publiclist: function (cmd) {

        const publicCommandFiles = fs.readdirSync('./commands/universal/public').filter(file => file.endsWith('.json'));

        rowBtnNumber = 1;
        row = new MessageActionRow()
        btnRows = []

        for (const file of publicCommandFiles) {
            rawcommand = fs.readFileSync(path.resolve(`./commands/universal/public/${file}`));
            const command = JSON.parse(rawcommand);

            if (rowBtnNumber <= maxBtnInaRow) {
                rowBtnNumber += 1;
            } else {
                btnRows.push(row);
                row = new MessageActionRow();

                rowBtnNumber = 2
            }
            row.addComponents(
                new MessageButton()
                    .setCustomId(command.name)
                    .setLabel(other.majFirstLetter(command.name))
                    .setStyle('SECONDARY'),
            )


        }
        btnRows.push(row);

        const embed = new MessageEmbed()
            .setTitle('PartyChat - Public')
            .setColor(0x57ead3)
            .setDescription("Cliquez sur le bouton de votre choix parmi les différents ci-dessous pour exécuter une commande.\nPour obtenir de l'aide, sélectionnez `help`")
            .setFooter({ text: `${cmd.user.tag} doit cliquer sur un bouton dans moins de 15 secondes`, iconURL: cmd.user.displayAvatarURL({ format: 'png' }) });
        return { embeds: [embed], components: btnRows }
    },

    // admin pannel
    adminlist: function (cmd) {

        const adminCommandFiles = fs.readdirSync('./commands/universal/admin').filter(file => file.endsWith('.json'));

        rowBtnNumber = 1;
        row = new MessageActionRow()
        btnRows = []

        for (const file of adminCommandFiles) {
            rawcommand = fs.readFileSync(path.resolve(`./commands/universal/admin/${file}`));
            const command = JSON.parse(rawcommand);

            if (rowBtnNumber <= maxBtnInaRow) {
                rowBtnNumber += 1;
            } else {
                btnRows.push(row);
                row = new MessageActionRow();

                rowBtnNumber = 2
            }
            row.addComponents(
                new MessageButton()
                    .setCustomId(command.name)
                    .setLabel(other.majFirstLetter(command.name))
                    .setStyle('SECONDARY'),
            )

        }
        btnRows.push(row);

        const embed = new MessageEmbed()
            .setTitle('PartyChat - Admin')
            .setColor(0xffa1a1)
            .setDescription("Cliquez sur le bouton de votre choix parmi les différents ci-dessous pour exécuter une commande.\nPour obtenir de l'aide, sélectionnez `adminhelp`")
            .setFooter({ text: `${cmd.user.tag} doit cliquer sur un bouton dans moins de 15 secondes`, iconURL: cmd.user.displayAvatarURL({ format: 'png' }) });
        return { embeds: [embed], components: btnRows }
    },

    // dev pannel
    devlist: function (cmd) {

        const devCommandFiles = fs.readdirSync('./commands/universal/dev').filter(file => file.endsWith('.json'));

        rowBtnNumber = 1;
        row = new MessageActionRow()
        btnRows = []

        for (const file of devCommandFiles) {
            rawcommand = fs.readFileSync(path.resolve(`./commands/universal/dev/${file}`));
            const command = JSON.parse(rawcommand);

            if (rowBtnNumber <= maxBtnInaRow) {
                rowBtnNumber += 1;
            } else {
                btnRows.push(row);
                row = new MessageActionRow();

                rowBtnNumber = 2
            }
            row.addComponents(
                new MessageButton()
                    .setCustomId(command.name)
                    .setLabel(other.majFirstLetter(command.name))
                    .setStyle('SECONDARY'),
            )

        }
        btnRows.push(row);

        const embed = new MessageEmbed()
            .setTitle('PartyChat - Dev')
            .setColor(0xffd966)
            .setDescription("Cliquez sur le bouton de votre choix parmi les différents ci-dessous pour exécuter une commande.")
            .setFooter({ text: `${cmd.user.tag} doit cliquer sur un bouton dans moins de 15 secondes`, iconURL: cmd.user.displayAvatarURL({ format: 'png' }) });
        return { embeds: [embed], components: btnRows }
    },

    // fullpowers pannel
    fullpowerslist: function (cmd) {

        const fullpowersCommandFiles = fs.readdirSync('./commands/universal/fullpowers').filter(file => file.endsWith('.json'));

        rowBtnNumber = 1;
        row = new MessageActionRow()
        btnRows = []

        for (const file of fullpowersCommandFiles) {
            rawcommand = fs.readFileSync(path.resolve(`./commands/universal/fullpowers/${file}`));
            const command = JSON.parse(rawcommand);

            if (rowBtnNumber <= maxBtnInaRow) {
                rowBtnNumber += 1;
            } else {
                btnRows.push(row);
                row = new MessageActionRow();

                rowBtnNumber = 2
            }
            row.addComponents(
                new MessageButton()
                    .setCustomId(command.name)
                    .setLabel(other.majFirstLetter(command.name))
                    .setStyle('SECONDARY'),
            )

        }
        btnRows.push(row);

        const embed = new MessageEmbed()
            .setTitle('PartyChat - Full powers')
            .setColor(0xe69138)
            .setDescription("Cliquez sur le bouton de votre choix parmi les différents ci-dessous pour exécuter une commande.")
            .setFooter({ text: `${cmd.user.tag} doit cliquer sur un bouton dans moins de 15 secondes`, iconURL: cmd.user.displayAvatarURL({ format: 'png' }) });
        return { embeds: [embed], components: btnRows }
    },
}