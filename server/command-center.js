const { broadcast } = require("./websockets");

class CommandCenter {
    constructor(){
        this.ledger = [];
    }

    op(opperation){
        broadcast(opperation);
        this.ledger.push(opperation);
        this.ledger = this.ledger.sort((a, b) => {
            return a.timestamp - b.timestamp;
        });
        // TODO: get and perform current OP + all future OPs from ledger
    }
}
const command = new CommandCenter();
module.exports = command;