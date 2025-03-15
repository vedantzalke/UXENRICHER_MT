const Filter = require('bad-words');

function checkExplicitContent(text) {
    const filter = new Filter();
    return filter.isProfane(text); // Returns true if explicit content
}

module.exports = { checkExplicitContent };
