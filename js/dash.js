var dash = {};
(function() {
    var firebase = app_firebase;
    var uid = null;
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            uid = user.uid;
        } else {
            // redirect to login page
            uid = null;
            alert('Please log in first.');
            window.location = 'http://pseudotracks.me/';
        }
    });

    function signOut() {
        firebase.auth().signOut();
    }

    dash.signOut = signOut();
})()