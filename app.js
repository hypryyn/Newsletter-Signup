const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
require("dotenv").config();

console.log(process.env);

const app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
})

app.post("/", function (req, res) {

    const firstName = req.body.fname;
    const lastName = req.body.lname;
    const email = req.body.email;

    let data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }
    listId = process.env.List_Id;
    apiKey = process.env.API_Key;

    const jsonData = JSON.stringify(data);
    const url = "https://us21.api.mailchimp.com/3.0/Lists/" + listId;
    const options = {
        method: 'POST',
        auth: "hypryyn:" + apiKey,
    }
    const request = https.request(url, options, function (response) {
        response.on("data", function (data) {
            console.log(JSON.parse(data));
            if ((JSON.parse(data)).error_count === 0) {
                console.log(response.statusCode);
                res.sendFile(__dirname + '/success.html');
            } else if ((JSON.parse(data)).errors[0].error_code === 'ERROR_CONTACT_EXISTS' || (JSON.parse(data)).errors[0].error_code === 'ERROR_GENERIC') {
                res.sendFile(__dirname + '/failure.html');
            };



        })
    })

    request.write(jsonData);
    request.end();

});

app.post("/failure", function (req, res) {
    res.redirect("/");
})

app.listen(3000, function () {
    console.log("Server is running on port 3000")
})