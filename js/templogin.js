var homeApp = {};
let globalUsername;
(function() {
    // Initialize the FirebaseUI Widget using Firebase.
    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.

                (function() {
                    var firebase = app_firebase;
                    var uid = null;

                    // Initialize PseudoPAWS Firebase
                    pseudoPAWSApp = firebase.initializeApp({
                        apiKey: "AIzaSyCAxnlp-J7GPIjTRMmsVuEfpNRxRAK5hlw",
                        authDomain: "pseudopaws.firebaseapp.com",
                        databaseURL: "https://pseudopaws.firebaseio.com",
                        projectId: "pseudopaws",
                        storageBucket: "pseudopaws.appspot.com",
                        messagingSenderId: "1031657828400"
                    }, "pseudoPAWS");

                    const pawsDB = pseudoPAWSApp.firestore();
                    const pawsDBSettings = {/* your settings... */ timestampsInSnapshots: true};
                    pawsDB.settings(pawsDBSettings);


                    firebase.auth().onAuthStateChanged(function(user) {
                        if (user) {
                            // // User is signed in
                            uid2 = user.uid;
                            // console.log(uid2);
                            // //document.getElementById('pageLoaded').innerHTML = user.email;
                            // console.log(user.email);

                            er();
                            function er () {
                                //document.getElementById('pageLoaded').innerHTML = user.email + "in";
                                pawsDB.collection("users").doc(user.email.toString().substring(0, user.email.toString().indexOf("@"))).get().then(function(doc) {

                                    if (doc.exists) {
                                        const docData = doc.data();
                                        const usertype = docData.userType;

                                        let currentUserName = user.email.toString().substring(0, user.email.toString().indexOf("@"));

                                        if (usertype == "Student") {
                                            window.location.replace("../src/stu.html?user="+currentUserName);
                                        } else if (usertype == "Faculty") {
                                            window.location.replace("../src/faculty.html?user="+currentUserName);
                                        } else if (usertype == "Staff") {
                                            window.location.replace("../src/staff.html?user="+currentUserName);
                                        } else {
                                            window.location.replace("../src/coord.html?user="+currentUserName);
                                        }

                                    } else {
                                        // doc.data() will be undefined in this case
                                        console.log("No such document!");
                                    }
                                }).catch(function(error) {
                                    console.log("Error type:", error);
                                });
                            }



                        } else {
                            // redirect to login page
                            uid = null;
                            window.location.replace('../src/templogin.html');
                        }


                    });

                    function logOut(){
                        window.location.replace('../src/templogin.html');

                        firebase.auth().signOut();
                    }

                    // homeApp.logOut = logOut;
                })();

                return false;
            },
            uiShown: function() {
                // The widget is rendered.
                // Hide the loader.
                document.getElementById('loader').style.display = 'none';
            }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInOptions: [
            firebase.auth.EmailAuthProvider.PROVIDER_ID
        ],
        credentialHelper: firebaseui.auth.CredentialHelper.NONE
    };

    // The start method will wait until the DOM is loaded.
    ui.start('#firebaseui-auth-container', uiConfig);
})()
