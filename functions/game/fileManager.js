const fs = require('fs');
const path = require('path');
const logger = require("../logger.js");

const shopVersion = "1"
const usrVersion = "1"

module.exports = {
    // Load file
    loadusr: function (memberid, guild, muted = false) {
        const { client } = require("../../index.js");
        if (client.usrdata && client.usrdata.get(guild.id) && client.usrdata.get(guild.id)[memberid])
            return client.usrdata.get(guild.id)[memberid]
        else if (!client.usrdata.get(guild.id)) {
            return;
        }
        try { // Loading previous if it is exist
            var previousfile = JSON.parse(fs.readFileSync(path.resolve(`./servers/${guild.id}/members/${memberid}.json`)));
            if (!muted) console.log("Mise en cache membre " + guild.id + " - " + memberid)
            client.usrdata.get(guild.id)[memberid] = previousfile;
            return previousfile
        } catch (err) {
            if (!muted) console.log("pas de fichier à recharger USERFILE : " + guild.id + " - " + memberid);
            var filememberjson = {
                version: usrVersion,
                visible: true,
                notVisibleReason: "",
                isGod: false,
                specialRole: "",
                thankable: true,
                notThankableReason: "",
                canThank: true,
                cantThankReason: "",
                memberId: memberid,
                points: 0,
                xp: 0,
                level: 0,
                badges: [],
                stats: {
                    messages: 0,
                    reactions: 0,
                    lastmessage: 0,
                    lastbonus: 0,
                    reactionList: [],
                    lastthank: 0,
                    thanks: [],
                    thanked: [],
                    hasboosted: [],
                    itemBought: [],
                    spentPoints: 0,
                    memory: 0,
                    quiz: 0,
                    participations: 0
                },
                events: {
                    participations: 0,
                    list: []
                },
                // personnalised data in case we need it
                vars: {
                    b1: false,
                    b2: false,
                    b3: false,
                    v1: null,
                    v2: null,
                    v3: null,
                    t1: "",
                    t2: "",
                    t3: "",
                    n1: 0,
                    n2: 0,
                    n3: 0,
                    n4: 0,
                    n5: 0,
                },
                lsts: {
                    l1: [],
                    l2: [],
                    l3: [],
                    l4: [],
                },
                dics: {
                    d1: {},
                    d2: {},
                    d3: {},
                }
            }
            return filememberjson
        }

    },
    saveusr: function (memberid, guild, filememberjson, muted = false) {
        const { client } = require("../../index.js");
        if (!client.usrdata.get(guild.id)) {
            return;
        }
        client.usrdata.get(guild.id)[memberid] = filememberjson;
        // export new file
        const jsonStringcfg = JSON.stringify(filememberjson);
        fs.writeFile(`./servers/${guild.id}/members/${memberid}.json`, jsonStringcfg, err => {
            if (err) {
                if (!muted) console.log(`Error writing file of ${guild.id} - ${memberid}`, err)
            } else {
                if (!muted) console.log(`Successfully wrote file of ${guild.id} - ${memberid}`)
            }
        })
    },
    loadshop: function (guild, muted = false) {
        const { client } = require("../../index.js");
        if (client.usrdata && client.usrdata.get(guild.id) && client.usrdata.get(guild.id).shop)
            return client.usrdata.get(guild.id).shop
        else if (!client.usrdata.get(guild.id)) {
            return;
        }
        try { // Loading previous if it is exist
            previousfile = JSON.parse(fs.readFileSync(path.resolve(`./servers/${guild.id}/shop.json`)));
            if (!muted) console.log("Mise en cache SHOP " + guild.id)
            client.usrdata.get(guild.id).shop = previousfile;
            return previousfile
        } catch (err) {
            if (!muted) console.log("pas de fichier à recharger SHOP : " + guild.idd);
            fileshopjson = {
                version: shopVersion,
                config: {},
                guildId: guild.id,
                totalPointsSpent: 0,
                channels: [],
                actions: {},
                otherItems: {}
            }
            return fileshopjson
        }

    },
    saveshop: function (guild, fileshopjson, muted = false) {
        const { client } = require("../../index.js");
        if (!client.usrdata.get(guild.id)) {
            return;
        }
        client.usrdata.get(guild.id).shop = fileshopjson;
        // export new file
        const jsonStringcfg = JSON.stringify(fileshopjson);
        fs.writeFile(`./servers/${guild.id}/shop.json`, jsonStringcfg, err => {
            if (err) {
                if (!muted) console.log(`Error writing shop file of ${guild.id}`, err)
            } else {
                if (!muted) console.log(`Successfully wrote shop file of ${guild.id}`)
            }
        })
    }
}