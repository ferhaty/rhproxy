var crypto = require('crypto');

module.exports = {
decrypt: function(cryptkey, iv, encryptdata) {
    var decipher = crypto.createDecipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        decipher.update(encryptdata),
        decipher.final()
    ]);
},

encrypt: function(cryptkey, iv, cleardata) {
    var encipher = crypto.createCipheriv('aes-256-cbc', cryptkey, iv);
    return Buffer.concat([
        encipher.update(cleardata),
        encipher.final()
    ]);
}

}
