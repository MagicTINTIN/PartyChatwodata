const importer = require('../../functions/game/importer.js');


module.exports = {
    name: 'import',
    description: 'Import data from',
    execute(message, args) {
        if (fullpower.includes(message.author.id))
            importer.api(message, args);
    }
}