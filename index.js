// BigchainDB server instance (e.g. https://example.com/api/v1/)
const API_PATH = 'http://localhost:9984/api/v1/'
let conn = new BigchainDB.Connection(API_PATH)
function refresh() {
    
    location.reload();
}

// function getUsers() {
//     let kayPairs = [];
//     let usernames = [];
//     conn.searchMetadata("Users")
//     .then( users => {
//         console.log(users)
//         var i;
//         let transactionIds = []
        
//         if (users) {
//             for (i=0; i<users.length; i++) {
//                 transactionIds.push(users[i]["id"])
//             }
            
//             for (i=0; i<transactionIds.length;i++) {
//                 const asset = conn.getTransaction(transactionIds[0]);
//                 kayPairs.push(asset["kayPair"]);
//                 usernames.push(asset["username"]);
//             }
//         }
        
//     })
//     return [kayPairs, usernames];
    
    

    
    

// }
function createUser() {
    const username = document.getElementById("username_create").value;
    console.log(typeof(username))
    const user = new BigchainDB.Ed25519Keypair();
    let keyPairs = [];
    let usernames = [];
    conn.searchMetadata("Users")
    .then( users => {
        console.log(users)
        var i;
        let transactionIds = []
        
        if (users) {
            for (i=0; i<users.length; i++) {
                transactionIds.push(users[i]["id"])
            }
            var i;
            for (i=0; i<users.length;i++) {
                conn.getTransaction(transactionIds[i]).then(
                    transaction => {
                        let data = transaction["asset"]["data"];
                        keyPairs.push(data["keyPair"]);
                        usernames.push(data["username"]);
                    }
                );
                
                
            }
        }
        setTimeout(function(){
            if (usernames.includes(username)) {
                alert("This username has already taken! Please use another one.");
            } else {
                const asset = {username: username, keyPair:user}
                console.log(asset)
                const tx = BigchainDB.Transaction.makeCreateTransaction(
                    // Define the asset to store, in this example it is the current temperature
                    // (in Celsius) for the city of Berlin.
                    asset,
                
                    // Metadata contains information about the transaction itself
                    // (can be `null` if not needed)
                    { type: "Users", datetime: new Date().toString()},
                
                    // A transaction needs an output
                    [ BigchainDB.Transaction.makeOutput(
                            BigchainDB.Transaction.makeEd25519Condition(user.publicKey))
                    ],
                    user.publicKey
                
                    )   
                    const txSigned = BigchainDB.Transaction.signTransaction(tx, user.privateKey)
                    conn.postTransactionCommit(txSigned).then(()=>{location.reload();})
        
            } 
    }, 1000);

        
    })
    // location.reload();
}

function addFund() {
    const username = document.getElementById("username_add").value;
    const amount = document.getElementById("amount").value;
    let keyPairs = [];
    let usernames = [];
    conn.searchMetadata("Users")
    .then( users => {
        console.log(users)
        var i;
        let transactionIds = []
        
        if (users) {
            for (i=0; i<users.length; i++) {
                transactionIds.push(users[i]["id"])
            }
            var i;
            for (i=0; i<users.length;i++) {
                conn.getTransaction(transactionIds[i]).then(
                    transaction => {
                        let data = transaction["asset"]["data"];
                        keyPairs.push(data["keyPair"]);
                        usernames.push(data["username"]);
                    }
                );
                
                
            }
        }})
    setTimeout(function(){
        var i;
        let contains = false;

        for (i=0;i<usernames.length;i++) {
            if (usernames[i] == username) {
                contains = true;
                break
            }
        }
        if (!contains){
            alert("This username does not exist.")
            return
        }
        console.log(i)
        console.log(keyPairs)
        console.log(keyPairs[i])

                
        
            
            conn.listOutputs(keyPairs[i].publicKey, false)
            .then(listUnspentOutputs => {
                if (listUnspentOutputs.length > 1) {
                    const transactionId = listUnspentOutputs[listUnspentOutputs.length-1]["transaction_id"];
                    conn.getTransaction(transactionId).then(
                        oldTransaction => {
                            const oldAmount = oldTransaction["outputs"][0]["amount"];
                            // console.log(oldAmount)
                            const newAmount = parseInt(oldAmount)+parseInt(amount);
                            const tx = BigchainDB.Transaction.makeCreateTransaction(
                                // Define the asset to store, in this example it is the current temperature
                                // (in Celsius) for the city of Berlin.
                                { value: "1 share"},
                            
                                // Metadata contains information about the transaction itself
                                // (can be `null` if not needed)
                                { datetime: new Date().toString() },
                            
                                // A transaction needs an output
                                [ BigchainDB.Transaction.makeOutput(
                                        BigchainDB.Transaction.makeEd25519Condition(keyPairs[i].publicKey), newAmount.toString())
                                ],
                                keyPairs[i].publicKey
                            
                                )   
                                const txSigned = BigchainDB.Transaction.signTransaction(tx, keyPairs[i].privateKey)
                                console.log(txSigned)
                                conn.postTransactionCommit(txSigned) 
                        });
                } else {
                    const tx = BigchainDB.Transaction.makeCreateTransaction(
                        // Define the asset to store, in this example it is the current temperature
                        // (in Celsius) for the city of Berlin.
                        { value: "1 share"},
                    
                        // Metadata contains information about the transaction itself
                        // (can be `null` if not needed)
                        { datetime: new Date().toString() },
                    
                        // A transaction needs an output
                        [ BigchainDB.Transaction.makeOutput(
                                BigchainDB.Transaction.makeEd25519Condition(keyPairs[i].publicKey), amount)
                        ],
                        keyPairs[i].publicKey
                        )   
                        const txSigned = BigchainDB.Transaction.signTransaction(tx, keyPairs[i].privateKey)
                        console.log(txSigned)
                        conn.postTransactionCommit(txSigned).then(()=>{location.reload();})
                } 
            })
    } ,1000)
    
}

function transfer() {
    const sender = document.getElementById("sender").value;
    const receiver = document.getElementById("receiver").value;
    if (sender == receiver) {
        alert("Illegal transfer detected");
        return
    }
    const amount = parseInt(document.getElementById("amount_receiver").value);
    let keyPairs = [];
    let usernames = [];
    let senderKey;
    let receiverKey;
    conn.searchMetadata("Users")
    .then(users => {
        console.log(users)
        var i;
        let transactionIds = []
        if (users) {
            for (i=0; i<users.length; i++) {
                transactionIds.push(users[i]["id"])
            }
            var i;
            for (i=0; i<users.length;i++) {
                conn.getTransaction(transactionIds[i]).then(
                    transaction => {
                        let data = transaction["asset"]["data"];
                        keyPairs.push(data["keyPair"]);
                        usernames.push(data["username"]);
                    }
                );
            }
        }})
        setTimeout(function(){
            var i;
            let foundReceiver = false;
            let foundSender = false;
            for (i=0;i<usernames.length;i++) {
                if (usernames[i] == receiver) {
                    foundReceiver = true;
                    receiverKey = keyPairs[i]
                }
                if (usernames[i] == sender) {
                    foundSender = true;
                    senderKey = keyPairs[i]
                }
            }
            if (foundReceiver && foundSender) {
                conn.listOutputs(receiverKey.publicKey, false)
                .then(receiverListUnspentOutputs => {
                    return conn.listOutputs(senderKey.publicKey, false)
                        .then(senderListUnspentOutputs => {
                            if (senderListUnspentOutputs.length > 1 && receiverListUnspentOutputs.length>1) {
                                const senderTransactionId = senderListUnspentOutputs[senderListUnspentOutputs.length-1]["transaction_id"];
                                const receiverTransactionId = receiverListUnspentOutputs[receiverListUnspentOutputs.length-1]["transaction_id"];
                                conn.getTransaction(senderTransactionId).then(
                                    senderTransaction => {
                                        conn.getTransaction(receiverTransactionId).then(
                                            receiverTransaction => {
                                                const senderAmount = parseInt(senderTransaction["outputs"][0]["amount"]);
                                                const receiverAmount = parseInt(receiverTransaction["outputs"][0]["amount"]);
                                                if (senderAmount < amount) {
                                                    alert("Sender do not have sufficient fund.");
                                                } else {
                                                    const senderNewAmount = senderAmount - amount;
                                                    const receiverNewAmount = receiverAmount + amount;
                                                    const tx = BigchainDB.Transaction.makeCreateTransaction(
                                                        // Define the asset to store, in this example it is the current temperature
                                                        // (in Celsius) for the city of Berlin.
                                                        { value: "1 share"},
                                                    
                                                        // Metadata contains information about the transaction itself
                                                        // (can be `null` if not needed)
                                                        { datetime: new Date().toString() },
                                                    
                                                        // A transaction needs an output
                                                        [ BigchainDB.Transaction.makeOutput(
                                                                BigchainDB.Transaction.makeEd25519Condition(senderKey.publicKey), senderNewAmount.toString())
                                                        ],
                                                        senderKey.publicKey
                                                        )   
                                                        const txSigned = BigchainDB.Transaction.signTransaction(tx, senderKey.privateKey)
                                                        conn.postTransactionCommit(txSigned).then(
                                                            () => {
                                                                const tx = BigchainDB.Transaction.makeCreateTransaction(
                                                                    // Define the asset to store, in this example it is the current temperature
                                                                    // (in Celsius) for the city of Berlin.
                                                                    { value: "1 share"},
                                                                
                                                                    // Metadata contains information about the transaction itself
                                                                    // (can be `null` if not needed)
                                                                    { datetime: new Date().toString() },
                                                                
                                                                    // A transaction needs an output
                                                                    [ BigchainDB.Transaction.makeOutput(
                                                                            BigchainDB.Transaction.makeEd25519Condition(receiverKey.publicKey), receiverNewAmount.toString())
                                                                    ],
                                                                    receiverKey.publicKey
                                                                    )   
                                                                    const txSigned = BigchainDB.Transaction.signTransaction(tx, receiverKey.privateKey)
                                                                    conn.postTransactionCommit(txSigned).then(()=>{location.reload();})
                                                            })
                                                    // const txTransferSigned = BigchainDB.Transaction.signTransaction(txTransfer, senderKey.privateKey, receiverKey.privateKey);
                                                    // conn.postTransactionCommit(txTransferSigned)
                                                }

                                        })
                                    })
                            }
                        })
                })
            } else {
                alert("illegal transfer detected!");
            }    
    }, 1000);
}

function httpGet(theUrl)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, false ); // false for synchronous request
    xmlHttp.send( null );
    return xmlHttp.responseText;
}



function render() {
    let height = 1;
    let keyPairs = [];
    let usernames = [];
    conn.searchMetadata("Users")
    .then( users => {
        console.log(users)
        var i;
        let transactionIds = []
        
        if (users) {
            for (i=0; i<users.length; i++) {
                transactionIds.push(users[i]["id"])
            }
            var i;
            
            for (i=0; i<users.length;i++) {
                conn.getTransaction(transactionIds[i]).then(
                    transaction => {
                        let data = transaction["asset"]["data"];
                        console.log(transaction)
                        // kayPairs.push(data["kayPair"]);
                        // usernames.push(data["username"]);
                        const username = data["username"];
                        const keyPair = data["keyPair"];
                        let html = ''
                        if (i %2 == 0) {
                            html += '<div class="row">'
                        }
                        html += '<div class="col"><div class="card" style="width: 18rem;"><img src="./icon.png" class="card-img-top" alt=" "><div class="card-body"><h5 class="User">'
                        html += '<p>Username: '+data["username"]+'</p>';
                        conn.listOutputs(keyPair.publicKey, false)
                        .then(listUnspentOutputs => {
                            if (listUnspentOutputs.length > 1) {
                                const transactionId = listUnspentOutputs[listUnspentOutputs.length-1]["transaction_id"];
                                conn.getTransaction(transactionId).then(
                                    transaction => {
                                        const amount = parseInt(transaction["outputs"][0]["amount"]);
                                        // html += '<div class="col"><div class="card" style="width: 18rem;"><img src="./icon.png" class="card-img-top" alt=" "><div class="card-body"><h5 class="User">'
                                        // html += '<p>Username: '+data["username"]+'</p>';
                                        html += '<p>Balance: '+amount+'</p></div>'
                                        html += '<a href="#" class="btn btn-primary">Profile</a></div></div></div>'
                                        if (i %2 == 0) {
                                            html += '</div>'
                                        } 
                                        $("#users").append(html)
                                        // $("#users").append()
                                        // $("#users").append('<p>Username: '+data["username"]+'</p>')
                                        // $("#users").append('<p>Balance: '+amount+'</p></div>')
                                        // $("#users").append('<a href="#" class="btn btn-primary">Profile</a></div></div>')
                                    })
                            } else {
                                
                                html += '<p>Balance: 0</p></div>'
                                html += '<a href="#" class="btn btn-primary">Profile</a></div></div></div>'
                                if (i %2 == 0) {
                                    html += '</div>'
                                } 
                                $("#users").append(html)
                                // $("#users").append('<div class="card" style="width: 18rem;"><img src="..." class="card-img-top" alt="..."><div class="card-body"><h5 class="User">')
                                // $("#users").append('<p>Username: '+data["username"]+'</p>')
                                // $("#users").append('<p>Balance: 0</p></div>')
                                // $("#users").append('<a href="#" class="btn btn-primary">Profile</a></div></div>')
                            }   
                    });
            })
        }
    }})
    let printHeight = 1;
    while (true) {
        block = JSON.parse(httpGet('http://localhost:9984/api/v1/blocks/'+height));
        if (block["status"] == "404") {
            break;
        }
        
        if (block.transactions.length>0) {
            addBlock(block, printHeight);
            printHeight++;
        }
        
        height++;
    }

}

function addBlock(block, printHeight) {
    // let blockChain = document.getElementById("test");
    // let blockChain = document.getElementsByClassName("list-group");
    const transactions = block["transactions"];

    jQuery(document).ready(function(){
        if (transactions.length > 0) {
            var i;
            values = {}
            for (i = 0; i < transactions.length; i++) {
                const publicKey = transactions[i]["outputs"][0]["public_keys"][0];
                if (values[publicKey]) {
                    values[publicKey] += 1
                } else {
                    values[publicKey] = 1
                }
            }
        let html = '';
        const keys = Object.keys(values);
        for (i=0; i < keys.length; i++) {
        //     html += '<h5>name:'+[keys[i]]+'</h5>'+'<h5>balance:'+values[keys[i]]+'</h5>'

                const transaction = transactions[i];
                let data = '';
                if (transaction["asset"]["data"]["username"]) {
                    data += "<p>username: "+transaction["asset"]["data"]["username"]+"</p>";
                    

                } else {
                    data += '<p>value: '+transaction["asset"]["data"]["value"]+'</p>'
                    data += '<p>amount: '+transaction["outputs"][0]["amount"]+'</p>';

                }

                html += '<p>'+transaction["operation"]+'</p>';
                html += '<p>create time: '+JSON.stringify(transaction["metadata"]["datetime"])+'</p>';
                html += data;
                // JSON.stringify(
                // html += 'data:'+JSON.stringify(transaction["asset"]["data"]);
        }
        if (printHeight % 2 == 0) {
            $("#blockChain").append('<span class="d-block p-2 bg-primary text-white"><h5>Block Height:'+printHeight+'</h5>'+
        html+
        '</span>'); 
        } else {
            $("#blockChain").append('<span class="d-block p-2 bg-dark text-white"><h5>Block Height:'+printHeight+'</h5>'+
        html+
        '</span>'); 
        }
    }
         
    });
    
    
}


render()