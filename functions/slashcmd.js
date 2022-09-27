const { token, appID } = require('../config/credentials.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { ContextMenuCommandBuilder, SlashCommandBuilder } = require('@discordjs/builders');
const logger = require('./logger');
const { Client, MessageEmbed } = require('discord.js');
const cmd = require('../commands/universal/cmd');
const imaGen = require('./imaGen.js');
const fileManager = require("./game/fileManager.js");
const fs = require('fs');
const path = require('path');
const triggerShop = require("./game/triggerShop.js");

module.exports = {
    // test slash commands
    testloadslash: function () {
        var commandslash = []
        const rest = new REST({ version: '9' }).setToken(token);

        console.log('Refreshing /.');
        // public commands

        commandslash.push(new SlashCommandBuilder()
            .setName("party")
            .setDescription("L'unicmd du bot"));

        commandslashjson = commandslash.map(command => command.toJSON());
        rest.put(Routes.applicationCommands(appID), { body: commandslashjson })
            .then(() => console.log('/ a été rechargé.'))
            .catch(console.error);
    },
    loadslash: function () {
        var commandslash = []
        const rest = new REST({ version: '10' }).setToken(token);

        // public commands
        // cmd
        // commandslash.push(new SlashCommandBuilder()
        //     .setName("party")
        //     .setDescription("L'unicmd du bot"));

        commandslash.push(new SlashCommandBuilder()
            .setName("rank")
            .setDescription("Les informations sur votre niveau dans le serveur")
            .addUserOption(option =>
                option.setName('membre')
                    .setDescription("Obtenir le rank d'un autre membre")
                    .setRequired(false)));

        commandslash.push(new SlashCommandBuilder()
            .setName("badges")
            .setDescription("Découvrez les badges que vous pouvez obtenir sur ce serveur !"));

        commandslash.push(new SlashCommandBuilder()
            .setName("help")
            .setDescription("Plus d'infos sur moi"));
        commandslashjson = commandslash.map(command => command.toJSON());
        console.log('Refreshing (/) commands.');


        // contextMenu

        /*console.log('Refreshing ◽ contextMenu.'); // désormais géré par serveur

        commandslashjson.push(new ContextMenuCommandBuilder()
            .setName("Merci")
            .setType(2) // for USER type
        );
        commandslashjson.push(new ContextMenuCommandBuilder()
            .setName("Merci")
            .setType(3) // for Message type
        );*/

        // export commands

        rest.put(Routes.applicationCommands(appID), { body: commandslashjson })
            .then(() => console.log('Les commandes (/) et (◽) ont été rechargées.'))
            .catch(console.error);

        // SPECIAL COMMANDS BY SERVER

        const srvcfgFiles = fs.readdirSync('./servers')
        for (const folder of srvcfgFiles) {
            console.log("-/-" + folder + " loading...");
            try {
                var servershopconfigtoload = JSON.parse(fs.readFileSync(path.resolve(`./servers/${folder}/shop.json`)));
                if (servershopconfigtoload && servershopconfigtoload.otherItems && servershopconfigtoload.otherItems.commands) {
                    var persoslashcmd = []

                    // pour chaque commande de chaque guild
                    for (const cmd of servershopconfigtoload.otherItems.commands) {

                        //const slashcmdcfg = servershopconfigtoload.otherItems.slashcommands[cmd]
                        // perso slash builder
                        if (cmd.type == "slashcmd") {
                            var slashbuildingcmd = new SlashCommandBuilder()
                                .setName(cmd.name)
                                .setDescription(cmd.description)

                            // check if there are options
                            if (cmd.options)
                                for (const optioncfg of cmd.options) {
                                    if (optioncfg.type == "user")
                                        slashbuildingcmd.addUserOption(option =>
                                            option.setName(optioncfg.name)
                                                .setDescription(optioncfg.description)
                                                .setRequired(optioncfg.required))
                                    if (optioncfg.type == "string")
                                        slashbuildingcmd.addStringOption(option =>
                                            option.setName(optioncfg.name)
                                                .setDescription(optioncfg.description)
                                                .setRequired(optioncfg.required))
                                    else
                                        console.log("Option type inconnue : " + cmd.name + ">" + optioncfg.type);
                                }
                            persoslashcmd.push(slashbuildingcmd)
                        }

                        else if (cmd.type == "usrCtxMenu") {
                            var slashbuildingcmd = new ContextMenuCommandBuilder()
                                .setType(2)
                                .setName(cmd.name)
                            persoslashcmd.push(slashbuildingcmd)
                        }

                        else if (cmd.type == "msgCtxMenu") {
                            var slashbuildingcmd = new ContextMenuCommandBuilder()
                                .setType(3)
                                .setName(cmd.name)
                            persoslashcmd.push(slashbuildingcmd)
                        }

                        // thanker builder
                        else if (cmd.type == "thank") {
                            persoslashcmd.push(new ContextMenuCommandBuilder()
                                .setName("Merci")
                                .setType(2) // for USER type
                            );
                            persoslashcmd.push(new ContextMenuCommandBuilder()
                                .setName("Merci")
                                .setType(3) // for Message type
                            );
                        }

                        // unknown type of builder
                        else {
                            console.log("(!) Type de commande personnalisée inconnue : " + cmd.type)
                        }
                    }


                    // loading commands for the server
                    try {
                        persoslashcmdjson = persoslashcmd.map(command => command.toJSON());
                        rest.put(
                            Routes.applicationGuildCommands(appID, folder),
                            { body: persoslashcmdjson },
                        );

                        console.log("(/) et (◽) personnalisées de " + folder + " chargées");
                    } catch (error) {
                        console.log("(/) et (◽) personnalisées de " + folder + " non rechagées : ERREUR : ");
                        console.error(error);
                    }
                }
                else
                    console.log("(/) et (◽) pour " + folder + " n'ont pas été trouvées");
            }
            catch (err) {
                if (err.code == 'ENOENT')
                    console.log("(/) et (◽) pour " + folder + " n'ont pas été trouvées (no file)")
                else {
                    console.log("(/) et (◽) pour " + folder + " n'ont pas été trouvées à cause d'une erreur : ");
                    console.error(err);
                }
            }
        }
    },




    //  when triggered
    triggered: async function (interaction) {
        if (!interaction.guild) return interaction.reply("Les commandes / sont désactivées en mp")

        const { client } = require("../index.js");
        logger.all(`${interaction.user.tag} a utilisé /${interaction.commandName} sur ${interaction.guild.name} dans #${interaction.channel.name}(${interaction.channelId})`);


        if (blacklist.includes(interaction.user.id) || interaction.user.bot) {
            logger.all("Mais il est ban (cheh)");
            return interaction.reply({ content: "Tu es banni de l'utilisation de PartyChat", ephemeral: true });
        }
        if (interaction.commandName === 'help') {
            return interaction.reply("Il y a 2 commandes / disponibles : /rank & /badges\nTu peux également faire clic droit sur un profil ou un message puis aller dans Apps > Merci, pour remercier quelqu'un.")
            //cmd.tirggered(interaction)
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
        else {
            const shop = fileManager.loadshop(interaction.guild)
            var foundslashcmd = false;
            var slashNb = 0;

            var optionscmd = "novar"
            var cmdShop;

            // console.log(interaction);
            // console.log(shop.otherItems.commands)
            while (slashNb < shop.otherItems.commands.length && !foundslashcmd) {
                const itemslash = shop.otherItems.commands[slashNb]
                if (itemslash.type == "slashcmd" && itemslash.name == interaction.commandName) {
                    foundslashcmd = true
                    cmdShop = shop.otherItems.commands[slashNb]
                    if (interaction.options) {
                        optionscmd = {}
                        //console.log(interaction.options);
                        for (const option of interaction.options._hoistedOptions) {
                            optionscmd[option.name] = option.value
                        }
                    }

                    //interaction.reply("Cmd trouvée")
                }
                else slashNb++
            }
            if (foundslashcmd) {
                var interactionReply = triggerShop.act(interaction.guild, cmdShop.action, `/${interaction.commandName}`, interaction.member, interaction.channel, optionscmd)
                if (interactionReply == null) return
                else if (interactionReply == "#noMSGrecap#") {
                    interaction.deferReply();
                    return interaction.deleteReply();
                }
                else
                    return interaction.reply({ content: "\u200B" + interactionReply, ephemeral: true })
            }
            else
                interaction.reply({ content: "Cette commande ne fonctionne pas pour le moment ^^'", ephemeral: true })

            //triggerShop.act(interaction.guild, interaction.values[0].slice(6), interaction.member, interaction.channel, "novar")
        }


    }
}