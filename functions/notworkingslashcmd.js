const { token, appID } = require('../config/credentials.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('./logger');
const { Client, MessageEmbed } = require('discord.js');
const cmd = require('../commands/universal/cmd');
const imaGen = require('./imaGen.js');
const fileManager = require("./game/fileManager.js");

module.exports = {
    // load slash commands
    loadslash: async function () {
        var commandslash = []
        const rest = new REST({ version: '10' }).setToken(token);

        // public commands
        // cmd
        commandslash.push(new SlashCommandBuilder()
            .setName("party")
            .setDescription("L'unicmd du bot"));

        commandslash.push(new SlashCommandBuilder()
            .setName("rank")
            .setDescription("Les informations sur votre niveau dans le serveur")
            .addUserOption(option =>
                option.setName('membre')
                    .setDescription("Obtenir le rank d'un autre membre")
                    .setRequired(false))
            /*.addStringOption(option =>
                option.setName('user')
                    .setDescription("Obtenir le rank d'un autre membre")
                    .setRequired(false))*/);

        commandslash.push(new SlashCommandBuilder()
            .setName("badges")
            .setDescription("Découvrez les badges que vous pouvez obtenir sur ce serveur !"));

        commandslash.push(new SlashCommandBuilder()
            .setName("help")
            .setDescription("Plus d'infos sur moi"));
        commandslashjson = commandslash.map(command => command.toJSON());
        console.log('Refreshing (/) commands.');

        await rest.put(
            Routes.applicationCommands(appID),
            { body: commandslashjson },
        ).then(() => console.log('Les commandes (/) ont été rechargées.')).catch(console.error);

        /*
        rest.put(Routes.applicationCommands(appID), { body: commandslashjson })
            .then(() => console.log('Les commandes (/) ont été rechargées.'))
            .catch(console.error);*/
    },

    //  when triggered
    triggered: async function (interaction) {
        const { client } = require("../index.js");
        logger.all(`${interaction.user.tag} a utilisé /${interaction.commandName} sur ${interaction.guild.name} dans #${interaction.channel.name}(${interaction.channelId})`);


        if (blacklist.includes(interaction.user.id) || interaction.user.bot) {
            logger.all("Mais il est ban (cheh)");
            return interaction.reply({ content: "Tu es banni de l'utilisation de PartyChat", ephemeral: true });
        }
        if (interaction.commandName === 'party') {
            return cmd.tirggered(interaction)
        }

        const confserv = client.cfgsrvs.get(interaction.guild.id)
        //console.log(confserv);
        if (!confserv) return interaction.reply({ content: "Ce serveur n'a pas configuré PartyChat", ephemeral: true });


        // rank
        else if (interaction.commandName === 'rank') {
            const waitembed = new MessageEmbed()
                .setTitle("PartyChat - /rank")
                .setColor(0xffffff)
                .setDescription("Chargement en cours...");

            interaction.reply({ embeds: [waitembed] })
            const sent = await interaction.fetchReply()
            //console.log(interaction);
            const othermember = interaction.options.getMember('membre')
            //console.log(othermember)

            if (!othermember) {
                const errornotmember = new MessageEmbed()
                    .setTitle("PartyChat - /rank")
                    .setColor(0xffffff)
                    .setDescription("Tu n'as pas encore suffisament de points pour obtenir ton rank\nParles un peu avec les gens du serveur avant de revenir vers moi");

                filememberjson = fileManager.loadusr(interaction.member.id, interaction.guild)
                if (!filememberjson) return sent.edit({ embeds: [errornotmember] })
                imaGen.rank(sent, interaction.member, confserv, filememberjson);
            } else {
                const errornotmember = new MessageEmbed()
                    .setTitle("PartyChat - /rank")
                    .setColor(0xffffff)
                    .setDescription("Ce membre n'a pas encore suffisament de points pour obtenir un rank");

                filememberjson = fileManager.loadusr(othermember.id, interaction.guild)
                if (!filememberjson) return sent.edit({ embeds: [errornotmember] })
                imaGen.rank(sent, othermember, confserv, filememberjson);
            }
        }

        // badges
        else if (interaction.commandName === 'badges') {
            messagelistbadge = "Voici la listes des badges du serveur\n\n";

            const waitembed = new MessageEmbed()
                .setTitle("PartyChat - /badges")
                .setColor(0xffffff)
                .setDescription("Chargement en cours...");
            interaction.reply({ embeds: [waitembed] })

            const sent = await interaction.fetchReply()

            for (const badge in confserv.badgesList) {
                //console.log(badge);
                badgeemote = client.emojis.cache.get(confserv.badgesList[badge].emote);
                messagelistbadge += `<:${badgeemote.name}:${confserv.badgesList[badge].emote}>` + " : **" + confserv.badgesList[badge].name + "**\n> " + confserv.badgesList[badge].description + "\n\n";
            }

            const embedobject = new MessageEmbed()
                .setTitle("PartyChat - /badges")
                .setColor(0xffffff)
                .setDescription(messagelistbadge);
            sent.edit({ embeds: [embedobject] });
        }


    }
}