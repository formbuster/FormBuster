// Initialize pseudoTRACKS Firebase
pseudoTRACKS = firebase.initializeApp({
    apiKey: "AIzaSyAWosl7w3NfRpAYL-j1XWLDZujl8GpO-KA",
    authDomain: "pseudotracks-bb89e.firebaseapp.com",
    databaseURL: "https://pseudotracks-bb89e.firebaseio.com",
    projectId: "pseudotracks-bb89e",
    storageBucket: "pseudotracks-bb89e.appspot.com",
    messagingSenderId: "369787432909"
}, "pseudoTRACKS");

// Load Login page
function loadLoginPage () {
    validateUserLoginPage();

    setTimeout(function(){
        openEvelope();
    }, 1000);
}

// If user was already "signed in", then remain on the page; otherwise, redirect user to Login page
function validateUser () {
    pseudoTRACKS.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            const username = user.email.toString().substring(0, user.email.toString().indexOf("@"));

            pawsDB.collection("users").doc(username).get().then(function(userDoc) {
                if (userDoc.exists) {
                    const userDocData = userDoc.data();
                    const userType = userDocData.userType;

                    const url = window.location.href;
                    const urlUserType = url.substring(url.indexOf("src") + 4, url.indexOf("html") - 1);

                    let urlUsername = url.substring(url.indexOf("=") + 1, url.length);
                    if (urlUsername.endsWith('#')) {
                        urlUsername = urlUsername.substring(0, urlUsername.length - 1);
                    }

                    // User is already logged in and authenticated, but we need to make sure that the user authenticated can
                    // access this URL; if the user can't, then it will be redirected to their correct URL
                    if (userType !== urlUserType || username !== urlUsername) {
                        redirectUser(userType, username);
                    }


                } else {
                    console.log(`ERROR: User was logged in (exists) on "pseudoTRACKS", but doesn't exist in "formDB".`);
                }
            });
        } else {
            // User wasn't logged in before OR user just logged out
            window.location.replace('../src/login.html'); // **User wasn't logged in before**
        }
    });
}

// Validate users when they are in the Login page.
// If they are signed in or they just signed in through "signIn()" function, then redirect them accordingly.
// If user wasn't logged in, then don't do nothing (login page is already loaded and waiting for them to input their credentials)
function validateUserLoginPage () {
    pseudoTRACKS.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            const username = user.email.toString().substring(0, user.email.toString().indexOf("@"));

            pawsDB.collection("users").doc(username).get().then(function(userDoc) {
                if (userDoc.exists) {
                    const userDocData = userDoc.data();
                    const userType = userDocData.userType;

                    redirectUser(userType, username);

                } else {
                    console.log(`ERROR: User was logged in (exists) on "pseudoTRACKS", but doesn't exist in "formDB".`);
                }
            });
        } else {
            // User wasn't logged in before OR user just logged out
        }
    });
}

// Redirect the user to their correct URL page, based on their "userType"
function redirectUser (userType, username) {
    if (userType === "Student") {
        window.location.replace(`../src/stu.html?user=${username}`);
    } else if (userType === "Faculty") {
        window.location.replace(`../src/faculty.html?user=${username}`);
    } else if (userType === "Staff") {
        window.location.replace(`../src/staff.html?user=${username}`);
    } else {
        window.location.replace(`../src/coord.html?user=${username}`);
    }
}

// Sign in the user by their username/email and password, and handle errors/failed attempts
function signIn () {
    let username = document.getElementsByClassName("username_input")[0].value;
    const password = document.getElementsByClassName("password_input")[0].value;

    // If username doesn't contain "@", then we add it
    if (!username.includes("@")) {
        // Username is of a Student
        if (hasNumber(username)) {
            username += "@my.fit.edu";

        } else { // Username is either of Faculty, Staff, or Student Coordinator
            username += "@fit.edu";
        }
    }

    pseudoTRACKS.auth().signInWithEmailAndPassword(username, password).catch(function(error) {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;

        if (errorCode === "auth/user-not-found") {
            document.getElementsByClassName("username_title")[0].innerHTML = "Username or email<br>doesn't exist";
            document.getElementsByClassName("username_title")[0].classList.add("wrong");
            document.getElementsByClassName("username_input")[0].classList.add("wrong");

            document.getElementsByClassName("password_title")[0].innerHTML = "Password";
            document.getElementsByClassName("password_title")[0].classList.remove("wrong");
            document.getElementsByClassName("password_input")[0].classList.remove("wrong");

        } else if (errorCode === "auth/wrong-password") {
            document.getElementsByClassName("password_title")[0].innerHTML = "Wrong password";
            document.getElementsByClassName("password_title")[0].classList.add("wrong");
            document.getElementsByClassName("password_input")[0].classList.add("wrong");

            document.getElementsByClassName("username_title")[0].innerHTML = "Username";
            document.getElementsByClassName("username_title")[0].classList.remove("wrong");
            document.getElementsByClassName("username_input")[0].classList.remove("wrong");

        } else if (errorCode === "auth/too-many-requests") {
            window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha', {
                'callback': (response) => {
                    // reCAPTCHA solved, allow signInWithPhoneNumber.
                    // ...
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                    // ...
                }
            });
            window.recaptchaVerifier.render();

        } else {
            console.log({"errorMessage": errorMessage, "errorCode": errorCode});
        }
    });
}

// Sign out an user and hence redirects them to the login page by default
function signOut () {
    pseudoTRACKS.auth().signOut();
    window.location.replace('../src/login.html');
}

// Returns "true" if a String contains a number
function hasNumber (str) {
    return /\d/.test(str);
}

// Animation to open the envelope
function openEvelope () {
    document.getElementsByClassName("fold")[0].classList.add("opened");
    document.getElementsByClassName("bg")[0].classList.add("opened");
    document.getElementsByClassName("sheet")[0].classList.add("opened");
    document.getElementsByClassName("envelope")[0].classList.add("opened");
    document.getElementById("envelope_wrap").classList.add("opened");
}

// Animation to close the envelope
function closeEnvelope () {
    document.getElementsByClassName("fold")[0].classList.remove("opened");
    document.getElementsByClassName("bg")[0].classList.remove("opened");
    document.getElementsByClassName("sheet")[0].classList.remove("opened");
    document.getElementsByClassName("envelope")[0].classList.remove("opened");
    document.getElementById("envelope_wrap").classList.remove("opened");
}
