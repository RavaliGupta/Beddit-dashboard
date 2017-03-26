var express = require('express');
var app = express();
var prettyjson = require("prettyjson");
var Beddit = require('beddit-api');
var path = require("path");
var nodemailer = require("nodemailer");
//var bootstrap= require('bootstrap');

app.engine('html', require('consolidate').handlebars);
app.set('view engine', 'html');
// to get login page
/*app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/ClientGUI/login.html'));
});*/

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:63342');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});
// to connect with gui login
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/WIS_BEDDIT/bootstrap-3.3.6-dist/bedditlogin.html'));
});
app.get('/dashboard.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/WIS_BEDDIT/bootstrap-3.3.6-dist/dashboard.html'));
    //res.render(path.join(__dirname + '/WIS_BEDDIT/bootstrap-3.3.6-dist/dashboard.html'));
   // console.log(path.dirname+"********" + path.isAbsolute());
  // console.log(path.join(__dirname + '/WIS_BEDDIT/bootstrap-3.3.6-dist/dashboard.html'));
});

//to get email html for sending xls sheet
app.get('/fileUpload.html', function (req, res) {
    res.sendFile(path.join(__dirname + '/ClientGUI/fileUpload.html'));
});



//used to call highchart and pass json to it
/*app.get('/heartRate.js', function (req, res) {
    res.sendFile( __dirname + "/" + "/ClientGUI/heartRate.js" );
})*/
/*app.use(express.static(__dirname + '/beddit-api'));
app.get('*', function (req, res) {
    res.sendFile(path.resolve('WIS_BEDDIT/heartRate.js'));
})*/
//GUI heartrate call
app.get('/heartRate', function (req, res) {
    res.sendFile( __dirname + "/" + "/WIS_BEDDIT/bootstrap-3.3.6-dist/heartRate.js" );

    console.log(path.join(__dirname + '/WIS_BEDDIT/bootstrap-3.3.6-dist/heartRate.js'));
})

// send invitation to person
app.get('/invite', function (req, res) {
    var invite = req.query.invite;
    var beddit = new Beddit();
    beddit.group(invite)
        .then(function (auth) {
            console.log("result from invitation"+ auth);
        })
        .fail(function (err) {
            console.error(err);
        });
});

// details of ppl in grp
app.get('/groupinfo', function (req, res) {
    var user = req.query.firstname;
    var pass=req.query.password;
    console.log("user from gruop"+ user+"password here is"+pass);
    var beddit = new Beddit();
    beddit.login(user, pass)
        .then(function (auth) {
            //console.log("user"+user+"password"+pass);
            //console.log("user authenticated"+auth);
            beddit
                .groupinfo()
                .then(function (group_data) {
                    var s = group_data.map(function (record) {
                       // console.log(record);
                        // return {
                        return {
                            id: record.id,
                            created:record.id,
                            name1:record.members[1].name,
                            email1:record.members[1].email,
                            tip_audience1:record.members[1].tip_audiences,
                            sex1:record.members[1].sex,
                            name2:record.members[0].name,
                            email2:record.members[0].email,
                            tip_audience2:record.members[0].tip_audiences
                            ,
                            sex2:record.members[0].sex,
                            pending:record.pending_invites
                        }
                    });
                    res.status(200).send(s);
                });

                        })

});

//getting sleep data
app.get('/beddit', function (req, res) {

    var user = req.query.firstname;
    var pass = req.query.password;

    console.log("user is:::::::::::: " +  user + " password is::::::::::::::: " +  pass);
    var beddit = new Beddit();
    beddit.login(user, pass)

        .then(function (auth) {
            beddit
                .sleep()
                .then(function (sleep_data) {
                   console.log("inside sleep function:"+sleep_data);
                    var sleep = sleep_data.map(function (record) {
                       // console.log(record);
                        return {
                            date: record.date,
                            timezone: record.timezone,
                           start_timestamp: record.start_timestamp,
                            end_timestamp: record.end_timestamp,
                            session_range_start: record.session_range_start,
                            session_range_end: record.session_range_end,
                            nap_periods: record.time_value_tracks.nap_periods.items,
                            presence: record.time_value_tracks.presence.items,
                            heart_rate_curve: record.time_value_tracks.heart_rate_curve.items,
                            sleep_cycles: record.time_value_tracks.sleep_cycles.items,
                            actigram_epochwise: record.time_value_tracks.actigram_epochwise.items,
                            sleep_stages: record.time_value_tracks.sleep_stages.items,
                            snoring_episodes: record.time_value_tracks.snoring_episodes.items,
                            score_amount_of_sleep: record.properties.total_sleep_score,
                            sleep_latency:record.properties.sleep_latency,
                            total_snoring_episode_duration:record.properties.total_snoring_episode_duration,
                            stage_duration_R:record.properties.stage_duration_R,
                            average_respiration_rate:record.properties.average_respiration_rate,
                            tags: record.tags.join(', ').replace(/_/g, ' ')
                        }
                    });
                    res.status(200).send(sleep);
                   // console.log(prettyjson.render(sleep));

                });
          
        })
        .fail(function (err) {
            console.error(err);
        });


});


// to send email
app.get('/sendmail', function (req, res) {
    console.log("inside send mail");
    var fromemail = req.query.fromemail;
    var toemail = req.query.toemail;
    var subjectbox = req.query.subject;
    var bodyarea = req.query.bodyarea;
   console.log("from"+fromemail+"to"+toemail+"subj"+subjectbox+"body"+bodyarea);
            var smtpTransport = nodemailer.createTransport("SMTP", {
                service: "Gmail",
                auth: {
                    user: "mamidiravali9@gmail.com",
                    pass: "Raj@9297"
                }
            });
            var mailOptions = {
                from:fromemail,
                    //"Ravali Raj ✔ <mamidiravali9@gmail.com>", // sender address
                to: toemail,
                    //"mamidiravali9@gmail.com, mamidiravali1@gmail.com", // list of receivers
                subject:subjectbox,
                    //"Beddit Data", // Subject line
                text:bodyarea,
                attachments: [
                    {
                        filePath: 'https://cloudapi.beddit.com/api/v1/report/user/41305?start_date=2016-02-01&end_date=2016-02-29',
                        filename: 'my_sleep_results.xls'
                    },
                ]
            }
            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Message sent: " + response.message);
                }

            });

});

// to get achievements sleep score

app.get('/achievements', function (req, res) {

    var user = req.query.firstname;
    var pass = req.query.password;

    console.log("user is: " +  user + " password is " +  pass);
    var beddit = new Beddit();
    beddit.login(user, pass)
        .then(function (auth) {
            beddit
                .sleep()
                .then(function (sleep_data) {
                  //  console.log("inside achievements function:"+sleep_data);
                    var sleep = sleep_data.map(function (record) {
                        return {
                            date:record.date,
                             score_amount_of_sleep: record.properties.total_sleep_score,
                             tags: record.tags.join(', ').replace(/_/g, ' ')
                        }
                    });
                    res.status(200).send(sleep);
                    });

                });
        });


var server = app.listen(8080, function () {
    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})