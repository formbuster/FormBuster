function submitClick() {
    const formDB = formBusterApp.firestore();
    const formDBSettings = {/* your settings... */ timestampsInSnapshots: true};
    formDB.settings(formDBSettings);

    const pawsDB = pseudoPAWSApp.firestore();
    const pawsDBSettings = {/* your settings... */ timestampsInSnapshots: true};
    pawsDB.settings(pawsDBSettings);




    let fileContent;
    fetch('').then(function(response) {
        if (response.status !== 200) {
            throw response.status;
        }
        return response.text();
    }).then(function(file_content) {
        fileContent = file_content.split();
        for (let i = 0; i < fileContent.length; i++) {
            console.log(fileContent[i]);
        }
    }).catch(function(status) {
        console.log('Error ' + status);
    });
    alert("test");



    formDB.collection("collectionTestForm").doc("DocTestForm").set({
        name: "New York",
        state: "NY",
        country: "USA",
        zipcode: "32901",
        street: "babcock"
    });
    pawsDB.collection("collectionTestPaws").doc("DocTestPaws").set({
        name: "New York",
        state: "NY",
        country: "USA",
        zipcode: "32901",
        street: "babcock"
    });
    const email = "rsetin2015";
    const password = "rsetin2015123";
    pseudoTRACKSApp.auth().createUserWithEmailAndPassword("rsetin2015@email.com", "rsetin2015123").catch(function(error) {
        // Handle Errors here.
        console(error.code);
        console (error.message);
        // ...
    });
    formDB.collection("users").doc("teststudent2018").get().then(function(doc) {
        if (doc.exists) {
            console.log("document data: ", doc.data());
            alert(doc.data());
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
    formDB.collection("users").get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
            console.log(doc.id, " => ", doc.data());
        });
    });


    formDB.collection("cities").doc("NY").set({
        name: "New York",
        state: "NY",
        country: "USA",
        zipcode: "nothingGGG",
        etc: "NOTHING"
    });
    formDB.collection("cities").doc("SP").update({
        name: "Sao Paulo",
        state: "SP"
    });

    formDB.collection("users").doc(userName).collection("inProgressForms").doc("registration_10232018184000").update({
        approvals: firebase.firestore.FieldValue.arrayRemove({date: "date", status: false, tracksID: "IDDD", test: true})
    });

    formDB.collection("users").doc(userName).collection("inProgressForms").doc("registration_10232018184000").update({
        test: null
    });


    formDB.collection("users").doc(userName).collection("inProgressForms").doc("Registration_10242018221600").get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            formDB.collection("users").doc(userName).collection("inProgressForms").doc("Registration_TEST").set(docData);
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });


    formDB.collection("users").doc("aadkins2016").collection("drafts").doc("Registration_26102018221000").get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            //formDB.collection("users").doc("aadkins2016").collection("completedForms").doc("Registration_11062018102537").set(docData);
            formDB.collection("users").doc("aadkins2016").collection("drafts").doc("Registration_26102018221000").update({
                content: [{"courses": docData.courses}]
            });
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });


    formDB.collection("users").doc("aadkins2016").collection("inProgressForms").doc("Registration_06122018154300").get().then(function(doc) {
        if (doc.exists) {
            const docData = doc.data();
            //formDB.collection("users").doc("aadkins2016").collection("completedForms").doc("Registration_11062018102537").set(docData);
            formDB.collection("users").doc("aadkins2016").collection("inProgressForms").doc("Registration_06122018154300").set({
                content: {"1_Courses": docData.content[0].courses}
            }, { merge: true }); // merge will replace data if data is already there, otherwise it will merge
        } else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch(function(error) {
        console.log("Error getting document:", error);
    });
}
