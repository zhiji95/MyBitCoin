// BigchainDB server instance (e.g. https://example.com/api/v1/)
const API_PATH = 'http://localhost:9984/api/v1/'
let conn = new BigchainDB.Connection(API_PATH)


// // Create a new keypair.
// const alice = new BigchainDB.Ed25519Keypair()
// const bob = new BigchainDB.Ed25519Keypair()

// // Construct a transaction payload
// const tx = BigchainDB.Transaction.makeCreateTransaction(
//     // Define the asset to store, in this example it is the current temperature
//     // (in Celsius) for the city of Berlin.
//     { city: 'Berlin, DE', temperature: 22, datetime: new Date().toString() },

//     // Metadata contains information about the transaction itself
//     // (can be `null` if not needed)
//     { what: 'Alice first BigchainDB transaction' },

//     // A transaction needs an output
//     [ BigchainDB.Transaction.makeOutput(
//             BigchainDB.Transaction.makeEd25519Condition(alice.publicKey))
//     ],
//     alice.publicKey

// )

// const txBob = BigchainDB.Transaction.makeCreateTransaction(
//     // Define the asset to store, in this example it is the current temperature
//     // (in Celsius) for the city of Berlin.
//     { city: 'Tokyo, JP', temperature: 19, datetime: new Date().toString() },

//     // Metadata contains information about the transaction itself
//     // (can be `null` if not needed)
//     { what: 'Bobs first BigchainDB transaction' },

//     // A transaction needs an output
//     [ BigchainDB.Transaction.makeOutput(
//             BigchainDB.Transaction.makeEd25519Condition(bob.publicKey))
//     ],
//     bob.publicKey

// )

// // Sign the transaction with private keys
// const txSigned = BigchainDB.Transaction.signTransaction(tx, alice.privateKey)

// // Send the transaction off to BigchainDB
// let connAlice = new BigchainDB.Connection(API_PATH)
// let connBob = new BigchainDB.Connection(API_PATH)

// connAlice.postTransactionCommit(txSigned)
//     .then(res => {
//         const elem = document.getElementById('lastTransaction')
//         elem.href = API_PATH + 'transactions/' + txSigned.id
//         elem.innerText = txSigned.id
//         console.log('Transaction', txSigned.id, 'accepted')
//     })
// const txSignedBob = BigchainDB.Transaction.signTransaction(txBob, bob.privateKey)
// connBob.postTransactionCommit(txSignedBob)
//     .then(res => {
//         const elem = document.getElementById('lastTransaction2')
//         elem.href = API_PATH + 'transactions/' + txSignedBob.id
//         elem.innerText += txSignedBob.id
//         console.log('Transaction', txSignedBob.id, 'accepted')
//     })


function query() {
    connAlice.searchAssets('Tokyo')
    .then(assets => console.log('Found assets with city Tokyo:', assets))
    connAlice.searchAssets('Berlin')
        .then(assets => console.log('Found assets with city Berlin:', assets))
}

function createUser() {
    const firstname = document.getElementById("first_name").value;
    const lastname = document.getElementById("last_name").value;
    const user = new BigchainDB.Ed25519Keypair();
    // Construct a transaction payload
    const tx = BigchainDB.Transaction.makeCreateTransaction(
    // Define the asset to store, in this example it is the current temperature
    // (in Celsius) for the city of Berlin.
    { name: firstname+" "+lastname, balance: 0},

    // Metadata contains information about the transaction itself
    // (can be `null` if not needed)
    { datetime: new Date().toString() },

    // A transaction needs an output
    [ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(user.publicKey))
    ],
    user.publicKey

    )   
    const txSigned = BigchainDB.Transaction.signTransaction(tx, user.privateKey)
    
    conn.postTransactionCommit(txSigned)
    .then(res => {
        const elem = document.getElementById('lastTransaction')
        elem.href = API_PATH + 'transactions/' + txSigned.id
        elem.innerText = txSigned.id
        console.log('Transaction', txSigned.id, 'accepted')
        location.reload();
    })


}

function addFund() {
    const firstname = document.getElementById("first_name2").value;
    const lastname = document.getElementById("last_name2").value;
    const amount = document.getElementById("amount").value;
    conn.searchAssets(firstname+" "+lastname)
        .then(assets => {
            console.log(assets)
            const newBalance = parseInt(assets[assets.length-1]["data"].balance,10) + parseInt(amount,10);

        
        const user = new BigchainDB.Ed25519Keypair();
    // Construct a transaction payload
    const tx = BigchainDB.Transaction.makeCreateTransaction(
    // Define the asset to store, in this example it is the current temperature
    // (in Celsius) for the city of Berlin.
    { name: firstname+" "+lastname, balance: newBalance},

    // Metadata contains information about the transaction itself
    // (can be `null` if not needed)
    { datetime: new Date().toString() },

    // A transaction needs an output
    [ BigchainDB.Transaction.makeOutput(
            BigchainDB.Transaction.makeEd25519Condition(user.publicKey))
    ],
    user.publicKey

    )   
    const txSigned = BigchainDB.Transaction.signTransaction(tx, user.privateKey)
    
    conn.postTransactionCommit(txSigned)
    .then(res => {
        const elem = document.getElementById('lastTransaction')
        elem.href = API_PATH + 'transactions/' + txSigned.id
        elem.innerText = txSigned.id
        console.log('Transaction', txSigned.id, 'accepted')
        location.reload();
    })
})

function transfer() {
    const sender = document.getElementById("last_name_sender").value+" "+document.getElementById("last_name_sender").value;
    const receiver = document.getElementById("last_name_receiver").value+" "+document.getElementById("last_name_receiver").value;
    const amount = document.getElementById("amount_receiver").value;

    conn.searchAssets(sender)
        .then(senderAssets => {
            console.log(senderAssets)
            const senderNewBalance = parseInt(senderAssets[senderAssets.length-1]["data"].balance,10) - parseInt(amount,10);
    });
    conn.searchAssets(receiver)
    .then(receiverAssets => {
        console.log(receiverAssets)
        const receiverNewBalance = parseInt(receiverAssets[receiverAssets.length-1]["data"].balance,10) + parseInt(amount,10);
    });

    location.reload();



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
    while (true) {
        block = JSON.parse(httpGet('http://localhost:9984/api/v1/blocks/'+height));
        if (block["status"] == "404") {
            break;
        }
        addBlock(block);
        height++;
    }
}

function addBlock(block) {
    // let blockChain = document.getElementById("test");
    // let blockChain = document.getElementsByClassName("list-group");
    jQuery(document).ready(function(){
        if (block["transactions"].length > 0) {
        $("#blockChain").append('<li class="list-group-item"><h5>Block Height:'+block["height"]+'</h5>'+
        '<h5>id:'+block["transactions"][0]["id"]+'</h5>'+
        '<h5>name:'+block["transactions"][0]["asset"]["data"]["name"]+'</h5>'+
        '<h5>balance:'+block["transactions"][0]["asset"]["data"]["balance"]+'</h5>'+
        '<h5>time:'+block["transactions"][0]["metadata"]["datetime"]+'</h5>'+
        '</li>'
        );
        } else {
            $("#blockChain").append('<li class="list-group-item"><h5>Block Height:'+block["height"]+'</h5></li>');
        }
    });
    
    
}


render()