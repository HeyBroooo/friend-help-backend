const bcrypt = require("bcrypt");
const { db } = require("../db/db");

const userRef = db.ref("UserDataBase"); 


module.exports.createUserWithNo = async ({ phoneNo, otp }) => {
    if (!phoneNo || !otp) {
        throw new Error("All fields are required");
    }

    const snapshot = await userRef.orderByChild("phoneNo").equalTo(phoneNo).once("value");
    if (snapshot.exists()) {
        throw new Error("A user with this phone number already exists");
    }

    const newUserRef = userRef.push();
    await newUserRef.set({
        phoneNo,
        otp,
        createdAt: new Date().toISOString(),
        type: "phone", 
    });

    return { userId: newUserRef.key, phoneNo };
};

module.exports.verifyUser = async ({ phoneNo, otp, email, password }) => {
    if ((!phoneNo || !otp) && (!email || !password)) {
        throw new Error("Provide either phone number with OTP or email with password");
    }

    let snapshot;

    if (phoneNo && otp) {
        snapshot = await userRef.orderByChild("phoneNo").equalTo(phoneNo).once("value");

        if (!snapshot.exists()) {
            throw new Error("Phone number not found");
        }

        const userData = Object.values(snapshot.val())[0];
        if (userData.otp !== otp) {
            throw new Error("Invalid OTP");
        }
    } else if (email && password) {
        snapshot = await userRef.orderByChild("email").equalTo(email).once("value");

        if (!snapshot.exists()) {
            throw new Error("Email not found");
        }

        const userData = Object.values(snapshot.val())[0];
        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            throw new Error("Invalid password");
        }
    }

    return { userId: Object.keys(snapshot.val())[0] };
};


export const userService = new userService();
