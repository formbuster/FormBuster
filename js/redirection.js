function redirectUser() {
//   var signedIn = user.email;
  console.log(genUserEmail);

  pawsDB.collection("users").doc(genUserEmail.toString().substring(0, str.indexOf("@"))).get().then(function(doc) {
    if (doc.exists) {
      const docData = doc.data();
      const usertype = docData.userType;

      if (usertype == "Student") {
        window.location.replace("../src/stu.html");
      } else if (usertype == "Faculty") {
        window.location.replace("../src/faculty.html");
      } else if (usertype == "Staff") {
        window.location.replace("../src/staff.html");
      } else {
        window.location.replace("../src/coord.html");
      }

    } else {
      // doc.data() will be undefined in this case
      console.log("No such document!");
    }
  }).catch(function(error) {
    console.log("Error type:", error);
  });


}
