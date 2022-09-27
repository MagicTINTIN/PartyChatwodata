const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions, DiscordAPIError, MessageSelectMenu } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const discordModals = require('discord-modals');
const fs = require('fs');
const path = require('path');
const messageCheck = require('../../functions/messageCheck.js');
const other = require("../../functions/other.js");
const panels = require("./panels.js")
const build = require("./menubuilder.js")
const imgprocess = require("./imgprocess.js")
const Discord = require('discord.js');
const logger = require("../../functions/logger.js");

const maxBtnInaRow = 5;
const maxRow = 4;


module.exports = {
    // execution cmd
    command: async function (cmdmsg, embedmessage, cmd) {
        usersMentionList = new Discord.Collection();
        interaction = cmdmsg.interaction;

        const { client, botchannels } = require("../../index.js");

        commandrunning = true;

        const filter = i => {
            if (i.user.id === cmdmsg.user.id) {
                return true
            } else {
                i.channel.send({ content: `KSS <@${i.user.id}>, touche pas aux croque- commandes des autres` });
                return false
            }
        };


        rawcommand = fs.readFileSync(path.resolve(`./commands/universal/${cmd.type}/${cmd.name}.json`));
        const command = JSON.parse(rawcommand);

        if (cmd.type == "fullpowers") {
            colorCommand = 0xe69138
            colorCommandEnd = 0x5c3a16
        } else if (cmd.type == "dev") {
            colorCommand = 0xffd966
            colorCommandEnd = 0x665628
        } else if (cmd.type == "admin") {
            colorCommand = 0xff5151
            colorCommandEnd = 0x662020
        } else {
            colorCommand = 0x57ead3
            colorCommandEnd = 0x225d54
        }


        laploop = 0;
        stepcommand = 0;
        commandnametosend = "&" + cmd.name + " ";
        messagecollected = ""

        // ERROR type
        async function embederror(title, message) {
            btnRows = []

            const embed = new MessageEmbed()
                .setTitle('PartyChat - ' + title)
                .setColor(0xff0000)
                .setDescription(`Erreur :\n${message}`)
                .setFooter({ text: `${interaction.user.tag} - La commande a expiré mais tu peux toujours la relancer avec /cmd`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });

            return await embedmessage.edit({ embeds: [embed], components: btnRows })
        }

        // Actualise embed
        async function editembed() {

            btnRows = []
            embedlist = []
            if (actStep.graphics) {
                fileslist = []
                if (actStep.graphics == "prevcard") {
                    const embedwait = await new MessageEmbed()
                        .setTitle('PartyChat - ' + actStep.title)
                        .setColor(colorCommand)
                        .setDescription(`<a:loading:986957810472460318> Traitement de l'image en cours, merci de patienter...`)
                        .setFooter({ text: `${interaction.user.tag} est en train de paramétrer la carte bienvenue`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });

                    await embedlist.push(embedwait)
                    await interaction.editReply({ embeds: embedlist, components: btnRows, files: fileslist }) //embedmessage.edit


                    await console.log("à preview : ", messagecollected);
                    graphembed = await imgprocess.previewCard(command.name + "cmd", messagecollected)

                    fileslist = []
                    btnRows = []
                    embedlist = []

                    await embedlist.push(graphembed[0])
                    await fileslist.push(graphembed[1])


                }
            }
            if (actStep.type == "choice" && actStep.choices && actStep.choices.length >= 1) {
                rowBtnNumber = 1;
                row = new MessageActionRow()

                for (const choice of actStep.choices) {

                    if (rowBtnNumber <= maxBtnInaRow) {
                        rowBtnNumber += 1;
                    } else {
                        btnRows.push(row);
                        row = new MessageActionRow();

                        rowBtnNumber = 1
                    }
                    if (!choice.color) {
                        row.addComponents(
                            new MessageButton()
                                .setCustomId(choice.action)
                                .setLabel(choice.buttoname)
                                .setStyle('SECONDARY'),
                        )
                    } else {
                        row.addComponents(
                            new MessageButton()
                                .setCustomId(choice.action)
                                .setLabel(choice.buttoname)
                                .setStyle(choice.color),
                        )
                    }
                }
                btnRows.push(row);
            }

            // Create menus with choices list
            else if (actStep.type == "menuChoice") {
                build.menu()
            }


            // Create menus with channel list
            else if (actStep.type == "channelChoice") {
                build.channelmenu()
            }


            // Create menus with role list
            else if (actStep.type == "roleChoice") {
                build.rolemenu()
            }


            // Create a menu with classic colors
            else if (actStep.type == "colorChoice") {
                build.colormenu()
            }
            // set new embed
            const embed = new MessageEmbed()
                .setTitle('PartyChat - ' + actStep.title)
                .setColor(colorCommand)
                .setDescription(`${actStep.message}`)
                .setFooter({ text: `${interaction.user.tag} doit valider l'étape dans moins de ${timedelay / 1000} secondes`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });

            embedlist.push(embed)
            await interaction.editReply({ embeds: embedlist, components: btnRows, files: fileslist }) //embedmessage.edit
        }

        // Message writer
        async function messageWriter(argument) {
            // add raw words
            if (argument.startsWith("adin")) {
                messagecollected += waitcollected + " ";
            }
            // add words separated by +
            else if (argument.startsWith("adip")) {
                messagecollected += waitcollected.split(" ").join("+") + " ";
            }
            // add channel id (by menu)
            else if (argument.startsWith("adch")) {
                messagecollected += "<#" + waitcollected + "> "
            }
            else if (argument.startsWith("adrole")) {
                messagecollected += "<@&" + waitcollected + "> "
            }
            // add channel id (by menu)
            else if (argument.startsWith("adcolor")) {
                messagecollected += waitcollected + " "
            }
            // add specific word
            else if (argument.startsWith("addw:")) {
                messagecollected += argument.slice(5) + " "
            }
            // add words separated by +
            else if (argument.startsWith("adcardtxt")) {
                txtcardlist = waitcollected.split("$m");
                if (!txtcardlist[1]) {
                    mentionvar = "y"
                    premention = txtcardlist[0].split(" ").join("+")
                    postmention = "n"
                } else {
                    mentionvar = "m"
                    premention = txtcardlist[0].split(" ").join("+")
                    postmention = txtcardlist[1].split(" ").join("+")
                }
                messagecollected += premention + " " + mentionvar + " " + postmention + " "
            }

        }


        // Action executor
        async function actionExecutor(actionTodo) {

            const actionlist = actionTodo.split("&")

            for (const actionNb in actionlist) {
                // add words to arguments
                if (actionlist[actionNb].startsWith("ad")) {
                    messageWriter(actionlist[actionNb])
                }
                // go to specific step
                else if (actionlist[actionNb].startsWith("goto:")) {
                    if (actionlist[actionNb].startsWith("goto:end")) {
                        // go to an impossible step in order to end
                        stepcommand = -42
                    } else {
                        // set to a previous step 
                        stepcommand = parseInt(actionlist[actionNb].slice(5)) - 1;
                    }
                }
                else if (actionlist[actionNb].startsWith("imgcheckcard")) {
                    imageOk = await imgprocess.checkCardDimensions(waitcollected);
                    if (!imageOk) stepcommand -= 1
                }
                else if (actionlist[actionNb].startsWith("del:")) {
                    console.log("DEL : ", actionlist[actionNb], messagecollected);
                    messagecollectedtemp = messagecollected.split(" ")
                    toDeleteNb = - parseInt(actionlist[actionNb].slice(4)) - 1;
                    messagecollectedtemp.splice(toDeleteNb)
                    messagecollected = messagecollectedtemp.join(" ") + " "
                    console.log("Deleted ", messagecollected);
                }

            }
        }


        // INPUT type
        async function waitMessage() {
            await interaction.channel.awaitMessages({
                filter: (m) => m.author.id === cmdmsg.user.id,
                max: 1,
                time: timedelay
            })
                .then(async collected => {
                    waitcollected = collected.first().content
                    collected.first().mentions.users.map(user => {
                        usersMentionList.set(user.id, user)
                    })
                    await actionExecutor(actStep.action)
                    collected.first().delete()
                })
                .catch(error => {
                    if (actStep.action == "imgcheckcard") {
                        console.error(error);
                        waitcollected = "null"
                        embederror("Erreur", "Vous avez soit mis trop de temps à répondre soit le format d'image n'est pas accepté")
                    } else {
                        console.error(error);
                        waitcollected = "null"
                        embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                    }
                });
        }

        // CHOICE type
        async function waitButton() {
            await embedmessage.awaitMessageComponent({ filter, componentType: 'BUTTON', time: timedelay })
                .then(interact => {
                    waitcollected = interact.customId;
                    actionExecutor(interact.customId)
                    interact.deferUpdate()
                        .catch(console.error);
                })
                .catch(err => {
                    waitcollected = "null"
                    embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                });
        }

        // MENUCHOICE type
        async function waitMenuChoice() {
            await embedmessage.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: timedelay })
                .then(interact => {
                    waitcollected = interact.values[0];
                    actionExecutor(waitcollected)
                    interact.deferUpdate()
                        .catch(console.error);
                })
                .catch(err => {
                    waitcollected = "null"
                    return embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                });
        }

        // CHANNELCHOICE type
        async function waitChannelChoice() {
            await embedmessage.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: timedelay })
                .then(interact => {
                    waitcollected = interact.values[0];
                    actionExecutor(actStep.action)
                    interact.deferUpdate()
                        .catch(console.error);
                })
                .catch(err => {
                    waitcollected = "null"
                    return embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                });
        }


        // ROLECHOICE type
        async function waitRoleChoice() {
            await embedmessage.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: timedelay })
                .then(interact => {
                    waitcollected = interact.values[0];
                    actionExecutor(actStep.action)
                    interact.deferUpdate()
                        .catch(console.error);
                })
                .catch(err => {
                    waitcollected = "null"
                    return embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                });
        }


        // COLORCHOICE type
        async function waitColorChoice() {
            await embedmessage.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: timedelay })
                .then(interact => {
                    waitcollected = interact.values[0];
                    actionExecutor(actStep.action)
                    interact.deferUpdate()
                        .catch(console.error);
                })
                .catch(err => {
                    waitcollected = "null"
                    return embederror("Temps écoulé", "Vous avez mis trop de temps à répondre.")
                });
        }


        // send nothing because of a cancel type
        async function sendNothingButCancel() {
            const embed = new MessageEmbed()
                .setTitle('PartyChat - ' + command.name)
                .setColor(colorCommandEnd)
                .setDescription(`La commande a été annulée lors de son exécution`)
                .setFooter({ text: `${interaction.user.tag} n'a finalement pas exécuté de commande`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });
            await embedmessage.edit({ embeds: [embed], components: btnRows })
        }

        // send the sum up of the command
        async function sendConclusion() {
            btnRows = []
            const embed = new MessageEmbed()
                .setTitle('PartyChat - ' + command.name)
                .setColor(colorCommandEnd)
                .setDescription(`Résumé de la commande :\n\` ${commandnametosend} ${messagecollected}\``)
                .setFooter({ text: `${interaction.user.tag} a exécuté correctement la commande`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });
            await embedmessage.edit({ embeds: [embed], components: btnRows })
            logger.all(`Résumé de la commande de ${interaction.user.tag} (${interaction.user.id}) dans ${interaction.channel.name}(${interaction.channel.id}) sur ${interaction.guild.name}(${interaction.guild.id}):\n\` ${commandnametosend} ${messagecollected}\``)
            messagemsg = {
                content: `${commandnametosend} ${messagecollected}`,
                author: interaction.user,
                user: interaction.user,
                member: interaction.member,
                id: interaction.id,
                channel: interaction.channel,
                channelId: interaction.channel.id,
                guild: interaction.guild,
                guildId: interaction.guild.id,
                mentions: {
                    users: usersMentionList
                }
            }
            const argsmsg = messagemsg.content.slice(1).split(/ +/);
            const commandmsg = argsmsg.shift().toLocaleLowerCase();
            await client.commands.get(commandmsg).execute(messagemsg, argsmsg);
        }

        fileslist = []

        while (commandrunning && laploop <= 400) {

            btnRows = []
            if (!command.steps) {
                commandrunning = false;
            }
            actStep = command.steps[stepcommand]

            //if the step doesn't exist
            if (!command.steps[stepcommand] || !actStep || !commandrunning || (actStep.type && (actStep.type == "end" || actStep.type == "cancel"))) {
                commandrunning = false;
            }
            if (!actStep || !actStep.timedelay) { timedelay = 30000; } else { timedelay = actStep.timedelay }
            //if the step is not well defined
            if (commandrunning && (!actStep.type || !actStep.title || !actStep.message)) {

                client.channels.cache.get(botchannels.errorChannel).send(`${interaction.user.tag}(id:${interaction.user.id}) a généré une erreur avec /cmd depuis le serveur ${interaction.guild.name} (channel : ${interaction.channelId}) :\n\n ${cmd.name}`)
                commandrunning = false;
                return embederror("Erreur dans la commande", "Il y a une erreur dans le code de la commande.\nDésolé pour le désagrément, j'ai fait remonter l'erreur.")

            };
            if (!commandrunning || (!actStep.type || !actStep.title || !actStep.message)) {

                if (actStep && actStep.type && actStep.type == "cancel") {
                    commandrunning = false;
                    return sendNothingButCancel()
                } else {
                    commandrunning = false;
                    return sendConclusion()
                }


            };

            await editembed();
            if (actStep.type == "end") sendConclusion()
            else if (actStep.type == "input") await waitMessage()
            else if (actStep.type == "choice") await waitButton()
            else if (actStep.type == "menuChoice") await waitMenuChoice()
            else if (actStep.type == "channelChoice") await waitChannelChoice()
            else if (actStep.type == "roleChoice") await waitRoleChoice()
            else if (actStep.type == "colorChoice") await waitColorChoice()
            if (waitcollected == "null") return
            laploop += 1
            stepcommand += 1

        }


    },
}