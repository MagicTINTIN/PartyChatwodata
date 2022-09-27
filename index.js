console.log("DÉMARRAGE DE PartyChat")
console.log("-----------------------------------INITIALISATION--------------------------------------------");
//console.log(process.env);
//return console.log("token", process.env.TOKEN);
// --- INTIALIZING BOT ---
initialized = false;
// Import main infos
const { token } = require('./config/credentials.json');

// Import librairies
const { Client, Intents } = require('discord.js');
const { AudioPlayer } = require("@discordjs/voice");
audioPlayer = new AudioPlayer();
exports.audioPlayer = audioPlayer;
// Client creation and export
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_WEBHOOKS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING
    ],
    partials: [
        'CHANNEL', // Required to receive DMs
    ]
});
exports.client = client;


// Import boot
const logger = require("./functions/logger");
const loader = require("./functions/loader");
const init = require("./functions/init");

// Init commands and functions
const botchannels = init.ChannelListLoader()
exports.botchannels = botchannels;
exports.dataJSON = init.configList();
const messageCheck = require("./functions/messageCheck");
const gmfct = require("./functions/game/gameFunctions");
const triggerCMD = require("./functions/triggerCMD");
const dev = require("./functions/dev");
const slashcmd = require("./functions/slashcmd");
const mp = require("./commands/mpcommand");
const imaGen = require("./functions/imaGen");
const contextButtons = require('./functions/contextButtons');
const triggerInteract = require('./functions/triggerInteract');
const triggerReact = require('./functions/triggerReact');
loader.loadcommands();

// Init Config servers
init.servCfgLoading();


// Prevents bot from crash
process.on('uncaughtException', function (err) {
    console.error(err);

    logger.all("📌 Un chat m'a coupé la route, mais je suis indemne");

    try {
        errorwide = err.stack
        messerror = errorwide.match(/(.{1,1800})/g);
        for (const msgparterror of messerror) {
            if (initialized)
                logger.channel("```diff\n-> " + msgparterror + "\n```");
        }
    } catch (err) {
        console.error(err);
    }
});


// when Chaline logged in Discord
client.once('ready', () => {
    init.activityMessage();
    init.loaderPostReady();
});


// Triggered when messages sent
client.on('messageCreate', message => {
    // Triggered when message is private
    if (!message.guildId && !message.author.bot) {
        try {
            mp.onMessage(message);
        } catch (error) {
            message.reply("Une erreur s'est produite. Si l'erreur ne vient pas de vous signalez l'erreur en indiquant ce que vous souhaitiez faire `;error l'erreur`\nErreur : `MSG-MP-0-0-MPCMD");
        }
        return;
    }

    if (mutedservers.includes(message.guildId)) return;
    // Then if not private and the server is not muted
    const guildcfg = message.guild
    const guildid = message.guildId;

    try {
        // dev function
        dev.testbot(message);

        gmfct.onMessage(message);
        messageCheck.general(message);

        // trigger command if it is
        triggerCMD.classic(message);

    } catch (error) {
        console.error(error);
        client.channels.cache.get(botchannels.errorChannel).send(`${message.author.tag}(id:${message.author.id}) a généré une erreur depuis le serveur ${message.guild.name} (channel : ${message.channel.id}) :\n\n ${message.content}`);
    }
});

// triggered when a slash or context menu command is executed
client.on('interactionCreate', interaction => {
    if (interaction.isMessageContextMenu())
        contextButtons.msgTriggered(interaction)
    else if (interaction.isUserContextMenu())
        contextButtons.usrTriggered(interaction)
    else if (interaction.isCommand())
        slashcmd.triggered(interaction)
    else
        triggerInteract.other(interaction)
});

client.on('messageReactionAdd', (messageReaction, user) => {
    triggerReact.on(messageReaction, user);
});

// triggered when a member join the server
client.on('guildMemberAdd', async member => {
    if (mutedservers.includes(member.guild.id)) return;
    // Then if server is not muted)
});


// triggered when there is a member update
client.on('guildMemberUpdate', (oldMember, newMember) => {
    if (mutedservers.includes(newMember.guild.id)) return;
    // when a member boost a server not muted
    if (oldMember.premiumSince !== newMember.premiumSince) {
        logger.all("New booster")
        gmfct.onBoost(newMember)
        //imaGen.boost(member);
    }
});

client.login(process.env.TOKEN);
