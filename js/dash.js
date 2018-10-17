var homeApp = {};
(function(){
  var mainContainer = document.getElementById("main_container");

//   var signOut =  function(){
//         firebase.auth().signOut().then(function(){
//             console.log('success');
//             window.location.replace("http://pseudotracks.me/");
//         },function(){})
//     }
  
  var init = function(){
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in
            console.log("stay");
            mainContainer.style.display = "";
        } else {
            // redirect to login page
            mainContainer.style.display = "none";
            console.log("redirect");
            window.location.replace("http://pseudotracks.me/");
        }
    });
  }
    
  init();
  
//   homeApp.logout = signOut;
})();
