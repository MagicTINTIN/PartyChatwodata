const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions, DiscordAPIError } = require('discord.js');
const { Modal, TextInputComponent, showModal } = require('discord-modals');
const discordModals = require('discord-modals');
const fs = require('fs');
const path = require('path');
const messageCheck = require('../../functions/messageCheck.js');
const other = require("../../functions/other.js");
const panels = require("./panels.js")

maxBtnInaRow = 5;
maxRow = 4;



module.exports = {
    // execution cmd
    command: async function (cmdmsg, embedmessage, cmd) {
        interaction = cmdmsg.interaction;

        const { client } = require("../../index.js");

        commandrunning = true;

        const filter = i => {
            if (i.user.id === cmdmsg.author.id) {
                return true
            } else {
                i.channel.send({ content: `KSS <@${i.user.id}>, touche pas aux croque- commandes des autres` });
                return false
            }
        };
        const filtermsg = m => m.author.id === interaction.user.id





        rawcommand = fs.readFileSync(path.resolve(`./commands/universal/${cmd.type}/${cmd.name}.json`));
        const command = JSON.parse(rawcommand);

        if (cmd.type == "fullpowers") {
            colorCommand = 0xe69138
        } else if (cmd.type == "dev") {
            colorCommand = 0xffd966
        } else if (cmd.type == "admin") {
            colorCommand = 0xffa1a1
        } else {
            colorCommand = 0x57ead3
        }


        // function with promises
        async function stepExec(stepcommand) {
            btnRows = []
            if (!command.steps) {
                commandrunning = false;
            }
            actStep = command.steps[stepcommand]

            //if the step doesn't exist
            if (!command.steps[stepcommand] || !actStep || !commandrunning) {
                commandrunning = false;
            }
            if (commandrunning && !actStep.timedelay) { timedelay = 15; }
            //if the step is not well defined
            if (!commandrunning || (!actStep.type || !actStep.title || !actStep.message || !actStep.action)) {
                stepcommand += 1;
            }


            // input type
            else if (actStep.type == "input") {
                const embed = new MessageEmbed()
                    .setTitle('Commande universelle - ' + actStep.title)
                    .setColor(colorCommand)
                    .setDescription(`-> ${actStep.message}`)
                    .setFooter({ text: `${interaction.user.tag} doit valider l'étape dans moins de ${timedelay} secondes`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });
                console.log("input");
                embedmessage.edit({ embeds: [embed], components: btnRows }).then(async () => {
                    await interaction.channel.awaitMessages({ filtermsg, max: 1, time: 15000, errors: ['time'] })
                        .then(collected => {
                            messagecollected = collected.first().content;
                            if (laploop == 9) console.log("Nombre de loop anormal (>=150)");
                            laploop += 1;
                            stepcommand += 1
                            return { messagecollected }
                        })
                        .catch(collected => {
                            if (laploop == 9) console.log("Nombre de loop anormal (>=150)");
                            laploop += 1;
                            stepcommand += 1
                            return embedmessage.edit(panels.expired(interaction));
                        });
                });
                //await textInput;
            }


        }



        laploop = 0;
        stepcommand = 0;
        messagetosend = ";" + cmd.name + " ";
        let messagecollected = Promise.resolve();

        async function nametest() {
            btnRows = []
            /*console.log(laploop);
            messagecollected = messagecollected.then(() => stepExec(stepcommand))
            //messagecollected = await stepExec(stepcommand)*/
            const embed = new MessageEmbed()
                .setTitle('Commande universelle - ' + laploop)
                .setColor(0xffffff)
                .setDescription(`-> ${laploop}`)
                .setFooter({ text: `${interaction.user.tag} doit valider l'étape dans moins de ${laploop} secondes`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });
            await console.log("input n°" + laploop);
            await embedmessage.edit({ embeds: [embed], components: btnRows }).then(() => {
                interaction.channel.awaitMessages({ filtermsg, max: 1, time: 15000, errors: ['time'] })
                    .then(collected => {
                        interaction.followUp(`${collected.first().content} a été envoyé`);
                        laploop += 1
                        return messagecollected = collected.first().content

                    })
                    .catch(collected => {
                        interaction.followUp("Rien n'a été envoyé");
                        return messagecollected = "null"
                    });
            });
        }


        function newname() {
            interaction.channel.send("lap : " + laploop).then(() => {
                interaction.channel.awaitMessages({ filtermsg, max: 1, time: 5000, errors: ['time'] })
                    .then(collected => {
                        interaction.followUp(`${collected.first().content} a été envoyé`);
                        laploop += 1
                        return messagecollected = collected.first().content

                    })
                    .catch(collected => {
                        interaction.followUp("Rien n'a été envoyé");
                        return messagecollected = "null"
                    });

            });
        }


        while (commandrunning && laploop <= 1) {
            console.log("bwo" + laploop);
            interaction.channel.send("lap : " + laploop).then(() => {
                interaction.channel.awaitMessages({ filtermsg, max: 1, time: 5000, errors: ['time'] })
                    .then(collected => {
                        interaction.followUp(`${collected.first().content} a été envoyé`);

                        return messagecollected = collected.first().content

                    })
                    .catch(collected => {
                        interaction.followUp("Rien n'a été envoyé");
                        return messagecollected = "null"
                    });

            });
            laploop += 1

        }
        await interaction.channel.send(`le message qui aurait été envoyé aurait été : ${messagetosend} ${messagecollected}`)
        await console.log(messagecollected);



        // function with promises
        /*async function stepExec(stepcommand) {
            btnRows = []
            if (!command.steps) {
                commandrunning = false;
            }
            actStep = command.steps[stepcommand]

            //if the step doesn't exist
            if (!command.steps[stepcommand] || !actStep || !commandrunning) {
                commandrunning = false;
            }
            if (commandrunning && !actStep.timedelay) { timedelay = 15; }
            //if the step is not well defined
            if (!commandrunning || (!actStep.type || !actStep.title || !actStep.message || !actStep.action)) {
                stepcommand += 1;
            }


            // input type
            /*else if (actStep.type == "input") {
                const embed = new MessageEmbed()
                    .setTitle('Commande universelle - ' + actStep.title)
                    .setColor(colorCommand)
                    .setDescription(`-> ${actStep.message}`)
                    .setFooter({ text: `${interaction.user.tag} doit valider l'étape dans moins de ${timedelay} secondes`, iconURL: interaction.user.displayAvatarURL({ format: 'png' }) });
                console.log("input");
                embedmessage.edit({ embeds: [embed], components: btnRows }).then(async () => {
                    await interaction.channel.awaitMessages({ filtermsg, max: 1, time: 15000, errors: ['time'] })
                        .then(collected => {
                            messagecollected = collected.first().content;
                            if (laploop == 9) console.log("Nombre de loop anormal (>=150)");
                            laploop += 1;
                            stepcommand += 1
                            return { messagecollected }
                        })
                        .catch(collected => {
                            if (laploop == 9) console.log("Nombre de loop anormal (>=150)");
                            laploop += 1;
                            stepcommand += 1
                            return embedmessage.edit(panels.expired(interaction));
                        });
                });
                //await textInput;
            }
        }*/


        laploop = 0;
        stepcommand = 0;
        commandnametosend = ";" + cmd.name + " ";
        messagecollected = ""
        //let messagecollected = Promise.resolve();
    },
}