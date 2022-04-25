const request = indexedDB.open('Budget', 1);
let database;

function saveRecord(deposit) {
    const transaction = database.transaction(['pending'], 'readwrite');

    const Store = transaction.objectStore('pending');
    Store.add(deposit);
}

request.onupgradeneeded = function(event) {
    let db = event.target.result;

    db.createObjectStore('pending', { autoIncrement: true });
};

request.onsuccess = function(event) {
    database = event.target.result;

    if (navigator.onLine) {
        addToDatabase();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
};

function addToDatabase() {
    const transaction = database.transaction(['pending'], 'readwrite');

    const Store = transaction.objectStore('pending');

    const allTransactions = Store.getAll();

    allTransactions.onsuccess = function() {
       if (allTransactions.result.length > 0) {
        fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(allTransactions.getResults),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
              }
        })
        .then(response => {
            return response.json
        })
        .then(() => {
            const transaction = database.transaction(['pending'], 'readwrite');
            const Store = transaction.objectStore('pending');
            Store.clear();
        })
       } 
    }
}