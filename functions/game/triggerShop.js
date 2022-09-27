const logger = require("../logger.js");
const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions } = require('discord.js');
const fs = require('fs');
const path = require('path');
const sm = require("./shopManager.js");
const fm = require("./fileManager.js");

const procesSepartor = "‣"

function pluriel(number) {
    if (number > 1)
        return "s"
    else if (number < -1)
        return "s"
    else
        return ""
}

function plusoumoins(number) {
    if (number >= 0)
        return "+ " + number
    else
        return "- " + (-number)
}

function messageBuilder(messagetotransform, actfunctionargs, varmixer, client) {
    //console.log(messagetotransform);
    messagetotransform = messagetotransform
        .split("$c").join(actfunctionargs.channel.name)
        .split("$u").join(actfunctionargs.member.user.tag)
        .split("$g").join(actfunctionargs.guild.name)
    // console.log(varmixer);

    var regExpSelectparenthesis = /(?<=\(%)(.*?)(?=\))/gi; // /\(\%([^)]+)\)/;
    var searchingVarsList = messagetotransform.match(regExpSelectparenthesis);

    // replace or delete (%var)
    if (searchingVarsList)
        for (const isVar of searchingVarsList) {
            if (Object.hasOwnProperty.call(varmixer, isVar))
                messagetotransform = messagetotransform.split(`(%${isVar})`).join(varmixer[isVar])
            else
                messagetotransform = messagetotransform.split(`(%${isVar})`).join("")
        }

    // replace $var
    if (varmixer != "novar")
        for (const key in varmixer) {
            if (Object.hasOwnProperty.call(varmixer, key)) {
                messagetotransform = messagetotransform.split("$" + key).join(varmixer[key])
            }
        }

    // creates embeds
    var regExpSelectEmbed = /(?<=\[embed\])(.*?)(?=\[\/embed\])/gi;

    var searchingEmbedList = messagetotransform.match(regExpSelectEmbed);
    var embedlist = []
    //console.log(searchingEmbedList);
    if (searchingEmbedList)
        for (const embedFound of searchingEmbedList) {
            //console.log(embedFound);
            var embedinfo = embedFound.split("|")

            const messageEmbed = new MessageEmbed()
                .setColor(actfunctionargs.member.displayColor)

            validEmbed = false;

            for (const embedprop of embedinfo) {
                if (embedprop.startsWith("color.") && embedprop.length == 12) {
                    messageEmbed.setColor("#" + embedprop.slice(6))
                }
                else if (embedprop.startsWith("content.") && embedprop.length > 8) {
                    messageEmbed.setDescription("\u200B" + embedprop.slice(8))
                    validEmbed = true;
                }
                else if (embedprop.startsWith("title.") && embedprop.length > 6) {
                    messageEmbed.setTitle("\u200B" + embedprop.slice(6))
                    validEmbed = true;
                }
                else if (embedprop.startsWith("img.") && embedprop.length > 6) {
                    messageEmbed.setImage(embedprop.slice(4))
                    validEmbed = true;
                }
                else if (embedprop.startsWith("footer.") && embedprop.length > 7) {
                    if (embedprop == "footer.command") {
                        messageEmbed.setFooter({ text: actfunctionargs.originActionName, iconURL: client.user.displayAvatarURL() });
                        validEmbed = true;
                    }

                }
                else if (embedprop.startsWith("author")) {
                    messageEmbed.setAuthor({ name: actfunctionargs.member.user.tag, iconURL: actfunctionargs.member.user.displayAvatarURL() })
                    validEmbed = true;
                }
            }
            if (validEmbed)
                embedlist.push(messageEmbed)
            messagetotransform = messagetotransform.split(`[embed]${embedFound}[/embed]`).join("")
        }


    if (messagetotransform == "")
        messagetotransform = null
    //console.log(messagetotransform);
    return { content: messagetotransform, embeds: embedlist }
    // console.log(messagetotransform);
}

function getChannel(client, cmdchannel, id) {
    if (id == "c")
        return cmdchannel
    else
        return client.channels.cache.get(id)
}

module.exports = {
    act: function (guild, actionName, originActionName, member, channel, varsofcommand) {

        //console.log(originActionName);
        const actargs = {
            guild: guild,
            actionName: actionName,
            member: member,
            channel: channel,
            originActionName: originActionName
        }

        const { client, botchannels } = require("../../index.js");
        var shop = fm.loadshop(guild)
        if (!shop.actions[actionName] || !shop.actions[actionName].script || !shop.actions[actionName].name || !shop.actions[actionName].bought)
            return "L'action n'est pas fonctionnelle, aucun changement n'a été effectué"
        var usrfile = fm.loadusr(member.id, guild)
        if (!usrfile)
            return "Vous n'avez pas encore les requis pour utiliser cette fonctionnalité"
        //return "Les actions allant être effectuées sont : " + shop.actions[actionName]

        // init
        var actionsList = shop.actions[actionName].script.split(/\&+/)
        var laploop = 0;
        var processedActions = 0;
        var processedActionsDescription = "";
        var processedLoggedActions = ""

        var price = 0;

        var logact = true;
        var msgrecap = true;
        var everyinfo = false;
        var logShop = true;
        var process = false;

        requirementsNeeded = {
            sendmsginchannel: false,
        };

        // do the actions
        for (const action of actionsList) {
            laploop++;
            var actionArgs = action.split(":")
            if (action.startsWith("onlyonce")) {
                var itemNb = usrfile.stats.itemBought.length - 1;
                while (itemNb >= 0) {
                    if (usrfile.stats.itemBought[itemNb].action == actionName)
                        return "Cette action ne peut être faite qu'une seule fois ;)\nDéjà effectuée le " + new Date(usrfile.stats.itemBought[itemNb].time).toLocaleDateString() + " à " + new Date(usrfile.stats.itemBought[itemNb].time).toLocaleTimeString()
                    else itemNb++
                }
            }
            if (action.startsWith("cooldown")) {
                var itemNb = usrfile.stats.itemBought.length - 1;
                var lastitemfound = false;
                while (itemNb >= 0 && !lastitemfound) {
                    if (usrfile.stats.itemBought[itemNb].action == actionName) {
                        datetime = Date.now();
                        lastitemfound = true
                        lasttime = usrfile.stats.itemBought[itemNb].time
                        var nottimeoutmsg = (Math.floor((parseInt(actionArgs[1]) - datetime + lasttime) / 60000)) + "min et " + (Math.floor((parseInt(actionArgs[1]) - datetime + lasttime - Math.floor((parseInt(actionArgs[1]) - datetime + lasttime) / 60000) * 60000) / 1000)) + "s avant de pouvoir réeffectuer cette action"
                        if (datetime - lasttime < parseInt(actionArgs[1]))
                            if (usrfile.isGod || usrfile.specialRole.includes("free")) {
                                processedLoggedActions += "·cooldown bypass " + nottimeoutmsg + "\n"
                                processedActionsDescription += "· Tu devais attendre " + nottimeoutmsg + " mais tu es trop fort !\n"
                            }
                            else
                                return "Tu dois attendre " + nottimeoutmsg
                    }
                    else itemNb--
                }
            }
            else if (action.startsWith("msgrecap"))
                msgrecap = actionArgs[1] == "on";
            else if (action.startsWith("log"))
                logact = actionArgs[1] == "on";
            else if (action.startsWith("everyinfo"))
                everyinfo = actionArgs[1] == "on";
            else if (action.startsWith("logshop"))
                logShop = actionArgs[1] == "on";
            else if (action.startsWith("process"))
                process = actionArgs[1] == "on";

            // remove role(s)
            else if (action.startsWith("require:")) {

                var listRequirements = actionArgs[1].split(",");

                for (const requirement of listRequirements) {

                    if (requirement.startsWith("can.")) {
                        if (requirement == "can.sendmsginch")
                            requirementsNeeded.sendmsginchannel = true;
                    }
                    else if (requirement.startsWith("has")) {
                        if (requirement.startsWith("hasrole.") && (!usrfile.isGod && !usrfile.specialRole.includes(requirement.slice(8))))
                            return "Tu ne peux pas utiliser cette action car tu n'as pas le badge " + requirement.slice(8) + " !"
                        else if (requirement.startsWith("hasbadge.") && (!usrfile.isGod && !usrfile.specialRole.includes(requirement.slice(9))))
                            return "Tu ne peux pas utiliser cette action car tu n'as pas le rôle " + requirement.slice(9) + " !"
                    }
                    else if (requirement.startsWith("xp")) {
                        if (requirement.startsWith("xp>") && usrfile.xp <= parseInt(requirement.slice(3)))
                            return "Tu n'as pas assez d'xp pour pouvoir utiliser cette fonction (il faut plus de " + requirement.slice(3) + " xp)"
                        else if (requirement.startsWith("xp=") && usrfile.xp != parseInt(requirement.slice(3)))
                            return "Tu dois avoir exactement " + requirement.slice(3) + " xp pour utiliser cette fonction"
                        else if (requirement.startsWith("xp<") && usrfile.xp >= parseInt(requirement.slice(3)))
                            return "Tu as trop d'xp pour pouvoir utiliser cette fonction (il faut " + (parseInt(requirement.slice(3)) - 1) + " xp max)"
                    }
                    else if (requirement.startsWith("pt")) {
                        if (requirement.startsWith("pt>") && usrfile.points <= parseInt(requirement.slice(3)))
                            return "Tu n'as pas assez de points pour pouvoir utiliser cette fonction (il faut plus de " + requirement.slice(3) + " pt)"
                        else if (requirement.startsWith("pt=") && usrfile.points != parseInt(requirement.slice(3)))
                            return "Tu dois avoir exactement " + requirement.slice(3) + " points pour utiliser cette fonction"
                        else if (requirement.startsWith("pt<") && usrfile.points >= parseInt(requirement.slice(3)))
                            return "Tu as trop de points pour pouvoir utiliser cette fonction (il faut " + (parseInt(requirement.slice(3)) - 1) + " points max)"
                    }
                    else if (requirement.startsWith("lvl")) {
                        if (requirement.startsWith("lvl>") && usrfile.level <= parseInt(requirement.slice(4)))
                            return "Tu n'as pas le niveau requis pour pouvoir utiliser cette fonction (il faut être de niveau " + (parseInt(requirement.slice(4)) + 1) + ")"
                        else if (requirement.startsWith("lvl=") && usrfile.level != parseInt(requirement.slice(4)))
                            return "Tu dois être exactement de niveau " + requirement.slice(4) + " pour utiliser cette fonction"
                        else if (requirement.startsWith("lvl<") && usrfile.level >= parseInt(requirement.slice(4)))
                            return "Tu es trop haut niveau pour pouvoir utiliser cette fonction (il faut être de niveau " + (parseInt(requirement.slice(4)) - 1) + " max)"
                    }
                }
            }

            // send msg in specific channel
            else if (action.startsWith("sendmsg")) {
                var channeltosend = getChannel(client, channel, actionArgs[1])
                if (!channeltosend)
                    return "L'action est indisponible actuellement (channel manquant)"
                //console.log(actionArgs)

                if (requirementsNeeded.sendmsginchannel && !channeltosend.permissionsFor(member).has('SEND_MESSAGES', true))
                    return "Tu ne peux pas envoyer de message dans ce channel"

                var msgtosend = messageBuilder(actionArgs.slice(2).join(':'), actargs, varsofcommand, client)

                channeltosend.send(msgtosend)
                processedActionsDescription += "· Message envoyé dans le channel #" + channeltosend.name + "\n"
                processedLoggedActions += "·msg sent in #" + channeltosend.id + "\n"
                processedActions++;
            }

            // send mp msg to specific usr
            else if (action.startsWith("sendmp")) {
                var usrtosend = client.users.cache.get(actionArgs[1])
                if (!usrtosend)
                    return "L'action est indisponible actuellement (channel manquant)"

                var msgtosend = messageBuilder(actionArgs.slice(2).join(':'), actargs, varsofcommand, client)

                usrtosend.send(msgtosend)

                processedActionsDescription += "· Message privé envoyé à " + usrtosend.tag + "\n"
                processedLoggedActions += "·mp sent to " + usrtosend.id + "\n"
                processedActions++;

            }

            // send mp msg to usr
            else if (action.startsWith("sendusrmp")) {
                var usrtosend = member.user;
                if (!usrtosend)
                    return "L'action est indisponible actuellement (channel manquant)"

                var msgtosend = messageBuilder(actionArgs.slice(1).join(':'), actargs, varsofcommand, client)

                usrtosend.send(msgtosend)

                processedActionsDescription += "· Message privé envoyé\n"
                processedLoggedActions += "·mp sent to " + usrtosend.id + " (himself)\n"
                processedActions++;

            }

            // add role
            else if (action.startsWith("addrole")) {
                var roletogive = guild.roles.cache.get(actionArgs[1])
                if (!roletogive)
                    return "Le rôle demandé n'est pas disponible."

                member.roles.add(roletogive)

                processedActionsDescription += "· Rôle @" + roletogive.name + " ajouté\n"
                processedLoggedActions += "·Rôle @" + roletogive.name + " ajouté\n"
                processedActions++;

            }

            // remove role(s)
            else if (action.startsWith("remrole")) {

                var listidroletoremove = actionArgs[1].split(",");

                var removedroles = 0;
                var removedrolesnames = "";
                for (const idroletoremove of listidroletoremove) {
                    var roletoremove = guild.roles.cache.get(idroletoremove) // guild.roles.cache.find(r => r.id === idroletoremove);
                    if (!roletoremove || roletoremove == "")
                        return "Impossible d'enlever un rôle qui n'est pas disponible."
                    //if (member.roles.cache.has(roletoremove)) {
                    if (member.roles.cache.some((role) => role.id === idroletoremove)) {
                        //console.log("removing : " + roletoremove.name);
                        member.roles.remove(roletoremove)
                        removedroles++
                        removedrolesnames += "@" + roletoremove.name + " "
                    }
                }

                if (everyinfo) {
                    if (removedroles > 0)
                        processedActionsDescription += "· Rôle" + pluriel(removedroles) + removedrolesnames + "retiré" + pluriel(removedroles) + "\n"
                    else
                        processedActionsDescription += "· Aucun rôle retiré\n"
                    processedActions++;
                }
                if (removedroles > 0)
                    processedLoggedActions += "·Rôle(s) " + removedrolesnames + "retiré(s)\n"
                else
                    processedLoggedActions += "·Aucun rôle retiré\n"
            }

            // add badge
            else if (action.startsWith("addbadge")) {
                if (!usrfile.badges.includes(actionArgs[1]))
                    usrfile.badges.push(actionArgs[1])
                processedActionsDescription += "· Badge " + actionArgs[1] + " ajouté\n"
                processedLoggedActions += "·Badge " + actionArgs[1] + " ajouté\n"
                processedActions++;
            }

            // add/rem xp
            else if (action.startsWith("xp")) {
                var xpToAdd = parseInt(actionArgs[1])
                usrfile.xp += xpToAdd
                processedActionsDescription += plusoumoins(xpToAdd) + " xp\n"
                processedLoggedActions += "+" + xpToAdd + " xp\n"
                processedActions++;
            }

            // add/rem points
            else if (action.startsWith("pt")) {
                var pointsToAdd = parseInt(actionArgs[1])
                if (pointsToAdd < 0 && usrfile.points < Math.abs(pointsToAdd) && !(usrfile.isGod || usrfile.specialRole.includes("free"))) return "Tu n'as pas assez de points pour acheter ceci, " + (Math.abs(pointsToAdd) - usrfile.points) + " points manquants"

                if (pointsToAdd > 0 || !(usrfile.isGod || usrfile.specialRole.includes("free"))) {
                    usrfile.points += pointsToAdd
                    processedActionsDescription += plusoumoins(pointsToAdd) + " point" + pluriel(pointsToAdd) + "\n"
                    processedLoggedActions += "+" + pointsToAdd + " pt\n"
                    price = pointsToAdd;
                }
                else {
                    processedActionsDescription += pointsToAdd + " pt" + pluriel(pointsToAdd) + " - Mais tu es magiquement immunisé et tu n'as pas perdu de points.\n"
                    processedLoggedActions += pointsToAdd + " pt" + pluriel(pointsToAdd) + " - But god or free -=0\n"
                }

                if (pointsToAdd < 0)
                    usrfile.stats.spentPoints -= pointsToAdd;
                processedActions++;
            }

            // other
            else {
                processedActionsDescription += "· Action: " + action + " inconnue\n"
                processedLoggedActions += "·Action: " + action + " inconnue\n"
                processedActions++;
            }
        }
        usrfile.stats.itemBought.push({ action: actionName, time: Date.now() })
        fm.saveusr(member.id, guild, usrfile)
        if (price < 0)
            shop.actions[actionName].spentPoints += Math.abs(price);
        shop.actions[actionName].bought.push({ usrid: member.id, time: Date.now() })
        fm.saveshop(guild, shop)
        // server shop log
        if (shop.config && shop.config.channelLogShop && logShop) {
            var costLog = "pour un coût inconnu";
            if (price > 0)
                costLog = "lui faisant gagner " + price + " points"
            else if (price < 0)
                costLog = "lui coûtant " + Math.abs(price) + " points"
            else
                costLog = "gratuitement"
            if (process) {
                var proprefix = ""
                if (shop.config.processPrefix)
                    proprefix = shop.config.processPrefix + " " + procesSepartor
                else
                    proprefix = procesSepartor
                var row = new MessageActionRow();
                row.addComponents(
                    new MessageButton()
                        .setCustomId("partychatprocessed")
                        .setLabel("Commande traitée")
                        .setStyle('SUCCESS'),
                )
                client.channels.cache.get(shop.config.channelLogShop).send({ content: `> ${proprefix}__${member.user.tag}__ (${member.user.id}) vient d'acheter : **${shop.actions[actionName].name}** *${costLog}*`, components: [row] })
            } else {
                client.channels.cache.get(shop.config.channelLogShop).send(`__${member.user.tag}__ (${member.user.id}) vient d'acheter : **${shop.actions[actionName].name}** *${costLog}*`)
            }
        }

        // bot log
        if (logact)
            logger.all(`Action Shop : ${actionName} sur ${guild.id} par ${member.id} :\`\`\`\n${processedLoggedActions}\`\`\``)

        // msg replied
        if (msgrecap)
            return `**${shop.actions[actionName].name}** : ${processedActions} action${pluriel(processedActions)} effectuée${pluriel(processedActions)} :\n\`\`\`diff\n${processedActionsDescription}\`\`\``
        else
            return "#noMSGrecap#"
    },


    autodelete: function (message) {
        try {
            /*var channelofmessage = client.channels.cache.get(doubleId.split("m")[0])
            var msgtodelete = channelofmessage.messages.fetch(doubleId.split("m")[1])*/
            message.delete();
        } catch (error) {

        }
        return "#noMSGrecap#"
    },
    processedbtn: function (message) {
        try {
            /*var channelofmessage = client.channels.cache.get(doubleId.split("m")[0])
            var msgtoprocess = channelofmessage.messages.fetch(doubleId.split("m")[1])*/
            message.edit({ content: message.content.split(procesSepartor).slice(1).join(procesSepartor), components: [] });
        } catch (error) {

        }
        return "#noMSGrecap#"
    }
}