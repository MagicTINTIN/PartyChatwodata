const { GatewayDispatchEvents } = require('discord-api-types/v9');
const { Permissions, Client, MessageEmbed } = require('discord.js');
const fm = require("../../functions/game/fileManager.js");
const sm = require("../../functions/game/shopManager.js");

const shopchVersion = "1"
const itemshchVersion = "1"

function getXSpace(n) {
    const spacestr = " "
    return spacestr.repeat(n)
}

module.exports = {
    name: 'shop',
    description: 'Administrer le shop de PartyChat',
    async execute(message, args) {
        if (!message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) return message.channel.send('Tu n\'est pas administrateur !');
        if (!args || !args[0] || args[0] == "help") {
            const embedmeow = new MessageEmbed()
                .setTitle('Liste des sous commandes')
                .setColor(0xffa1a1)
                .setDescription(`\`&shop\`
\n> \`help\` Ce message
\n> \`read\` donne la liste des channels contenant un shop : - id (nom du channel)
\n> \`read id\` Pour lire la configuration d'un channel contenant un shop
\n> \`add channelid type help\` channelid peut être \`c\` (ou cnd) pour le channel dans lequel vous êtes
            les differents types sont : hr, embed, text, shopfiller
\n> \`edit channelid messageid type help\` channelid peut être \`c\` (ou cnd) pour le channel dans lequel vous êtes
            les différents types sont : hr, embed, text
\n> \`comp channelid messageid [reset]/[set help]\` pour supprimer le message de shop.
\n> \`del channelid messageid\` pour supprimer.

Gestion des actions
> \`act add/rem/set [help]\` pour ajouter/supprimer des actions (qui sont exécutées par les comp).
`);
            return message.channel.send({ embeds: [embedmeow] });
        }
        const { client } = require("../../index.js");

        var shop = fm.loadshop(message.guild)

        if (!shop) return message.channel.send("Une erreur s'est produite lors de la configuration du shop")

        if (args[0] == "read") {
            if (!args[1]) {
                var listtoreturn = "Voici la liste des shop : - id+du+channel+du+shop (#channel dans lequel il se trouve)\n\n";
                for (const chshop of shop.channels) {
                    listtoreturn += " - " + chshop.id + " (<#" + chshop.id + ">)\n"
                }
                listtoreturn += "\nTapez `&shop read id+d'un+channel+de+shop` pour obtenir plus d'informations"
                return message.channel.send(listtoreturn)
            } else {
                var chshopgot = sm.getch(shop, args[1])
                if (chshopgot.found) {
                    texttosend = "Informations à propos du shop du channel : " + args[1] + " (shop n°" + (chshopgot.itemNb + 1) + "/" + shop.channels.length + ")\n\n"
                    for (const itemOfShop of shop.channels[chshopgot.itemNb].itemList) {
                        if (itemOfShop.type && itemOfShop.type == "hr")
                            texttosend += "`" + itemOfShop.id + "`● <hr> -------------------- (x" + itemOfShop.properties.length + ")\n"
                        else if (itemOfShop.type && itemOfShop.type == "embed")
                            texttosend += "`" + itemOfShop.id + "`● <embed> `" + itemOfShop.properties.embedvar.title.slice(0, 18) + "`\n"
                        else if (itemOfShop.type && itemOfShop.type == "text")
                            texttosend += "`" + itemOfShop.id + "`● <text> " + itemOfShop.properties.text.split("\n").join("|") + "\n"
                        else if (itemOfShop.type && itemOfShop.type == "shopfiller")
                            texttosend += "`" + itemOfShop.id + "`● <x>\n"

                    }
                    message.channel.send(texttosend)
                }
                else
                    message.channel.send("Aucun shop trouvé avec cet id, pour obtenir la liste des id valides, tapez `&shop read`")
            }
        }


        // add part
        if (args[0] == "add" && args[2]) {
            var channeltosend;
            if (args[1] == "c" || args[1] == "cnd") {
                channeltosend = message.channel
                if (args[1] == "c")
                    message.delete();
            } else {
                try {
                    //console.log("-" + args[1] + "-");
                    channeltosend = client.channels.cache.get(args[1]);
                } catch (error) {
                    //console.error(error);
                    return message.channel.send('Ton ID de salon me paraît pas bon...');
                }
            }


            //hr type
            if (args[2] == "hr") {
                if (!args[3] || args[3] == "help") return message.channel.send("Vous devez spécifier la longueur de la barre de séparation `&shop add c hr 200` par exemple")
                var idOfItemShop;
                channeltosend.send("~~\u200B" + getXSpace(parseInt(args[3])) + "\u200B~~").then(sent => {
                    idOfItemShop = sent.id
                    var newItem = {
                        version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                        id: idOfItemShop,
                        type: "hr",
                        properties: {
                            length: parseInt(args[3])
                        },
                        pointsSpent: 0,
                        buttonsAndMenus: []
                    }
                    var chshopgot = sm.getch(shop, channeltosend.id)
                    if (chshopgot.found)
                        shop.channels[chshopgot.itemNb].itemList.push(newItem)
                    else
                        shop.channels.push({
                            version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                            version: shop.version + "." + shopchVersion,
                            id: channeltosend.id,
                            channelTotalSpent: 0,
                            itemList: [newItem]
                        })
                    fm.saveshop(message.guild, shop)
                });
            }

            //text type
            else if (args[2] == "text") {
                if (!args[3] || args[3] == "help") return message.channel.send("Vous devez écrire un message `&shop add c text Venez acheter ces items` par exemple")

                let msgtosend = args.slice(3).join(' ');
                channeltosend.send("\u200B" + msgtosend).then(sent => {
                    idOfItemShop = sent.id
                    var newItem = {
                        version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                        id: idOfItemShop,
                        type: "text",
                        properties: {
                            text: msgtosend
                        },
                        pointsSpent: 0,
                        buttonsAndMenus: []
                    }
                    var chshopgot = sm.getch(shop, channeltosend.id)
                    if (chshopgot.found)
                        shop.channels[chshopgot.itemNb].itemList.push(newItem)
                    else
                        shop.channels.push({
                            version: shop.version + "." + shopchVersion,
                            id: channeltosend.id,
                            channelTotalSpent: 0,
                            itemList: [newItem]
                        })
                    fm.saveshop(message.guild, shop)
                });
            }

            //embed type
            else if (args[2] == "embed") {
                if (!args[5] || args[3] == "help") return message.channel.send("Vous devez spécifier la couleur hexa, le titre et la description. L'image et la vignette sont facultatives.\n`&shop add c embed ff0000 Le+titre (img:lien+de+l'image) (vgn:lien+de+la+vignette) La description` par exemple")
                const embed = new MessageEmbed()
                    .setColor(args[3].replace('#', ''))

                if (args[4] != "n")
                    embed.setTitle(args[4].split('+').join(' '))

                if (args[5] && args[5].startsWith("img:"))
                    embed.setImage(args[5].replace("img:", ""))
                if (args[6] && args[6].startsWith("img:"))
                    embed.setImage(args[6].replace("img:", ""))
                if (args[5] && args[5].startsWith("vgn:"))
                    embed.setThumbnail(args[5].replace("vgn:", ""))
                if (args[6] && args[6].startsWith("vgn:"))
                    embed.setThumbnail(args[6].replace("vgn:", ""))

                if (args[5] && (args[5].startsWith("vgn:") || args[5].startsWith("img:")))
                    if (args[6] && (args[6].startsWith("vgn:") || args[6].startsWith("img:")))
                        var descriptionembed = args.slice(7).join(" ")
                    else
                        var descriptionembed = args.slice(6).join(" ")
                else
                    var descriptionembed = args.slice(5).join(" ")

                if (descriptionembed != "n")
                    embed.setDescription("\u200B" + descriptionembed)

                channeltosend.send({ embeds: [embed] }).then(sent => {
                    idOfItemShop = sent.id
                    var newItem = {
                        version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                        id: idOfItemShop,
                        type: "embed",
                        properties: {
                            embedvar: embed
                        },
                        pointsSpent: 0,
                        buttonsAndMenus: []
                    }
                    var chshopgot = sm.getch(shop, channeltosend.id)
                    if (chshopgot.found)
                        shop.channels[chshopgot.itemNb].itemList.push(newItem)
                    else
                        shop.channels.push({
                            version: shop.version + "." + shopchVersion,
                            id: channeltosend.id,
                            channelTotalSpent: 0,
                            itemList: [newItem]
                        })
                    fm.saveshop(message.guild, shop)
                });
            }

            if (args[2] == "shopfiller") {
                if (!args[3] || args[3] == "help") return message.channel.send("Vous devez spécifier le nombre d'entrées du shop `&shop add c shopfiller 12` par exemple")
                var totalNbMsg = parseInt(args[3])
                var msgNb = 0;
                var fillersender = setInterval(() => {
                    msgNb++
                    if (msgNb > totalNbMsg) {
                        clearInterval(fillersender);

                        fm.saveshop(message.guild, shop)
                    }
                    else {
                        channeltosend.send("\u200B - : " + msgNb)
                            .then(sent => {
                                idOfItemShop = sent.id
                                var newItem = {
                                    version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                                    id: idOfItemShop,
                                    type: "text",
                                    properties: {
                                        text: "\u200B - : " + msgNb
                                    },
                                    pointsSpent: 0,
                                    buttonsAndMenus: []
                                }
                                var chshopgot = sm.getch(shop, channeltosend.id)
                                if (chshopgot.found)
                                    shop.channels[chshopgot.itemNb].itemList.push(newItem)
                                else
                                    shop.channels.push({
                                        version: shop.version + "." + shopchVersion,
                                        id: channeltosend.id,
                                        channelTotalSpent: 0,
                                        itemList: [newItem]
                                    })
                            });
                    }
                }, 2000)
            }
        }
        // edit part
        else if (args[0] == "edit" && args[3]) {
            var channeltosend, messagetoedit;

            if (args[1] == "c" || args[1] == "cnd") {
                channeltosend = message.channel
                if (args[1] == "c")
                    message.delete();
            } else {
                try {
                    //console.log("-" + args[1] + "-");
                    channeltosend = client.channels.cache.get(args[1]);
                } catch (error) {
                    //console.error(error);
                    return message.channel.send('Ton ID de salon me paraît pas bon...');
                }
            }

            try {
                await channeltosend.messages.fetch(args[2]).then(msg => {
                    if (msg.editable)
                        messagetoedit = msg;
                    else
                        return message.channel.send("Ce message n'est pas éditable");
                })
                // if (messagetoedit.editable)
                //     console.log("editable")
                // else
                //     return message.channel.send("Ce message n'est pas éditable");
                //console.log(messagetoedit);
            } catch (error) {
                //console.error(error);
                return message.channel.send('Ton ID de message me paraît pas bon...');
            }

            // check if this message is a shop element
            var chshopgot = sm.getch(shop, channeltosend.id)
            if (!chshopgot.found) return message.channel.send("Ce channel ne contient aucun shop")
            var msgshopgot = sm.getmsg(shop.channels[chshopgot.itemNb], messagetoedit.id)
            if (!msgshopgot.found) return message.channel.send("Ce message ne contient aucun shop")


            //hr type
            if (args[3] == "hr") {
                if (!args[4] || args[4] == "help") return message.channel.send("Vous devez spécifier la longueur de la barre de séparation `&shop add c hr 200` par exemple")
                var idOfItemShop;
                messagetoedit.edit({ content: "~~\u200B" + getXSpace(parseInt(args[4])) + "\u200B~~", embeds: [] })
                idOfItemShop = messagetoedit.id
                var newItem = {
                    version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                    id: idOfItemShop,
                    type: "hr",
                    properties: {
                        length: parseInt(args[4])
                    },
                    pointsSpent: 0,
                    buttonsAndMenus: []
                }

                shop.channels[chshopgot.itemNb].itemList[msgshopgot.itemNb] = newItem;
                fm.saveshop(message.guild, shop)
            }

            //text type
            else if (args[3] == "text") {
                if (!args[4] || args[4] == "help") return message.channel.send("Vous devez écrire un message `&shop add c text Venez acheter ces items` par exemple")

                let msgtosend = args.slice(4).join(' ');
                messagetoedit.edit({ content: "\u200B" + msgtosend, embeds: [] })
                idOfItemShop = messagetoedit.id
                var newItem = {
                    version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                    id: idOfItemShop,
                    type: "text",
                    properties: {
                        text: msgtosend
                    },
                    pointsSpent: 0,
                    buttonsAndMenus: []
                }

                shop.channels[chshopgot.itemNb].itemList[msgshopgot.itemNb] = newItem;
                fm.saveshop(message.guild, shop)
            }

            //embed type
            else if (args[3] == "embed") {
                if (!args[6] || args[4] == "help") return message.channel.send("Vous devez spécifier la couleur hexa, le titre et la description. L'image et la vignette sont facultatives.\n`&shop add c embed ff0000 Le+titre (img:lien+de+l'image) (vgn:lien+de+la+vignette) La description` par exemple")
                const embed = new MessageEmbed()
                    .setColor(args[4].replace('#', ''))
                if (args[5] != "n")
                    embed.setTitle(args[5].split('+').join(' '))

                if (args[6] && args[6].startsWith("img:"))
                    embed.setImage(args[6].replace("img:", ""))
                if (args[7] && args[7].startsWith("img:"))
                    embed.setImage(args[7].replace("img:", ""))
                if (args[6] && args[6].startsWith("vgn:"))
                    embed.setThumbnail(args[6].replace("vgn:", ""))
                if (args[7] && args[7].startsWith("vgn:"))
                    embed.setThumbnail(args[7].replace("vgn:", ""))

                if (args[6] && (args[6].startsWith("vgn:") || args[6].startsWith("img:")))
                    if (args[7] && (args[7].startsWith("vgn:") || args[7].startsWith("img:")))
                        var descriptionembed = args.slice(8).join(" ")
                    else
                        var descriptionembed = args.slice(7).join(" ")
                else
                    var descriptionembed = args.slice(6).join(" ")

                if (descriptionembed != "n")
                    embed.setDescription(descriptionembed + "\u200B")

                messagetoedit.edit({ content: null, embeds: [embed] }) //"\u200B"
                idOfItemShop = messagetoedit.id
                var newItem = {
                    version: shop.version + "." + shopchVersion + "." + itemshchVersion,
                    id: idOfItemShop,
                    type: "embed",
                    properties: {
                        embedvar: embed
                    },
                    pointsSpent: 0,
                    buttonsAndMenus: []
                }


                shop.channels[chshopgot.itemNb].itemList[msgshopgot.itemNb] = newItem;
                fm.saveshop(message.guild, shop)
            }

        }
        // delete part
        else if (args[0] == "del" && args[2]) {
            var channeltosend, messagetodelete;

            if (args[1] == "c" || args[1] == "cnd") {
                channeltosend = message.channel
                if (args[1] == "c")
                    message.delete();
            } else {
                try {
                    //console.log("-" + args[1] + "-");
                    channeltosend = client.channels.cache.get(args[1]);
                } catch (error) {
                    //console.error(error);
                    return message.channel.send('Ton ID de salon me paraît pas bon...');
                }
            }

            try {
                await channeltosend.messages.fetch(args[2]).then(msg => {
                    if (msg.deletable)
                        messagetodelete = msg;
                    else
                        return message.channel.send("Ce message n'est pas supprimable");
                })
            } catch (error) {
                //console.error(error);
                return message.channel.send('Ton ID de message me paraît pas bon...');
            }

            // check if this message is a shop element
            var chshopgot = sm.getch(shop, channeltosend.id)
            if (!chshopgot.found) return message.channel.send("Ce channel ne contient aucun shop")
            var msgshopgot = sm.getmsg(shop.channels[chshopgot.itemNb], messagetodelete.id)
            if (!msgshopgot.found) return message.channel.send("Ce message ne contient aucun shop")

            shop.channels[chshopgot.itemNb].itemList.splice(msgshopgot.itemNb, 1);
            messagetodelete.delete();
        }
        // component (buttons & menus) part
        else if (args[0] == "comp" && args[2]) {

            if (!args[3] || args[3] == "help" || !(args[3] == "reset" || args[3].startsWith("set"))) return message.channel.send("Il faut choisir entre set ou reset : `&shop comp channelid messageid [reset]/[set help]`")
            var channeltosend, messagetocomp;

            if (args[1] == "c" || args[1] == "cnd") {
                channeltosend = message.channel
                if (args[1] == "c")
                    message.delete();
            } else {
                try {
                    //console.log("-" + args[1] + "-");
                    channeltosend = client.channels.cache.get(args[1]);
                } catch (error) {
                    //console.error(error);
                    return message.channel.send('Ton ID de salon me paraît pas bon...');
                }
            }

            try {
                await channeltosend.messages.fetch(args[2]).then(msg => {
                    if (msg.editable)
                        messagetocomp = msg;
                    else
                        return message.channel.send("Ce message n'est pas modifiable");
                })
            } catch (error) {
                //console.error(error);
                return message.channel.send('Ton ID de message me paraît pas bon...');
            }

            // check if this message is a shop element
            var chshopgot = sm.getch(shop, channeltosend.id)
            if (!chshopgot.found) return message.channel.send("Ce channel ne contient aucun shop")
            var msgshopgot = sm.getmsg(shop.channels[chshopgot.itemNb], messagetocomp.id)
            if (!msgshopgot.found) return message.channel.send("Ce message ne contient aucun shop")

            var compList = [];
            if (args[3] == "reset") {
                shop.channels[chshopgot.itemNb].itemList[msgshopgot.itemNb].buttonsAndMenus = compList
                return messagetocomp.edit({ components: compList });
            }
            if (!args[4] || args[4] == "help")
                return message.channel.send(`Voici un exemple de fonctionnement : &shop comp channelid messageid set;
btn Nom+du+bouton actionName color(n);
btn Nom+du+bouton actionName color(n);
menu Nom+du+menu - Nom+du+choix+1 destciption+1 action1 - Nom+du+choix+2 destciption+2 action2`)
            else {
                var extractedData = []

                var componentsOfMessage = message.content.split(/\n+/).join("").split(/\;+/);
                componentsOfMessage.shift()
                for (const element of componentsOfMessage) {
                    if (element.startsWith("btn")) {
                        var argsofBtn = element.split(/ +/)

                        /*if (argsofBtn[4] && argsofBtn[4] == "unique")
                            uniqueUsage = true;
                        else
                            uniqueUsage = false;*/

                        extractedData.push({
                            type: "btn",
                            name: argsofBtn[1].split("+").join(" "),
                            action: argsofBtn[2],
                            color: argsofBtn[3],
                            //unique: uniqueUsage
                        });
                    }
                    else if (element.startsWith("menu")) {
                        var argsofMenu = element.split(/\-+/)
                        var menuProp = argsofMenu.shift().split(/ +/);
                        var choicesMenu = []
                        // filter to delete "" elements
                        var argsofMenu = argsofMenu.filter(function (el) {
                            return el != "";
                        });

                        for (const choiceOfMenu of argsofMenu) {
                            var choiceProp = choiceOfMenu.split(/ +/).filter(function (el) {
                                return el != "";
                            });
                            choicesMenu.push({
                                name: choiceProp[0].split("+").join(" "),
                                description: choiceProp[1].split("+").join(" "),
                                action: choiceProp[2]
                            })
                        }

                        /*if (menuProp[2] && menuProp[2] == "unique")
                            uniqueUsage = true;
                        else
                            uniqueUsage = false;*/

                        extractedData.push({
                            type: "menu",
                            name: menuProp[1].split("+").join(" "),
                            choices: choicesMenu,
                            //usage: uniqueUsage
                        });
                    }
                }
                var result = sm.buildComp(extractedData)
                if (result.error) {
                    message.channel.send("Une erreur est survenue lors de la création des boutons/menus : " + result.errormsg)
                }
                compList = result.comps
                shop.channels[chshopgot.itemNb].itemList[msgshopgot.itemNb].buttonsAndMenus = compList
                fm.saveshop(message.guild, shop)
                return messagetocomp.edit({ components: compList });
            }
        }
        else if (args[0] == "act" && args[1]) {
            if (args[1] == "rem") {
                if (!args[2] || args[2] == "help")
                    return message.channel.send("Tu dois indiquer le nom de l'action à supprimer `&shop act rem NomDeLactionASupprimer`")
                try {
                    if (!shop.actions[args[2].toLowerCase()])
                        return message.channel.send("Cette action n'existait déjà pas")
                    delete shop.actions[args[2].toLowerCase()]

                    fm.saveshop(message.guild, shop)
                    return message.channel.send("L'action " + args[2] + " a bien été supprimée")
                } catch (error) {
                    return message.channel.send("Cette action n'existait déjà plus, ou n'est pas supprimable")
                }
            }
            else if (args[1] == "add") {
                if (!args[2] || args[2] == "help")
                    return message.channel.send("Tu dois indiquer le nom de l'action à ajouter ainsi que les actions à effectuer `&shop act add NomDeLactionAAjouter Nom+affiché action1&action2`\n" +
                        `Les actions disponibles sont: 

> onlyonce //La commande sera valable une unique fois pour cette action par utilisateur
> log:on|off (on by default) // logs du bot
> logshop:on|off (on by default) // envoyer dans un channel spécifique les logs des achats
> process:on|off (off by default) // créer un bouton pour valider une commande
> msgrecap:on|off (on by default) // envoyer un recap
> everyinfo:on|off (off by default) // si activé affiche d'autres infos comme la suppression de rôles

> cooldown:Xmillisecondes

> require:req1,req2...
reqs peuvent être : xp>600 pt=42 lvl<3
ou encore : can.sendmsginch  (par défaut l'action enverra le message dans le channel quoi qu'il arrive)
ou également : hasrole.NomDuRôle ou hasbadge.NomDuBadge

> sendmsg:idchannel:Message à envoyer depuis le channel $c, //idchannel peut être remplacé par c, pour le channel courant de l'exécution
> sendmp:idusr:Message à envoyer par $u depuis $g,
> sendusrmp:Message à envoyer en mp depuis $g à la personne ayant interagi
Pour les msg il existe des variables fixes qui seront remplacées automatiquement : $g = guild.name | $u = user.tag | $c = channel.name
Mais également des variables dynamiques qui prendront les valeurs des arguments des fonctions / par exemple : /supermessage message:Contenu -> $message prendra la valeur Contenu
Si vous ne souhaitez qu'elle ne soit remplacée que si la variable existe écrivez (%message) au lieu de $message
Pour envoyer un embed, commencez le message par [embed]color.hexadecimal|title.titre de l'embed|author|img.lien+de+l'image|content.Le contenu|footer.command[/embed]
> addrole:idrole,
> remrole:idrole1,idrole2
> addbadge:NomDuBadge
> xp:XX,
> pt:-XX`)
                var actiontoadd = {
                    script: args.slice(4).join(" "),
                    name: args[3].split("+").join(" "),
                    bought: [],
                    spentPoints: 0
                }
                shop.actions[args[2].toLowerCase()] = actiontoadd
                fm.saveshop(message.guild, shop)
                message.channel.send("L'action " + args[2].toLowerCase() + " a été ajoutée avec succès : \nActions à effectuer :\n```\n - " + args.slice(4).join(" ").split("&").join("\n - ") + "```")
            }

            else if (args[1] == "lst") {
                if (args[2] && args[2] == "help")
                    return message.channel.send("Liste l'ensembles des actions disponibles")
                var msgtosend = "Voici la liste des actions déjà existantes :\n"
                for (const action in shop.actions) {
                    if (msgtosend.length > 1500) {
                        message.channel.send(msgtosend)
                        msgtosend = ""
                    }
                    msgtosend += "> " + action + " (**" + shop.actions[action].name + "**) : \n```\n - " + shop.actions[action].script.split("&").join("\n - ") + "```> achetée " + shop.actions[action].bought.length + " fois (pour " + shop.actions[action].spentPoints + " pts en tout)\n\n"
                }

                message.channel.send("\u200B" + msgtosend)
            }
            else
                return message.channel.send("Tu dois choisir soit add soit rem, `&shop act add/rem/lst`")
        }
        // else
        else {
            message.channel.send("Pour obtenir de l'aide `&shop help`")
        }
    }
}
