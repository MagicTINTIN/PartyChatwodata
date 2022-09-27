const { Permissions } = require('discord.js');

module.exports = {
    name: 'devinfo',
    description: 'Lister les commandes admin disponibles',
    execute(message) {
        if (message.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES)) {
            const { Client, MessageEmbed } = require('discord.js');
            const embedmeow = new MessageEmbed()
                .setTitle('Liste des commandes admin')
                .setColor(0xffa1a1)
                .setDescription(`Voici la liste des commandes pour les dev
\n> \`&non\` oui y a toujours pas de commandes pour les devs non plus...`);
            message.channel.send({ embeds: [embedmeow] });
        } else { message.channel.send('Tu n\'est pas modérateur !'); }
    }
}



