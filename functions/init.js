const fs = require('fs'); //debut
const path = require('path');
const Discord = require('discord.js');
const { client } = require("../index.js");
const logger = require("./logger.js");
const loader = require("./loader.js");
const slashloader = require("./slashcmd.js");
const contextButtons = require("./contextButtons.js");
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    // load list of channels
    ChannelListLoader: function () {
        rawbotconfig = fs.readFileSync(path.resolve('config/botconfig.json'));
        return JSON.parse(rawbotconfig);
    },
    // load json conf
    configList: function () {
        // loads people that can use commands everywhere
        rawwhitelist = fs.readFileSync(path.resolve('config/whitelist.json'));
        whitelist = JSON.parse(rawwhitelist);
        // loads people who can't use chaline anymore
        rawwblacklist = fs.readFileSync(path.resolve('config/blacklist.json'));
        blacklist = JSON.parse(rawwblacklist);
        // loads infos about people who can't use chaline anymore
        rawwblacklistinfo = fs.readFileSync(path.resolve('config/blacklistinfo.json'));
        blacklistinfo = JSON.parse(rawwblacklistinfo);
        // loads servers in which bot wont be triggered
        rawmutedservers = fs.readFileSync(path.resolve('config/mutedservers.json'));
        mutedservers = JSON.parse(rawmutedservers);
        // loads chaline devs
        rawdevlist = fs.readFileSync(path.resolve('config/devlist.json'));
        devlist = JSON.parse(rawdevlist);
        // loads user with full power on it
        rawfullpower = fs.readFileSync(path.resolve('config/fullpower.json'));
        fullpower = JSON.parse(rawfullpower);
        // loads chaline devs
        rawpartyconfig = fs.readFileSync(path.resolve('config/partyconfig.json'));
        partyconfig = JSON.parse(rawpartyconfig);
        dataJSON = {
            whitelist: whitelist,
            blacklist: blacklist,
            devlist: devlist
        }
        return dataJSON;
    },

    servCfgLoading: function () {
        console.log("------------------------------------------------");
        slashloader.loadslash();
        console.log("Chargement des configs des serveurs : ");
        client.cfgsrvs = new Discord.Collection();
        client.usrdata = new Discord.Collection();
        loader.cfgSrvLoader()
    },
    // Init the bot activity
    activityMessage: function () {
        // playling list
        rawstatuslist = fs.readFileSync(path.resolve('config/statuslist.json'));
        statusList = JSON.parse(rawstatuslist);
        // linstening list
        rawlistenlist = fs.readFileSync(path.resolve('config/listenlist.json'));
        listenList = JSON.parse(rawlistenlist);
        // each 50s a random message is chosen
        client.user.setActivity(`waking up...`, { type: 'PLAYING' });
        setInterval(() => {
            statustype = Math.floor(Math.random() * 4) + 1;
            if (statustype === 1) {
                //choisi une activité au hasard
                const nbstatus = Math.floor(Math.random() * (listenList.length));
                client.user.setActivity(listenList[nbstatus], { type: 'LISTENING' });
            }
            else if (statustype >= 2) {
                //choisi une activité au hasard
                const nbstatus = Math.floor(Math.random() * (statusList.length));
                client.user.setActivity(statusList[nbstatus], { type: 'PLAYING' });
            }
        }, 50000);
    },
    loaderPostReady: function () {
        loader.emojisLoader();
        // message post ready
        const { botchannels } = require("../index.js");
        client.channels.cache.get(botchannels.statusChannel).send("**BOT ONLINE** : C'est party !");
        logger.all('---------------------------------------------------------------------------------------------\nInitialisation réussie !')
    }

}