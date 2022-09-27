const fs = require('fs');
const path = require('path');
const { client } = require("../../index.js");
const { Client, MessageEmbed, MessageButton, MessageActionRow, Permissions, DiscordAPIError, MessageSelectMenu } = require('discord.js');
const logger = require("../logger.js");


const maxBtnInaRow = 5;
const maxRow = 5;
const MaxMenuChoices = 20;
MenuNb = 1

function createButton(row, name, action, color) {
    if (color == "n") {
        row.addComponents(
            new MessageButton()
                .setCustomId("actshp" + action.toLowerCase())
                .setLabel("\u200B" + name)
                .setStyle('SECONDARY'),
        )
    } else {
        row.addComponents(
            new MessageButton()
                .setCustomId("actshp" + action.toLowerCase())
                .setLabel("\u200B" + name)
                .setStyle(color),
        )
    }
    return row
}

function createMenu(name, choices) {
    var menutemp = new MessageSelectMenu()
        .setCustomId("menu" + MenuNb)
        .setPlaceholder(name)
    for (const choice of choices) {
        menutemp.addOptions(
            {
                label: "\u200B" + choice.name,
                description: "\u200B" + choice.description,
                value: "actshp" + choice.action.toLowerCase(),
            })
    }

    const row = new MessageActionRow()
        .addComponents(
            menutemp
        );
    MenuNb++;
    return row
}

module.exports = {
    // Check general properties of message
    getch: function (shop, idshop) {
        var chshfound = false;
        var chshNb = 0;
        while (!chshfound && chshNb < shop.channels.length) {
            if (shop.channels[chshNb] && shop.channels[chshNb].id == idshop)
                chshfound = true;
            else
                chshNb++;
        }
        return { found: chshfound, itemNb: chshNb };
    },
    getmsg: function (shopch, idmsg) {
        var msgFound = false;
        var itemNb = 0;
        while (!msgFound && itemNb < shopch.itemList.length) {
            if (shopch.itemList[itemNb] && shopch.itemList[itemNb].id == idmsg)
                msgFound = true;
            else
                itemNb++;
        }
        return { found: msgFound, itemNb: itemNb };
    },

    // constructors
    buildComp: function (componentList) {
        var comps = [];
        var compInARowNb = 1;
        var rowNb = 1;

        var row = new MessageActionRow()
        for (const element of componentList) {
            if (compInARowNb > maxBtnInaRow || rowNb > maxRow) {
                if (rowNb <= maxRow) {
                    comps.push(row)
                    rowNb++;
                }
                else
                    return { error: true, errormsg: "Nombre d'éléments maximum dépassé", comps: comps }
                var row = new MessageActionRow()
                compInARowNb = 1;
            }

            if (element.type == "btn") {
                row = createButton(row, element.name, element.action, element.color)
                compInARowNb++;
            }
            else if (element.type == "menu") {
                if (compInARowNb > 1) {
                    if (rowNb >= maxRow)
                        return { error: true, errormsg: "Nombre d'éléments maximum dépassé", comps: comps }
                    else {

                        comps.push(row)
                        rowNb++;

                        var row = new MessageActionRow()
                        compInARowNb = 1;

                        comps.push(createMenu(element.name, element.choices))
                        rowNb++;
                    }
                } else {
                    if (element.choices.length > MaxMenuChoices)
                        return { error: true, errormsg: "Nombre d'éléments maximum dans un menu dépassé", comps: comps }
                    comps.push(createMenu(element.name, element.choices))
                    rowNb++;
                }
            }
        }

        if (rowNb <= maxRow && compInARowNb > 1) {
            comps.push(row)
            rowNb++;
        }
        return { error: false, errormsg: "Composants générés", comps: comps }
    }
}
