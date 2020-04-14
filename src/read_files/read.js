const fs = require('fs');

module.exports = {
    get_advice(gr_number) {
        let files = [
            'cinema_gr1', 'listen_gr2', 'read_gr3','entertainment_gr4', 'vine_gr5',
        ];
        let advice = fs.readFileSync('./src/read_files/' + files[gr_number-1] + '.txt').toString().split("\n");
        console.log(advice);
        return advice[Math.floor(Math.random() * advice.length)];
    },
    add_advice(gr_number, to_add) {
        let files = [
            'cinema_gr1', 'listen_gr2', 'read_gr3','entertainment_gr4', 'vine_gr5',
        ];
        fs.appendFileSync(`./src/read_files/${files[gr_number-1]}.txt`, `\n${to_add}`, 'utf8');
    },
};