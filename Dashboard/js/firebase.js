/*
This file's purpose is to contain the initialization for the formbuster database and the pseudopaws database in firebase.
It will also contain information of the logged in user, and will be accessed by all roles.
 */

// Initialize FormBuster Firebase (DEFAULT)
formBusterApp = firebase.initializeApp({
    apiKey: "AIzaSyD5gttM9fq--1BIbLtn79UbtXrMlf56oAA",
    authDomain: "formbuster-73603.firebaseapp.com",
    databaseURL: "https://formbuster-73603.firebaseio.com",
    projectId: "formbuster-73603",
    storageBucket: "formbuster-73603.appspot.com",
    messagingSenderId: "886328297024"
});

// Initialize PseudoPAWS Firebase
pseudoPAWSApp = firebase.initializeApp({
    apiKey: "AIzaSyCAxnlp-J7GPIjTRMmsVuEfpNRxRAK5hlw",
    authDomain: "pseudopaws.firebaseapp.com",
    databaseURL: "https://pseudopaws.firebaseio.com",
    projectId: "pseudopaws",
    storageBucket: "pseudopaws.appspot.com",
    messagingSenderId: "1031657828400"
}, "pseudoPAWS");


//Todo: return proper user name
function getUserName() {
    return "Aliyah Adkins";
}

