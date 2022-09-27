const fs = require('fs');
const path = require('path');
const Discord = require('discord.js');
const { client } = require("../index.js");
const logger = require("./logger.js");
const { token, appID } = require('../config/credentials.json');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // reload gifs NPH
    relgifs: function () {
        client.cmdgifsn = new Discord.Collection();
        client.cmdgifsp = new Discord.Collection();
        client.cmdgifsh = new Discord.Collection();
        const cmdgifFilesn = fs.readdirSync('./gif/Normal').filter(file => file.endsWith('.js'));
        const cmdgifFilesp = fs.readdirSync('./gif/Plus').filter(file => file.endsWith('.js'));
        const cmdgifFilesh = fs.readdirSync('./gif/Hard').filter(file => file.endsWith('.js'));

        for (const file of cmdgifFilesn) {
            cmdgifn = require(`../gif/Normal/${file}`);
            client.cmdgifsn.set(cmdgifn.name, cmdgifn);
        }
        console.log(" - Gif Normal");
        for (const file of cmdgifFilesp) {
            cmdgifp = require(`../gif/Plus/${file}`);
            client.cmdgifsp.set(cmdgifp.name, cmdgifp);
        }
        console.log(" - Gif Plus");
        for (const file of cmdgifFilesh) {
            cmdgifh = require(`../gif/Hard/${file}`);
            client.cmdgifsh.set(cmdgifh.name, cmdgifh);
        }
        console.log(" - Gif Hard");
    },
    // reload gifs of a specific server
    relgifsrv: function (idservgif, logsrvid) {
        if (logsrvid == 1) { console.log(idservgif); }
        eval(`client.cmdgifss.s${idservgif} = new Discord.Collection();`)
        const cmdgifFiless = fs.readdirSync(`./gif/servers/${idservgif}`).filter(file => file.endsWith('.js'));
        for (const file of cmdgifFiless) {
            cmdgifs = require(`../gif/servers/${idservgif}/${file}`);
            eval(`client.cmdgifss.s${idservgif}.set(cmdgifs.name, cmdgifs);`)
        }
    },
    // loads classic commands
    loadcommands: function () {
        client.commands = new Discord.Collection();

        const publicCommandFiles = fs.readdirSync('./commands/public').filter(file => file.endsWith('.js'));
        const adminCommandFiles = fs.readdirSync('./commands/admin').filter(file => file.endsWith('.js'));
        const devCommandFiles = fs.readdirSync('./commands/dev').filter(file => file.endsWith('.js'));
        const fullpowersCommandFiles = fs.readdirSync('./commands/fullpowers').filter(file => file.endsWith('.js'));

        for (const file of publicCommandFiles) {
            const command = require(`../commands/public/${file}`);
            client.commands.set(command.name, command);
        }
        for (const file of adminCommandFiles) {
            const command = require(`../commands/admin/${file}`);
            client.commands.set(command.name, command);
        }
        for (const file of devCommandFiles) {
            const command = require(`../commands/dev/${file}`);
            client.commands.set(command.name, command);
        }
        for (const file of fullpowersCommandFiles) {
            const command = require(`../commands/fullpowers/${file}`);
            client.commands.set(command.name, command);
        }
    },
    cfgSrvLoader: function () {
        const srvcfgFiles = fs.readdirSync('./servers')//.filter(file => file.endsWith('.json'));
        for (const folder of srvcfgFiles) {
            try {
                const cfgname = folder
                var serverconfigtoload = JSON.parse(fs.readFileSync(path.resolve(`./servers/${folder}/server.json`)));
                client.cfgsrvs.set(cfgname, serverconfigtoload);
                console.log(cfgname, " : ");


                var nbMem = 0;
                var memberDict = {}
                const membersOfServFiles = fs.readdirSync(`./servers/${folder}/members`).filter(file => file.endsWith('.json'));
                for (const memOfServ of membersOfServFiles) {
                    try {
                        var usrOfSrvToLoad = JSON.parse(fs.readFileSync(path.resolve(`./servers/${folder}/members/${memOfServ}`)));
                        memberDict[memOfServ.replace(".json", "")] = usrOfSrvToLoad;

                        nbMem++
                    } catch (error) {
                        console.log("-err : " + memOfServ);
                    }
                }
                try {
                    var servershopconfigtoload = JSON.parse(fs.readFileSync(path.resolve(`./servers/${folder}/shop.json`)));

                    memberDict["shop"] = servershopconfigtoload
                    console.log("--- shop chargé");
                }
                catch (err) {
                    console.log("--- aucun shop");
                }
                client.usrdata.set(cfgname, memberDict);
                console.log("--- " + nbMem + " membres chargés");



            } catch (error) {
                //console.error(error);
                console.log(folder + " (aucune config)");
            }
            //console.log("- - End - -")
        }
    },
    // load special emojis
    emojisLoader: function () {
        pxclear = client.emojis.cache.get("837418338120368188");
    }

}