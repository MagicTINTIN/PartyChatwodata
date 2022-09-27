const points = require("../../functions/game/points.js");
const xp = require("../../functions/game/xp.js");
const badge = require("../../functions/game/badge.js");
const role = require("../../functions/game/role.js");

module.exports = {
    name: 'give',
    description: 'Donner des points/xp/badge',
    async execute(message, args) {
        const { client } = require("../../index.js");
        if (fullpower.includes(message.author.id)) {
            try {
                let type = args[0];
                let receiver = args[1].replace('<@', '').replace('>', '');
                console.log(receiver);
                let amount = parseInt(args[2]);

                if (type == "points") {
                    points.give(receiver, message.guild, amount)
                    message.channel.send("points updated")
                }
                else if (type == "xp") {
                    xp.give(receiver, message.guild, amount)
                    message.channel.send("xp updated")
                }
                else if (type == "badge") {
                    badge.give(receiver, message.guild, args[2])
                    message.channel.send("badge updated")
                }
                else if (type == "role") {
                    role.give(receiver, message.guild, args[2])
                    message.channel.send("role updated")
                }
                else {
                    message.channel.send("I can't give " + args[0] + " (only xp/points/badge/role)")
                }


            } catch (error) {
                console.log(error);
                message.channel.send("Une erreur s'est produite")
            }
        }
    }
}