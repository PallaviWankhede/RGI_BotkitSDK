const https = require('https');
const fs = require('fs');
const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');
const sdk = require("./lib/sdk");
const { clear, time } = require('console');


var Promise = sdk.Promise;
var port1 = 3000;
var counterFor80D = 0;
var counterForNCB = 0;
var countTest = 0;
let base64file; // Global variable to store the upload response
let flag = false;
var output = "";
var counterForhealthcard = 0;
var jsonData = {};
let startTime = 0;
let NotDemoOrResend = 0;
// var OTPTImeedOut = 1;
let lang1;
var languageCounter = 0;


// Function to convert a file to Base64
function fileToBase64(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, bufferdata) => {
            if (err) {
                reject(err);
            } else {
                var base64String = bufferdata.toString('base64');
                base64file = base64String;
                resolve(base64String);
            }
        });
    });
}

// Function to convert Base64 string to PDF
function base64ToPdf(base64String, outputFilePath) {
    return new Promise((resolve, reject) => {
        const binaryData = Buffer.from(base64String, 'base64');
        fs.writeFile(outputFilePath, binaryData, (err) => {
            if (err) {
                console.error('Error writing file:', err);
                reject(err);
            } else {
                console.log('PDF file created successfully!');
                resolve();
            }
        });
    });
}

// Serve static files from the uploads folder
app.use('/uploads', express.static('uploads'));

// Configure multer for file storage (if needed, otherwise this can be removed)
app.get('/file-download', (req, res) => {
    const fileName = '123.pdf'; // Replace with the actual filename you want to generate the download link for
    const fileLocation = path.join(__dirname, 'uploads', fileName);
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    res.send({ fileUrl });
});

// Start the server
app.listen(port1, () => {
    console.log(`Server running at http://localhost:${port1}`);
});

// Function to perform GET request
async function get80DCard(policyNo, mobileNumber, email) {
    const url = `http://dailydiary.brobotinsurance.com/UserService.svc/Get80DCard/${policyNo}/${mobileNumber}/${email}`;

    try {
        const response = await axios.get(url);
        // Check if the request was successful
        output = response.data;
        return response.data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function HealthCard(POLICYNO,UHID,MOBILENUMBER,EMAIL_ID) {
    const url = `http://dailydiary.brobotinsurance.com/UserService.svc/GetEHealthCard/${POLICYNO}/${UHID}/0/${MOBILENUMBER}/${EMAIL_ID}`;
 
    try {
        const response = await axios.get(url);
        // Check if the request was successful
        output = response.data;
        console.log(output);
        return response.data;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

async function getBotMessages(sessionID) {
    const url = 'https://ind-bots.kore.ai/api/public/bot/st-d2933391-5f2c-5b44-849b-48afc1fb65e1/getMessagesV2';
    const headers = {
                    'content-type': 'application/json',
                    'auth': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiYXBwSWQiOiJjcy02ZDBjMWE3ZS05YWZmLTVhOTQtYWM2NS1lNjBjODRmZmNlYzAifQ.lzNQsC6gC1O4bzBlbmGueLODWugSiHr7_p4AmPsSSQ8'
                };
    const body = {
                    sessionId: [sessionID]
                };
    try {
           const response = await fetch(url, {
                   method: 'POST',
                   headers: headers,
                   body: JSON.stringify(body)
           });
            if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            jsonData = data;
            //console.log('Response:', data);
            return data;
    } catch (error) {
            console.error('Error:', error);
        throw error;
    }
}

async function callApi(data){
    const apiUrl = 'https://cdpiadevapi.azure-api.net/chatbot/api/add';
    const subscriptionKey = '0e8ee86eaf034a1c925e38bdfce7e487';
    try {
            const response = await axios.post(apiUrl, data, {
                    headers: {
                            'Ocp-Apim-Subscription-Key': subscriptionKey,
                            'Content-Type': 'application/json'
                    }
            });
            console.log('Response:', response.data);
    } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function callApi2(data){
    const apiUrl = 'https://cdpiadevapi.azure-api.net/chatbot/api/add';
    const subscriptionKey = '360416bf0692413095dec1ddc7f50e8f';
    try {
            const response = await axios.post(apiUrl, data, {
                    headers: {
                            'Ocp-Apim-Subscription-Key': subscriptionKey,
                            'Content-Type': 'application/json'
                    }
            });
            console.log('Response:', response.data);
    } catch (error) {
            console.error('Error:', error.response ? error.response.data : error.message);
    }
}

async function cdpData(sessionID)
{
    await getBotMessages(sessionID);
    print(jsonData);
    await callApi(jsonData);

}


// // Call the function
// getBotMessages().then(data => {
//     console.log('Bot Messages:', data);
// }).catch(error => {
//     console.error('Failed to fetch bot messages:', error);
// });

async function handleSessionClosure(sessionId) {
    try {
        const messages = await getBotMessages(sessionId);
        const config = {
            method: 'post',
            url: 'http://localhost:3000/post-conversation',
            data: messages
        };
        const response = await axios.request(config);
        console.log("Session closure response:", response.data);
    } catch (err) {
        console.error("Error handling session closure:", err);
    }
}


// Function to download file
const downloadFile = async (fileName, fileUrl, destination) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(destination, fileName));
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36',
            }
        };
        const request = https.get(fileUrl, options, response => {
            if (response.statusCode === 200) {
                let fileSize = 0;
                response.on('data', chunk => {
                    fileSize += chunk.length;
                    if (fileSize > 25 * 1024 * 1024) {
                        console.error('File size exceeds 25 MB limit');
                        fs.unlink(path.join(destination, fileName), () => {});
                        reject(new Error('File size exceeds 25 MB limit'));
                    }
                });

                response.pipe(file);
                file.on('finish', () => {
                    file.close(() => {
                        console.log('File downloaded successfully.');
                        resolve(path.join(destination, fileName));
                    });
                });
            } else {
                console.error('Failed to download file. Status code:', response.statusCode);
                fs.unlink(path.join(destination, fileName), () => {});
                reject(new Error('Failed to download file. Status code:' + response.statusCode));
            }
        });

        request.on('error', error => {
            console.error('Error downloading file:', error);
            fs.unlink(path.join(destination, fileName), () => {});
            reject(error);
        });
    });
};

   
module.exports = {
    botId: "st-96a3b9d6-7ba5-585d-b345-09f43a010db9",
    botName: "RGI language demo Bot",
    on_user_message: async function(requestId, data, callback) {
        
        if (data.channel.botEvent === 'ON_CONNECT_EVENT' ) {
            languageCounter++;
            console.log("languageCounter", languageCounter);
            //var initLang = (initLangInBotUserSessionContext) ? data.context.session.BotUserSession.lastMessage.messagePayload.botInfo.customData.interactiveLanguage : data.context.session.UserContext.customData.interactiveLanguage;
                lang1 = data.context.session.BotUserSession?.lastMessage?.messagePayload?.botInfo?.customData?.interactiveLanguage;
                console.log("new lang1 English", lang1);
                data.metaInfo = {
                    setBotLanguage: lang1
                };
               
                
            }
            else{
                lang1 = data.context.session.BotUserSession?.lastMessage?.messagePayload?.botInfo?.customData?.interactiveLanguage;
                //if(lang1 !== lang2){
                    console.log("lang1 dynamic", lang1);
                    data.metaInfo = {
                        setBotLanguage: lang1
                    };        
            }

            
            
                             
        
        



     
        console.log("On user message count: ", ++countTest);
        console.log("user session", JSON.stringify(data.context.session.UserSession));
        console.log(data.context.entities);
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);

        if (data?.channel?.attachments?.[0]) {
            console.log("ON USER MESSAGE in email condition", "file attachment", data?.channel?.attachments?.[0].url?.fileUrl);

            const fileUrl = data?.channel?.attachments?.[0].url?.fileUrl;
            const fileName = data?.channel?.attachments?.[0]?.fileName;
            const destinationDirectory = 'C:/Users/ws_htu1197/Documents/BotKit-master/RGI4/tmp';

            const filePath = await downloadFile(fileName, fileUrl, destinationDirectory); // Await the download
            await fileToBase64(filePath); // Convert to Base64

            data.context.session.BotUserSession.base64file = base64file;
            data.context.session.BotUserSession.fileName = fileName;
        }
        data.message = "hello";  
        return sdk.sendBotMessage(data, callback);
    },

    on_bot_message: async function(requestId, data, callback) {
        
        console.log("On bot message count: ", ++countTest);

        console.log(data.context.entities);
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);
        
        if (data.context.session.BotUserSession.var === 1) {
            counterFor80D++;
            console.log(counterFor80D);
            if (counterFor80D === 1) {
                console.log("80D");
                const policyNo = data.context.session.BotUserSession.entities.ConfirmPN || data.context.entities.ConfirmPN;
                const mobileNumber = data.context.session.BotUserSession.entities.Phone_Number || data.context.entities.Phone_Number;
                const email = data.context.session.BotUserSession.entities.email__id || data.context.entities.email__id;

                await get80DCard(policyNo, mobileNumber, email);

                const base64String = output;
                //console.log("done", base64String);

                function generateUniqueNumber() {
                    const timestamp = Date.now();
                    const randomNum = Math.floor(Math.random() * 10000);
                    const uniqueNumber = timestamp + randomNum;
                    return uniqueNumber;
                }

                const uniquesNumber = generateUniqueNumber();
                const outputFilePath = `/home/ec2-user/RGI3/uploads/${uniquesNumber}.pdf`;
                const generatedFileUrlNow = `http://57.180.144.182:3000/uploads/${uniquesNumber}.pdf`;
                data.context.session.BotUserSession.entities.generatedFileLink = generatedFileUrlNow;

                if (base64String) {
                    try {
                        await base64ToPdf(base64String, outputFilePath);
                        data.context.session.BotUserSession.var = 0;
                        console.log('File saved as:', outputFilePath);
                    } catch (err) {
                        console.error('File creation failed.');
                    }
                }
            }
        }

        if (data.context.session.BotUserSession.NCBFlow === 1) {
            counterForNCB++;
            console.log(counterForNCB);
            if(counterForNCB===1)
            {
                console.log("NCB");
                var data1 = {};
                const token = data.context.session.BotUserSession.NCBToken;
                const policyNo = data.context.session.BotUserSession.entities.EnterPolicyNo || data.context.entities.EnterPolicyNo;
                const mobileNumber = data.context.session.BotUserSession.entities.PhoneNumber || data.context.entities.PhoneNumber;

                const url = 'https://claimservices.brobotinsurance.com/NCBWrapperAPI/api/NCBWrapperAPI/GetNCBDocuments';
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                };
                if (policyNo) {
                    data1 = {
                        "LetterType": "ConfirmationLetter",
                        "SearchBy": "PolicyNo",
                        "SearchValue": policyNo,
                        "SearchValue2": ""
                    };
                } else if (mobileNumber) {
                    data1 = {
                        "LetterType": "ConfirmationLetter",
                        "SearchBy": "mobileNumber",
                        "SearchValue": mobileNumber,
                        "SearchValue2": ""
                    };
                } else {
                    console.log("data not found");
                }

                try {
                    const response = await axios.post(url, data1, config);
                    output = response.data.fileBytes;
                    //console.log('Response:', response.data);
                } catch (error) {
                    console.error('Error:', error);
                }
                function generateUniqueNumber() {
                    const timestamp = Date.now();
                    const randomNum = Math.floor(Math.random() * 10000);
                    const uniqueNumber = timestamp + randomNum;
                    return uniqueNumber;
                }

                const uniquesNumber = generateUniqueNumber();
                const outputFilePath = `/home/ec2-user/RGI3/uploads/${uniquesNumber}.pdf`;
                const generatedFileUrlNow = `http://57.180.144.182:3000/uploads/${uniquesNumber}.pdf`;
                data.context.session.BotUserSession.entities.generatedFileLink = generatedFileUrlNow;
                const base64String = output;
                if (base64String) {
                    data.context.session.BotUserSession.NCBFlow = undefined;
                    try {
                        await base64ToPdf(base64String, outputFilePath);
                        console.log('File saved as:', outputFilePath);
                    } catch (err) {
                        console.error('File creation failed.');
                    }
                }
            }
        }


        if (data.context.session.BotUserSession.HealthCard === 1) {
            counterForhealthcard++;
            console.log("counterForhealthcard", counterForhealthcard);
            if (counterForhealthcard === 1) {
                console.log("healthcard");
                const POLICYNO = data.context.session.BotUserSession.entities.carousel__message || data.context.entities.carousel__message;
                const UHID = data.context.session.BotUserSession.entities.UHID_NO || data.context.entities.UHID_NO || data.context.entities.UHID__NO;
                const MOBILENUMBER = data.context.session.BotUserSession.entities.PhNumber || data.context.entities.PhNumber;
                const EMAIL_ID = data.context.emailIds[0];
                // console.log(POLICYNO)
                // console.log(UHID)
                // console.log(MOBILENUMBER)
                // console.log(EMAIL_ID)
                await HealthCard(POLICYNO,UHID,MOBILENUMBER,EMAIL_ID);
           
                const base64String = output;
                //console.log("done", base64String);
           
                function generateUniqueNumber() {
                    const timestamp = Date.now();
                    const randomNum = Math.floor(Math.random() * 10000);
                    const uniqueNumber = timestamp + randomNum;
                    return uniqueNumber;
                }
           
                const uniquesNumber = generateUniqueNumber();
                const outputFilePath = `C:/Users/ws_htu1197/Documents/BotKit-master/RGI4/uploads/${uniquesNumber}.pdf`;
                const generatedFileUrlNow = `C:/Users/ws_htu1197/Documents/BotKit-master/RGI4/uploads/${uniquesNumber}.pdf`;
                data.context.session.BotUserSession.entities.generatedFileLink = generatedFileUrlNow;
           
                if (base64String) {
                    try {
                        await base64ToPdf(base64String, outputFilePath);
                        context.session.BotUserSession.HealthCard = 0;
                        counterForhealthcard = 0;
                        console.log('File saved as:', outputFilePath);
                    } catch (err) {
                        counterForhealthcard = 0;
                        console.error('File creation failed.');
                    }
                }
            }
        }

        if (data?.context?.currentNodeName == "AcknowledgementMessage0003") {
            sdk.sendUserMessage(data, callback);
            return sdk.closeConversationSession(data, callback);
        }
        
        OTPvalidation = data.context.session.BotUserSession.otpValidation;
        let timer;
        if (data.context.session.BotUserSession.otp === 1) {
            // Check if the OTP sent time has changed
            if (startTime !== data.context.session.BotUserSession.otpSentTime) {
                
                console.log("startTime", startTime);
                console.log("data.context.session.BotUserSession.otpSentTime", data.context.session.BotUserSession.otpSentTime);

                startTime = data.context.session.BotUserSession.otpSentTime;

                // Clear previous timer if running
                if (timer) {
                    console.log("Clearing previous timer:", timer);
                    clearInterval(timer);
                    timer = undefined; // Reset timer
                    data.context.session.BotUserSession.timerRunning = false;
                }
            }
            
            
            // Start the timer only if it's not already running
            if (!data.context.session.BotUserSession.timerRunning) {
                data.context.session.BotUserSession.timerRunning = true;
               
                timer = setInterval(() => {
                    console.log("uttrance...",data.context.intent);
                    // Get the current time in IST

                    
                    let currentTime = new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour12: false });
                
                    // Convert time string to seconds since midnight for easier comparison
                    const timeToSeconds = (timeString) => {
                        let [hours, minutes, seconds] = timeString.split(':').map(Number);
                        return hours * 3600 + minutes * 60 + seconds;
                    };
                
                    // Calculate elapsed time in seconds
                    let elapsedTime = timeToSeconds(currentTime) - timeToSeconds(startTime);

                    console.log("Elapsed Time:", elapsedTime);
                    
                    // If 30 seconds have passed and OTP is not validated
                    if (elapsedTime > 30 && OTPvalidation === false) {
                        console.log("OTP Validation Failed after Timeout");
                        clearInterval(timer);
                        timer = undefined; // Reset timer // Stop the timer
                        data.context.session.BotUserSession.otp = 0; // Reset OTP flag
                        data.context.session.BotUserSession.timerRunning = false;
                        // Trigger resend OTP
                        data.message = 'resend_OTP';
                        sdk.sendBotMessage(data, callback);
                    }
                    
                    // If OTP is validated, stop the timer
                    if (OTPvalidation === true) {
                        console.log("OTP successfully validated, stopping timer.");
                        clearInterval(timer);
                        timer = undefined; // Reset timer
                        data.context.session.BotUserSession.timerRunning = false;
                        }
                    
                    
                
                    }, 1000); // Check every 1 second
                
            }
        }
        

        
        

        return sdk.sendUserMessage(data, callback);
    },

    on_webhook: function(requestId, data, callback) {
        console.log("On event message count: ", ++countTest);
        console.log("on_event -->  Event : ", data.event);
        console.log("data in webhook <<<", data);

        if (data.componentName == 'CloseSession') {
            console.log("closing session");
            return sdk.closeConversationSession(data, callback);
        }
        

        return sdk.sendUserMessage(data, callback);
    },


    on_event: async function(requestId, data, callback) {
        // Object.assign(data.context.session.BotUserSession.entities, data.context.entities);
         console.log("on_event -->  Event : ", data.event);
            //  if(data.event.eventType === 'sessionClosure')
            //  {
            //          console.log(data.context.session.BotUserSession.conversationSessionId);
            //          const EndSessionID = data.context.session.BotUserSession.conversationSessionId;
            //          cdpData(EndSessionID);
            //             callApi2(jsonData);
            //  }
              
         return callback(null, data);
     },

    on_alert: function(requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    }
};
