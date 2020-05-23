const Alexa = require('ask-sdk-core');
const axios = require('axios');

//the counter has been used to add up the digits on PIN.
let counter;
let pinNumber;
//var pinAttempts=3;
var seatCount = 0;
var reverseTrip = false;
var seatArr = new Array();

var customerName = "";

var myMeal = "";
var myDish = ""

var fromCity = "";
var fromCode = "";
var toCity = "";
var toCode = "";
var fromSeat = "";
var toSeat = "";

var fromDept;
var fromArr;

var toDept;
var toArr;

var totalPrice = new Array();
var fareTotal = "";
var serviceChosen = "No serviceChosen";

//the date have been declared as string
var departureDateStr = "";
var departureDate;
var arrivalDate;
var arrivalDateStr = "";
//FOR PAYMENT THE BASE IS EURO.
//http://data.fixer.io/api/latest?access_key=9ea402e45118ad096e80014dfffe9c05&symbols=CAD

//backgroundURL: util.getS3PreSignedUrl('Media/seatFlight.jpg')
//const api_url=`https://aes1a.herokuapp.com/dapi/air-offers?originLocationCode=MAD&destinationLocationCode=PAR&departureDateTime=2020-02-19`;

const dapi = require('./dapiTicket.json');
const homeScreenApl = require('./document/homeScreenApl.json');
const api_url = `https://aes1a.herokuapp.com/dapi/air-offers?`;
const list = require('./cityList.json');
const seatMap = require('./seatMap.json');
const currencyList = require('./currency.json');
const util = require('./util');

const flightDetail = require('./document/flightDetail.json');
const previousFlightDetail = require('./document/previousFlightDetail.json');
const countryList = require('./countryList.json');
const getCartDetail = require('./document/getCartDetail.json');
const homeScreen = require('./document/homeScreen.json');
const seat = require('./document/selectSeat.json');

const cardDetail = require('./cardDetail.json');
//const cvv=require('./document/cvvPin.json');
const cvvNew = require('./document/cvvNew.json');
const seatMapAPL = require('./document/seatMapAPL.json');
const iternaryDetailJson = require('./document/iternaryDetail.json')
// 1. Text strings ================================================================================
//    Modify these strings and messages to change the behavior of your Lambda function

const welcomeOutput = "Welcome to plan trip. You can book a ticket, retreive infromation about the previous booking trip and check-in?";
const welcomeReprompt = "Let me know where you'd like to go or when you'd like to go on your trip";
const helpOutput = 'You can demonstrate the delegate directive by saying "plan a trip".';
const helpReprompt = 'Try saying "plan a trip".';
const tripIntro = [
    'This sounds like a cool trip. ',
    'This will be fun. ',
    'Oh, I like this trip. ',
];

// 1. Intent Handlers =============================================
//s3://amzn1-ask-skill-7796b7b2-a9f6-buildsnapshotbucket-1p13c1g5rk5zv/Media/plane_sky_flying_sunset_64663_1920x1080.jpg
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const viewportProfile = Alexa.getViewportProfile(handlerInput.requestEnvelope);

        // Add APL directive to response
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: homeScreenApl,
                datasources: {

                    "listTemplate2Metadata": {
                        "type": "object",
                        "objectId": "lt1Metadata",
                        "backgroundImage": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [{
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "title": "NIMBUS TRIP"
                    },
                    "listTemplate2ListData": {
                        "type": "list",
                        "listId": "lt2Sample",
                        "totalNumberOfItems": 7,
                        "hintText": "Try, \"Book Ticket\"",
                        "listPage": {
                            "listItems": [{
                                    "listItemIdentifier": "planTrip",
                                    "ordinalNumber": 1,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Plan Trip"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "Try, \"Book Ticket\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2924/2924844.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "planTrip"
                                },
                                {
                                    "listItemIdentifier": "cartDetail",
                                    "ordinalNumber": 2,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Cart Detail"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Get Cart Detail Ticket\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/1828/1828486.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "cartDetail"
                                },
                                {
                                    "listItemIdentifier": "previousTrip",
                                    "ordinalNumber": 3,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Previous Trip"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Get Previous Trip Detail\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2491/2491922.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "previousTrip"
                                },
                                {
                                    "listItemIdentifier": "selectSeat",
                                    "ordinalNumber": 4,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Seat Selection"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "Try, \"Select Seat\"  or Try, \"Open seat map\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "selectSeat"
                                },
                                {
                                    "listItemIdentifier": "payment",
                                    "ordinalNumber": 5,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Payment Gateway"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Proceed with Payment\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/901/901885.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "payment"
                                },
                                {
                                    "listItemIdentifier": "food",
                                    "ordinalNumber": 6,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Food Selection"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Select Meal\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/706/706133.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "food"
                                },
                                {
                                    "listItemIdentifier": "other",
                                    "ordinalNumber": 7,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Ancillary Services"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Select Ancillary Services\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2214/2214965.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "other"
                                }
                            ]
                        }
                    }
                }
            });
        }

        // console.log(seatMap.data.seatmaps[0].decks[0].seats[0].travelers[0].seatAvailabilityStatus);
        // console.log(seatMap.data.seatmaps[0].decks[0].seats[10].travelers[0].seatAvailabilityStatus);
        // console.log(seatMapAPL.layouts.ListTemplate1.item[0].items[2].items[0].imageA);
        //console.log(seatMapAPL.layouts.VerticalListItem.item[1].items[1].item.overlayColor);
        // seatMapAPL.layouts.VerticalListItem.item[1].items[1].item.overlayColor= "rgba(black,0.75)";
        // seatMapAPL.layouts.VerticalListItem.item[1].items[2].item.overlayColor= "rgba(black,0)";
        //console.log(123>=100 && 123<=999);
        const responseBuilder = handlerInput.responseBuilder;
        return responseBuilder
            .speak(welcomeOutput)
            .reprompt(welcomeReprompt)
            .getResponse();
    },
};

const HomeScreenIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'HomeScreenIntent'
    },
    handle(handlerInput) {
        const viewportProfile = Alexa.getViewportProfile(handlerInput.requestEnvelope);

        // Add APL directive to response
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: homeScreenApl,
                datasources: {

                    "listTemplate2Metadata": {
                        "type": "object",
                        "objectId": "lt1Metadata",
                        "backgroundImage": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [{
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "title": "NIMBUS TRIP"
                    },
                    "listTemplate2ListData": {
                        "type": "list",
                        "listId": "lt2Sample",
                        "totalNumberOfItems": 7,
                        "hintText": "Try, \"Book Ticket\"",
                        "listPage": {
                            "listItems": [{
                                    "listItemIdentifier": "planTrip",
                                    "ordinalNumber": 1,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Plan Trip"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "Try, \"Book Ticket\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2924/2924844.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "planTrip"
                                },
                                {
                                    "listItemIdentifier": "cartDetail",
                                    "ordinalNumber": 2,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Cart Detail"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Get Cart Detail Ticket\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/1828/1828486.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "cartDetail"
                                },
                                {
                                    "listItemIdentifier": "previousTrip",
                                    "ordinalNumber": 3,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Previous Trip"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Get Previous Trip Detail\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2491/2491922.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "previousTrip"
                                },
                                {
                                    "listItemIdentifier": "selectSeat",
                                    "ordinalNumber": 4,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Seat Selection"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "Try, \"Select Seat\" or try \"Open Seat Map\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "selectSeat"
                                },
                                {
                                    "listItemIdentifier": "payment",
                                    "ordinalNumber": 5,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Payment Gateway"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Proceed with Payment\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/901/901885.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "payment"
                                },
                                {
                                    "listItemIdentifier": "food",
                                    "ordinalNumber": 6,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Food Selection"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Select Meal\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/706/706133.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "food"
                                },
                                {
                                    "listItemIdentifier": "other",
                                    "ordinalNumber": 7,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "Ancillary Services"
                                        },
                                        "secondaryText": {
                                            "type": "RichText",
                                            "text": "Try, \"Select Ancillary Services\""
                                        }
                                    },
                                    "image": {
                                        "contentDescription": null,
                                        "smallSourceUrl": null,
                                        "largeSourceUrl": null,
                                        "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2214/2214965.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }]
                                    },
                                    "token": "other"
                                }
                            ]
                        }
                    }
                }


            });
        }

        // console.log(seatMap.data.seatmaps[0].decks[0].seats[0].travelers[0].seatAvailabilityStatus);
        // console.log(seatMap.data.seatmaps[0].decks[0].seats[10].travelers[0].seatAvailabilityStatus);
        // console.log(seatMapAPL.layouts.ListTemplate1.item[0].items[2].items[0].imageA);
        //console.log(seatMapAPL.layouts.VerticalListItem.item[1].items[1].item.overlayColor);
        // seatMapAPL.layouts.VerticalListItem.item[1].items[1].item.overlayColor= "rgba(black,0.75)";
        // seatMapAPL.layouts.VerticalListItem.item[1].items[2].item.overlayColor= "rgba(black,0)";
        //console.log(123>=100 && 123<=999);
        const responseBuilder = handlerInput.responseBuilder;
        return responseBuilder
            .speak(welcomeOutput)
            .reprompt(welcomeReprompt)
            .getResponse();
    },
};

const InProgressPlanMyTripHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'PlanMyTripIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};

const CompletedPlanMyTripHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PlanMyTripIntent';
    },
    async handle(handlerInput) {
        const viewportProfile = Alexa.getViewportProfile(handlerInput.requestEnvelope);
        console.log('Plan My Trip - handle');
        const responseBuilder = handlerInput.responseBuilder;
        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);
        var currencyName, speechOutput;

        const promise = bookFlight(filledSlots.fromCity.value, filledSlots.toCity.value, filledSlots.travelDate.value);
        const fare = await promise.then(data => {
            const price = (data.data.data.airOffers[0].offerItems[0].prices.simpleTotalPrice.totalAmount);
            return price;
        })

        const flightData = await promise.then(data => {
            //body.data.air.prices.totalPrices[0].totalAmount.currencyCode
            const cur = (data.data.data.airOffers[0].offerItems[0].air.bounds[0]);
            return cur
        })

        //console.log(flightData);
        const curCode = (flightData.prices.currencyCode);
        fromCode = (flightData.originLocationCode);
        toCode = (flightData.destinationLocationCode);


        let id = (flightData.flights[0].id);
        id = (id.substring(29));
        console.log(id);
        fromDept = (ampm(id));

        var sec = flightData.duration;
        console.log(sec);

        sec = parseInt(sec, 10);
        sec = (convertSeconds(sec));
        id = parseInt(id, 10);
        sec = id + sec; //930
        sec = sec.toString(); //"930";
        if (sec.length === 3) {
            sec = "0" + sec;
        }
        fromArr = (ampm(sec));


        const promise2 = getPrevious();

        const cartData = await promise2.then(data => {
            const cart = (data.data.identity);
            return cart;
        })

        customerName = cartData.names[0].universal.firstName + " " + cartData.names[0].universal.lastName;


        if (curCode) {
            currencyName = currencyList.CurrencyCountryList[curCode].name;
        }
        speechOutput = getRandomPhrase(tripIntro);
        speechOutput = `<amazon:emotion name="excited" intensity="medium"> ${speechOutput} </amazon:emotion> From ${slotValues.fromCity.synonym} to ${slotValues.toCity.synonym} on ${slotValues.travelDate.synonym}, Please wait while I search for the best Tickets.<break time="0.5s"/>The price is ${fare} ${currencyName}<break time="0.5s"/> Say plan return trip to book return ticket`;


        //speechOutput =`<amazon:emotion name="excited" intensity="medium"> ${speechOutput} </amazon:emotion> From London to Paris on 2020-04-04. Please wait while I search for the best Tickets.<break time="1s"/>The price is 237.84 EUROS`;


        const from = filledSlots.fromCity.value
        const to = filledSlots.toCity.value
        const date = filledSlots.travelDate.value

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: flightDetail,
                datasources: {
                    text: {
                        type: 'object',
                        title: "YOUR FLIGHT DETAILS:",
                        from: "FROM: " + from,
                        to: "TO:" + to,
                        date: "DATE:" + date,
                        price: "PRICE:" + fare + " " + currencyName
                    }
                }
            });
        }
        fromCity = from;
        toCity = to;

        var priceObj = {
            fare: fare,
            curCode: curCode
        };
        totalPrice.push(priceObj);
        departureDateStr = date
        departureDate = new Date(date);

        console.log(date);
        return responseBuilder
            .speak(speechOutput)
            .getResponse();
    },
};
// get cart detail
const GetCartIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'GetCartIntent';
    },
    async handle(handlerInput) {
        const promise = getPrevious();

        const cartData = await promise.then(data => {
            const cart = (data.data.identity);
            return cart;
        })

        const cartDataDetail = {
            "firstName": cartData.names[0].universal.firstName,
            "lastName": cartData.names[0].universal.lastName,
            "dob": cartData.demographics[0].birthDate,
            "nationality": cartData.demographics[0].nationalities[0]
        }

        const countryCode = cartDataDetail.nationality

        const country = countryList.country[countryCode]
        cartDataDetail.nationality = country

        var speakOutput = `Please confirm the details. Your first name is  ${cartDataDetail.firstName}, the last name is ${cartDataDetail.lastName} the date of birth is ${cartDataDetail.dob} and your nationality is ${cartDataDetail.nationality}`

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: getCartDetail,
                datasources: {
                    text: {
                        type: 'object',
                        title: "YOUR CART DETAILS:",
                        firstName: "FIRST NAME:" + cartDataDetail.firstName,
                        lastName: "LAST NAME:" + cartDataDetail.lastName,
                        dob: "DOB:" + cartDataDetail.dob,
                        nationality: "NATIONALITY:" + cartDataDetail.nationality
                    }
                }
            });
        }
        //customerName=cartDataDetail.firstName+" "+cartDataDetail.lastName;
        return handlerInput.responseBuilder
            .speak('I am providing the details of your name, date of birth and nationality<break time="1s"/>' + speakOutput)
            .getResponse()
    }
}

const PreviousTripIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PreviousTripIntent'
    },
    async handle(handlerInput) {

        const promise = getPrevious();
        const previousData = await promise.then(data => {
            const previous = (data.data.preferredRoute);
            return previous;
        })

        console.log(previousData);
        const previousTripData = {
            "category": previousData["category"],
            "origin": previousData.journeys[0].origin.code,
            "destination": previousData.journeys[0].destination['code'],
            "departureDate": previousData.journeys[0].origin.at,
            "returnDate": previousData.journeys[1].origin['at']
        };
        console.log(previousTripData.destination)
        previousTripData.origin = list.cityList[previousTripData.origin];
        previousTripData.destination = list.cityList[previousTripData.destination];
        previousTripData.departureDate = previousTripData.departureDate.substring(0, 10);
        previousTripData.returnDate = previousTripData.returnDate.substring(0, 10);

        console.log(previousTripData.destination)
        var speakOutput = `You choose a ${previousTripData.category.substring(0,5)}  ${previousTripData.category.substring(6,10)}, the source was ${previousTripData.origin} and the destination was ${previousTripData.destination}. The departure date was ${previousTripData.departureDate} and the return date was ${previousTripData.returnDate}`

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: previousFlightDetail,
                datasources: {
                    text: {
                        type: 'object',
                        title: "PREVIOUS FLIGHT DETAILS:",
                        category: "CATEGORY: " + previousTripData.category.substring(0, 5) + " " + previousTripData.category.substring(6, 10),
                        origin: "FROM:" + previousTripData.origin,
                        to: "TO:" + previousTripData.destination,
                        departureDate: "DepartureDate:" + previousTripData.departureDate,
                        returnDate: "ReturnDate:" + previousTripData.returnDate
                    }
                }
            });
        }

        return handlerInput.responseBuilder
            .speak(`You have accessed the previous trip data<break time="1s"/>` + speakOutput)
            .getResponse()
    }
}


// reverse Trip plan
const InProgressReverseTripIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'ReverseTripIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};


const CompletedReverseTripIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'ReverseTripIntent';
    },
    async handle(handlerInput) {

        reverseTrip = true;
        const viewportProfile = Alexa.getViewportProfile(handlerInput.requestEnvelope);
        const responseBuilder = handlerInput.responseBuilder;
        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);

        const returnDate = slotValues.returnDate.synonym;
        arrivalDateStr = returnDate;
        console.log(returnDate);

        arrivalDate = new Date(returnDate);
        console.log(departureDate);
        console.log(arrivalDate);
        console.log(departureDate > arrivalDate);
        console.log(departureDate < arrivalDate);
        if (departureDate > arrivalDate) {
            reverseTrip = false;

            return handlerInput.responseBuilder
                .speak(`Please enter a correct date,and start again`)
                .getResponse();
        }

        const promise = bookFlight(toCity, fromCity, returnDate);

        const flightData = await promise.then(data => {
            //body.data.air.prices.totalPrices[0].totalAmount.currencyCode
            const cur = (data.data.data.airOffers[0].offerItems[0].air.bounds[0]);
            return cur
        })

        const curCode = (flightData.prices.currencyCode);

        const fare = await promise.then(data => {
            const price = (data.data.data.airOffers[0].offerItems[0].prices.simpleTotalPrice.totalAmount);
            return price;
        })

        console.log(fare);

        var currencyName;
        if (curCode) {
            currencyName = currencyList.CurrencyCountryList[curCode].name;
        }

        //console.log(flightData);


        let id = (flightData.flights[0].id);
        id = (id.substring(29));
        console.log(id);
        toDept = (ampm(id));

        var sec = flightData.duration;
        console.log(sec);

        sec = parseInt(sec, 10);
        sec = (convertSeconds(sec));
        id = parseInt(id, 10);
        sec = id + sec; //930
        sec = sec.toString(); //"930";
        if (sec.length === 3) {
            sec = "0" + sec;
        }
        toArr = (ampm(sec));


        var priceObj = {
            fare: fare,
            curCode: curCode
        };

        totalPrice.push(priceObj);

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: flightDetail,
                datasources: {
                    text: {
                        type: 'object',
                        title: "YOUR FLIGHT DETAILS:",
                        from: "FROM: " + toCity,
                        to: "TO:" + fromCity,
                        date: "DATE:" + returnDate,
                        price: "PRICE:" + fare + " " + currencyName
                    }
                }
            });
        }

        var speechOutput;
        speechOutput = `The date is ${returnDate} from ${toCity} to ${fromCity} Please wait while I search for the best Tickets.<break time="0.5s"/>The price is ${fare} ${currencyName}`;
        return handlerInput.responseBuilder
            .speak(speechOutput)
            .getResponse();
    }
};

// seat selection

const InProgressSeatSelectionIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'SeatSelectionIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};

const CompletedSeatSelectionIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SeatSelectionIntent';
    },
    handle(handlerInput) {
        const viewportProfile = Alexa.getViewportProfile(handlerInput.requestEnvelope);
        const responseBuilder = handlerInput.responseBuilder;
        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);

        var speechOutput = ` You selected ${slotValues.seatPreference.synonym} and your cabin preference is ${slotValues.cabinType.synonym},<break time="1s"/>  Please wait while I search for the best seats`;

        let seatMapLocal = seatMap.data.seatmaps[0];
        let seats = seatMapLocal.decks[0].seats;

        let preferenceCode = {
            "window": "W",
            "aisle": "A"
        }
        let preferenceFound = false;
        let seatNumber = "";
        var isMiddleAvailable = false;
        var isAisleAvailable = false
        var isWindowAvailable = false;
        const seatPreferVal = slotValues.seatPreference.synonym;
        const cabinPrefer = slotValues.cabinType.synonym;
        //console.log(preferenceCode[seatPreferVal.toLowerCase()]);

        for (let i = 0; i < seats.length; i++) {
            if (!preferenceFound) {

                let currentSeat = seats[i];
                console.log(currentSeat);
                console.log(currentSeat.travelers[0].seatCharacteristicsCodes.indexOf('W'));
                if (preferenceCode[seatPreferVal.toLowerCase()] && currentSeat.travelers[0].seatCharacteristicsCodes.indexOf(preferenceCode[seatPreferVal.toLowerCase()]) > -1 && currentSeat.travelers[0].seatAvailabilityStatus === "available") {
                    preferenceFound = true;
                    seatNumber = currentSeat.seatNumber;
                }

                if (currentSeat.travelers[0].seatCharacteristicsCodes.indexOf("W") > -1 && currentSeat.travelers[0].seatAvailabilityStatus === "available" && !preferenceFound && !isWindowAvailable) {
                    isWindowAvailable = true;
                }
                if (currentSeat.travelers[0].seatCharacteristicsCodes.indexOf("A") > -1 && currentSeat.travelers[0].seatAvailabilityStatus === "available" && !preferenceFound && !isAisleAvailable) {
                    isAisleAvailable = true;
                }
            }
        }

        if (!preferenceFound) {
            if (isWindowAvailable || isAisleAvailable) {
                speechOutput += "Sorry I couldn't find seats of your preference. But I have other options";
                if (isWindowAvailable) {
                    speechOutput += ", Window";
                }
                if (isAisleAvailable) {
                    speechOutput += ", Aisle";
                }

                speechOutput += ". Which would you prefer?";
                //that.emit(":ask", speech, "Do let me know.");
                return responseBuilder
                    .speak(speechOutput)
                    .addElicitSlotDirective('seatPreference')
                    .getResponse();
            } else {
                speechOutput += "Sorry I couldn't find seats of your preference. Do let me know if you need help with any other flight related queries.";
                return responseBuilder
                    .speak(speechOutput)
                    .getResponse();
            }
        } else {
            speechOutput += ("Your seat selection was successful. Your cabinType is " + cabinPrefer + "and The seat number " + seatNumber + " has been assigned to you.");
        }

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: seat,
                datasources: {
                    text: {
                        type: 'object',
                        title: "Seat and Cabin Selection",
                        seatNumber: "SEAT NUMBER:" + seatNumber,
                        cabinType: "CABIN TYPE:" + cabinPrefer.toUpperCase()
                    },
                }
            });
        }



        console.log(speechOutput);
        return responseBuilder
            .speak(speechOutput)
            .getResponse();
    },
};

//mealOrder

const StartedInProgressOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "OrderIntent" &&
            handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }
};

const VegMealGivenOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "OrderIntent" &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value === 'vegetarian' &&
            !handlerInput.requestEnvelope.request.intent.slots.vegType.value
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Which meal would you like <break time="1s"/> asian, non diary,lacto ovo,oriental or jain?')
            .addElicitSlotDirective('vegType')
            .getResponse();
    }
};


const NonVegGivenOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "OrderIntent" &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value === 'nonvegetarian' &&
            !handlerInput.requestEnvelope.request.intent.slots.nonvegType.value
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(`Which would you like <break time="1s"/>regular, kosher, asian or continental?`)
            .addElicitSlotDirective('nonvegType')
            .getResponse();
    }
};

const HealthyMealGivenOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "OrderIntent" &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value &&
            handlerInput.requestEnvelope.request.intent.slots.meal.value === 'healthy' &&
            !handlerInput.requestEnvelope.request.intent.slots.healthyType.value
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Which meal would you like <break time="1s"/>low fat,low calorie,lactose free or fruit platter?')
            .addElicitSlotDirective('healthyType')
            .getResponse();
    }
};

const CompletedOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "OrderIntent" &&
            handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
    },
    handle(handlerInput) {
        const meal = handlerInput.requestEnvelope.request.intent.slots.meal.value;

        const responseBuilder = handlerInput.responseBuilder;
        // Add APL directive to response


        let type;
        let speechText = "";

        if (meal === 'vegetarian') {
            type = handlerInput.requestEnvelope.request.intent.slots.vegType.value;
        } else if (meal === 'nonvegetarian') {
            type = handlerInput.requestEnvelope.request.intent.slots.nonvegType.value;
        } else if (meal === 'healthy') {
            type = handlerInput.requestEnvelope.request.intent.slots.healthyType.value;
        }

        console.log(type);
        speechText = `You prefer a ${meal} meal. We confirm the ${type} dish for you.`;
        myMeal=meal.substring(0,1).toUpperCase()+meal.substring(1);
        myDish=(type.substring(0,1)).toUpperCase()+type.substring(1);
        

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: homeScreen,
                datasources: {
                    text: {
                        type: 'object',
                        title: "Meal Selection",
                        option1: "",
                        option2: "MEAL: " + myMeal,
                        option3: "DISH: " + myDish
                    },
                }
            });
        }

        console.log(myMeal);
        console.log(myDish)
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};



//tea coffee

const StartedInProgressDrinkIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "DrinkIntent" &&
            handlerInput.requestEnvelope.request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .addDelegateDirective()
            .getResponse();
    }
};

const CoffeeGivenOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "DrinkIntent" &&
            handlerInput.requestEnvelope.request.intent.slots.drink.value &&
            handlerInput.requestEnvelope.request.intent.slots.drink.value === 'coffee' &&
            !handlerInput.requestEnvelope.request.intent.slots.coffeeRoast.value
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak('Which roast would you like light, medium, medium-dark, or dark?')
            .reprompt('Would you like a light, medium, medium-dark, or dark roast?')
            .addElicitSlotDirective('coffeeRoast')
            .getResponse();
    }
};

const TeaGivenOrderIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "DrinkIntent" &&
            handlerInput.requestEnvelope.request.intent.slots.drink.value &&
            handlerInput.requestEnvelope.request.intent.slots.drink.value === 'tea' &&
            !handlerInput.requestEnvelope.request.intent.slots.teaType.value
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak("Which would you like black, green, oolong, or white tea?")
            .reprompt("Would you like a black, green, oolong, or white tea?")
            .addElicitSlotDirective('teaType')
            .getResponse();
    }
};

const CompletedDrinkIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
            handlerInput.requestEnvelope.request.intent.name === "DrinkIntent" &&
            handlerInput.requestEnvelope.request.dialogState === "COMPLETED";
    },
    handle(handlerInput) {

        const drink = handlerInput.requestEnvelope.request.intent.slots.drink.value;
        let type;

        if (drink === 'coffee') {
            type = handlerInput.requestEnvelope.request.intent.slots.coffeeRoast.value;
        } else if (drink === 'tea') {
            type = handlerInput.requestEnvelope.request.intent.slots.teaType.value;
        } else {
            type = 'water';
        }

        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: homeScreen,
                datasources: {
                    text: {
                        type: 'object',
                        title: "BEVERAGES",
                        option1: "",
                        option2: "DRINK: " + drink,
                        option3: "TYPE: " + type
                    },
                }
            });
        }

        const speechText = `It looks like you want ${type} ${drink}`;
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};



//payment intent handler
const PaymentIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === "PaymentIntent" && request.dialogState !== 'COMPLETED';
    },
    async handle(handlerInput) {
        console.log(reverseTrip);
        let fare = 0;
        let cardNum = cardDetail.paymentMethod.cardNumber;
        cardNum = cardNum.substring(15);

        let fromCode = totalPrice[0].curCode;
        console.log("First Trip");
        console.log(fromCode);
        const promise = getChange(totalPrice[0].curCode);
        const change = await promise.then(data => {
            const price = (data);
            return price.rates;
        })

        console.log(change);
        console.log(change[fromCode]);
        fare = (totalPrice[0].fare) / (change[fromCode]);

        if (reverseTrip) {
            let toCode = totalPrice[1].curCode;
            console.log(toCode);
            console.log("Entered Reverse Trip");
            console.log(toCode);
            const promise = getChange(totalPrice[1].curCode);
            const change = await promise.then(data => {
                const price = (data);
                return price.rates;
            })
            console.log(change[toCode]);
            fare = fare + (totalPrice[1].fare) / (change[toCode])
        }
        fare = fare.toFixed(2);
        fareTotal = fare;
        return handlerInput.responseBuilder
            .speak(`The fare is ${fare} Euro, Say your pin for the card ending with ${oneAtATime(cardNum)} to proceed further. You can say open pin map if you don't wish to reveal the cvv`)
            .getResponse();

        // return PaymentPinIntentHandler.handle(handlerInput)
        //     .getResponse();

        //intentHandler.handle(handlerInput)
    }
}


const InProgressPaymentPinIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'PaymentPinIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {
        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    }
}


const CompletedPaymentPinIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === "PaymentPinIntent";
    },
    handle(handlerInput) {


        let cardPin = cardDetail.paymentMethod.cvv;

        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);
        const pinNumber = (slotValues.pinNumber.synonym);
        console.log(pinNumber)
        if (pinNumber === cardPin) {
            return handlerInput.responseBuilder
                .speak(`Got the pin,we will proceed with the payment`)
                .getResponse();
        } else if (pinNumber < 100 && pinNumber > 999) {
            return handlerInput.responseBuilder
                .speak(`The pin is incorrect, please enter a three digit pin`)
                .getResponse();
        } else {
            return handlerInput.responseBuilder
                .speak(`It is a wrong pin`)
                .getResponse();
        }
    }
}


const PinMapLaunchIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'PinMapLaunchIntent';
    },
    handle(handlerInput) {
        counter = 3;
        pinNumber = 0;
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: cvvNew,
                datasources: {
                    "listTemplate1Metadata": {
                        "type": "object",
                        "objectId": "lt1Metadata",
                        "backgroundImage": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [{
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "title": "ENTER THE CVV PIN:"
                    },
                    "listTemplate1ListData": {
                        "type": "list",
                        "listId": "lt1Sample",
                        "totalNumberOfItems": 4,
                        "listPage": {
                            "listItems": [{
                                    "listItemIdentifier": "row1",
                                    "ordinalNumber": 1,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "1",
                                            "textAlign": "center"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "2",
                                            "textAlign": "center"
                                        },
                                        "tertiaryText": {
                                            "type": "PlainText",
                                            "text": "3"
                                        }
                                    },
                                    "token": "row1"
                                },
                                {
                                    "listItemIdentifier": "row2",
                                    "ordinalNumber": 2,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "4"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "5"
                                        },
                                        "tertiaryText": {
                                            "type": "PlainText",
                                            "text": "6"
                                        }
                                    },
                                    "token": "row2"
                                },
                                {
                                    "listItemIdentifier": "row3",
                                    "ordinalNumber": 3,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "7"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "8"
                                        },
                                        "tertiaryText": {
                                            "type": "PlainText",
                                            "text": "9"
                                        }
                                    },
                                    "token": "row3"
                                },
                                {
                                    "listItemIdentifier": "row4",
                                    "ordinalNumber": 4,
                                    "textContent": {
                                        "primaryText": {
                                            "type": "PlainText",
                                            "text": "*"
                                        },
                                        "secondaryText": {
                                            "type": "PlainText",
                                            "text": "0"
                                        },
                                        "tertiaryText": {
                                            "type": "PlainText",
                                            "text": "#"
                                        }
                                    },
                                    "token": "row4"
                                }
                            ]
                        }
                    }
                }
            });
        }

        return handlerInput.responseBuilder
            .speak('Enter the cvv pin ')
            .getResponse();
    }
}


const PinTouchEventHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent' &&
            (handlerInput.requestEnvelope.request.source.id === 'primaryText' || handlerInput.requestEnvelope.request.source.id === 'secondaryText' || handlerInput.requestEnvelope.request.source.id === 'tertiaryText');
    },
    handle(handlerInput) {
        console.log(counter);
        let digit;
        counter = counter - 1;
        const inputDigit = handlerInput.requestEnvelope.request;
        if (inputDigit.arguments[0] === 'Left') {
            if (inputDigit.arguments[1] === 'row1') {
                digit = 1;
            }
            if (inputDigit.arguments[1] === 'row2') {
                digit = 4;
            }
            if (inputDigit.arguments[1] === 'row3') {
                digit = 7;
            }
        }
        if (inputDigit.arguments[0] === 'Center') {
            if (inputDigit.arguments[1] === 'row1') {
                digit = 2;
            }
            if (inputDigit.arguments[1] === 'row2') {
                digit = 5;
            }
            if (inputDigit.arguments[1] === 'row3') {
                digit = 8;
            }
            if (inputDigit.arguments[1] === 'row4') {
                digit = 0;
            }
        }
        if (inputDigit.arguments[0] === 'Right') {
            if (inputDigit.arguments[1] === 'row1') {
                digit = 3;
            }
            if (inputDigit.arguments[1] === 'row2') {
                digit = 6;
            }
            if (inputDigit.arguments[1] === 'row3') {
                digit = 9;
            }
        }


        // console.log(handlerInput.requestEnvelope.request.arguments[0]);
        // console.log(handlerInput.requestEnvelope.request.arguments[1]);
        // console.log(counter);
        let cardPin = cardDetail.paymentMethod.cvv;
        digit = digit * (Math.pow(10, counter))
        pinNumber = pinNumber + digit;
        console.log(pinNumber);
        console.log(typeof (pinNumber));
        // if(pinAttempts===0){
        //     return handlerInput.responseBuilder
        //         .speak(`Sorry, you would need to restart the application`)
        //         .getResponse();
        // }

        if (counter > 0) {
            return handlerInput.responseBuilder
                .speak()
                .reprompt(`Should be three digit`)
                .getResponse();
        } else if (counter === 0) {
            if (pinNumber == cardPin) {
                return handlerInput.responseBuilder
                    .speak(`Got the pin,we will proceed with the payment`)
                    .getResponse();
            } else if (pinNumber <= 100 && pinNumber >= 999) {


                return handlerInput.responseBuilder
                    .speak(`The pin is incorrect. Say map pin to try again `)
                    .getResponse();
            } else {
                return handlerInput.responseBuilder
                    .speak(`Please enter a valid pin, say map pin to try again`)
                    .getResponse();
            }
        }

    }
}


const SeatMapLaunchIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'SeatMapLaunchIntent';
    },
    handle(handlerInput) {
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: seatMapAPL,
                datasources: {
                    "listTemplate1Metadata": {
                        "type": "object",
                        "objectId": "lt1Metadata",
                        "backgroundImage": {
                            "contentDescription": null,
                            "smallSourceUrl": null,
                            "largeSourceUrl": null,
                            "sources": [{
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "small",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                },
                                {
                                    "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                    "size": "large",
                                    "widthPixels": 0,
                                    "heightPixels": 0
                                }
                            ]
                        },
                        "title": "Select Seat",
                        "logoUrl": "https://d2o906d8ln7ui1.cloudfront.net/images/cheeseskillicon.png"
                    },
                    "listTemplate1ListData": {
                        "type": "list",
                        "listId": "lt1Sample",
                        "totalNumberOfItems": 5,
                        "listPage": {
                            "listItems": [{
                                "listItemIdentifier": "row1",
                                "ordinalNumber": 1,
                                "textContent": {
                                    "rowNum": {
                                        "type": "PlainText",
                                        "text": "12",
                                        "textAlign": "center"
                                    }
                                },
                                "imageA": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 10,
                                            "heightPixels": 10
                                        }
                                    ]
                                },
                                "imageC": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageD": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageF": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "token": "row1"
                            }, {
                                "listItemIdentifier": "row2",
                                "ordinalNumber": 1,
                                "textContent": {
                                    "rowNum": {
                                        "type": "PlainText",
                                        "text": "13",
                                        "textAlign": "center"
                                    }
                                },
                                "imageA": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 10,
                                            "heightPixels": 10
                                        }
                                    ]
                                },
                                "imageC": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageD": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageF": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "token": "row2"
                            }, {
                                "listItemIdentifier": "row3",
                                "ordinalNumber": 1,
                                "textContent": {
                                    "rowNum": {
                                        "type": "PlainText",
                                        "text": "14",
                                        "textAlign": "center"
                                    }
                                },
                                "imageA": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 10,
                                            "heightPixels": 10
                                        }
                                    ]
                                },
                                "imageC": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageD": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageF": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "token": "row3"
                            }, {
                                "listItemIdentifier": "row4",
                                "ordinalNumber": 1,
                                "textContent": {
                                    "rowNum": {
                                        "type": "PlainText",
                                        "text": "15",
                                        "textAlign": "center"
                                    }
                                },
                                "imageA": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 10,
                                            "heightPixels": 10
                                        }
                                    ]
                                },
                                "imageC": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageD": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },
                                "imageF": {
                                    "contentDescription": null,
                                    "smallSourceUrl": null,
                                    "largeSourceUrl": null,
                                    "sources": [{
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312147.svg",
                                            "size": "small",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        },
                                        {
                                            "url": "https://image.flaticon.com/icons/svg/2312/2312386.svg",
                                            "size": "large",
                                            "widthPixels": 0,
                                            "heightPixels": 0
                                        }
                                    ]
                                },


                                "token": "row4"
                            }]
                        }
                    }
                }
            });
        }

        return handlerInput.responseBuilder
            .speak(`Select your desired seat from the seatMap`)
            .getResponse();
    }
}


const SeatMapTouchEventHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'Alexa.Presentation.APL.UserEvent' &&
            (handlerInput.requestEnvelope.request.source.id === 'imageA' || handlerInput.requestEnvelope.request.source.id === 'imageC' || handlerInput.requestEnvelope.request.source.id === 'imageD' || handlerInput.requestEnvelope.request.source.id === 'imageF');
    },
    handle(handlerInput) {

        let column = (handlerInput.requestEnvelope.request.arguments[0]);
        //imageC
        let row = (handlerInput.requestEnvelope.request.arguments[1]);
        //row4
        column = column.substring(5);
        var tempColumn;
        if (column === 'A') {
            tempColumn = 1;
        } else if (column === 'C') {
            tempColumn = 2;
        } else if (column === 'D') {
            tempColumn = 3;
        } else if (column === 'F') {
            tempColumn = 4;
        }

        row = row.substring(3);

        var intRow = parseInt(row, 10);
        var temp = intRow;
        intRow = intRow + 11;
        console.log(temp);

        var i = (temp - 1) * 4 + tempColumn;
        i = i - 1;
        if (seatMap.data.seatmaps[0].decks[0].seats[i].travelers[0].seatAvailabilityStatus === 'occupied') {
            return handlerInput.responseBuilder
                .speak(`The seat is occupied`)
                .getResponse()
        } else {
            seatMap.data.seatmaps[0].decks[0].seats[i].travelers[0].seatAvailabilityStatus = 'occupied';
            seatCount++;
            var seatSelect = {
                row: intRow,
                col: column
            };
            seatArr.push(seatSelect);
            console.log(seatArr);
            console.log(seatCount);
        }


        var speakOutput = `You have chosen <break time="0.25s"/>`

        if (seatCount === 1) {
            fromSeat = ` Seat ${seatArr[0].row} ${seatArr[0].col}`
            speakOutput += ` Seat ${seatArr[0].row} ${seatArr[0].col} <break time="0.25s"/>`
            if (reverseTrip) {
                speakOutput += 'Select seat for the return Trip'
            }
        }

        if (seatCount === 2 && reverseTrip) {
            toSeat = `Seat ${seatArr[1].row} ${seatArr[1].col}`
            speakOutput += ` Seat ${seatArr[1].row} ${seatArr[1].col} <break time="0.25s"/>`
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse()

    }
}


const InProgressAncillaryIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            request.intent.name === 'AncillaryIntent' &&
            request.dialogState !== 'COMPLETED';
    },
    handle(handlerInput) {

        const currentIntent = handlerInput.requestEnvelope.request.intent;
        return handlerInput.responseBuilder
            .addDelegateDirective(currentIntent)
            .getResponse();
    },
};


const CompletedAncillaryIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === "AncillaryIntent";
    },
    handle(handlerInput) {



        const filledSlots = handlerInput.requestEnvelope.request.intent.slots;
        const slotValues = getSlotValues(filledSlots);
        serviceChosen = (slotValues.service.synonym);
        if (Alexa.getSupportedInterfaces(handlerInput.requestEnvelope)['Alexa.Presentation.APL']) {
            // Create Render Directive
            handlerInput.responseBuilder.addDirective({
                type: 'Alexa.Presentation.APL.RenderDocument',
                document: homeScreen,
                datasources: {
                    text: {
                        type: 'object',
                        title: "Ancillary Service",
                        option1: "Wheel Chair Assistance",
                        option2: "Wifi On Board",
                        option3: "Extra Leg Space",
                        option4: "You chose: " + serviceChosen
                    },
                }
            });
        }
        return handlerInput.responseBuilder
            .speak(`We will ensure the ${serviceChosen} service`)
            .getResponse();
    }
}

const IternaryDetailIntentHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'IternaryDetailIntent';
    },
    handle(handlerInput) {
        handlerInput.responseBuilder.addDirective({
            type: 'Alexa.Presentation.APL.RenderDocument',
            document: iternaryDetailJson,
            datasources: {

                "listTemplate1Metadata": {
                    "type": "object",
                    "objectId": "lt1Metadata",
                    "backgroundImage": {
                        "contentDescription": null,
                        "smallSourceUrl": null,
                        "largeSourceUrl": null,
                        "sources": [{
                                "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                "size": "small",
                                "widthPixels": 0,
                                "heightPixels": 0
                            },
                            {
                                "url": "https://images.unsplash.com/photo-1483375801503-374c5f660610?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=750&q=80",
                                "size": "large",
                                "widthPixels": 0,
                                "heightPixels": 0
                            }
                        ]
                    },
                    "title": "Iternary Detail"
                },
                "listTemplate1ListData": {

                    "type": "list",
                    "listId": "lt1Sample",
                    "totalNumberOfItems": 2,
                    "listPage": {
                        "listItems": [{
                                "listItemIdentifier": "departure",
                                "ordinalNumber": 1,
                                "textContent": {
                                    "primaryText": {
                                        "type": "PlainText",
                                        "text": "Departure Detail"
                                    },
                                    "seatText": {
                                        "type": "PlainText",
                                        "text": fromSeat
                                    },
                                    "secondaryText": {
                                        "type": "PlainText",
                                        "text": fromCity + "(" + fromCode + ")" + "->" + toCity + "(" + toCode + ")"
                                    },
                                    "tertiaryText": {
                                        "type": "PlainText",
                                        "text": departureDateStr
                                    },
                                    "timeText": {
                                        "type": "PlainText",
                                        "text": fromDept + "->" + fromArr
                                    }
                                },
                                "token": "departure"
                            },
                            {
                                "listItemIdentifier": "arrival",
                                "ordinalNumber": 2,
                                "textContent": {
                                    "primaryText": {
                                        "type": "PlainText",
                                        "text": "Arrival Detail"
                                    },
                                    "seatText": {
                                        "type": "PlainText",
                                        "text": toSeat
                                    },
                                    "secondaryText": {
                                        "type": "PlainText",
                                        "text": toCity + "(" + toCode + ")" + "->" + fromCity + "(" + fromCode + ")"
                                    },
                                    "tertiaryText": {
                                        "type": "PlainText",
                                        "text": arrivalDateStr
                                    },
                                    "timeText": {
                                        "type": "PlainText",
                                        "text": toDept + "->" + toArr
                                    }
                                },
                                "token": "arrival"
                            }
                        ]
                    }
                },
                "text": {
                    "name": customerName,
                    "meal": myMeal,
                    "dish": myDish,
                    "service": serviceChosen,
                    "totalFare": fareTotal + " EURO"
                }
            }
        })

        return handlerInput.responseBuilder
            .speak('We have the summarized result')
            .getResponse()
    }

}


const HelpHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        return responseBuilder
            .speak(helpOutput)
            .reprompt(helpReprompt)
            .getResponse();
    },
};

const CancelStopHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' &&
            (request.intent.name === 'AMAZON.CancelIntent' || request.intent.name === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;
        const speechOutput = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(speechOutput)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const SessionEndedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    },
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);
        console.log(`Error handled: ${error}`);

        return handlerInput.responseBuilder
            .speak('Sorry, I can not understand the command.  Please say again.')
            .reprompt('Sorry, I can not understand the command.  Please say again.')
            .getResponse();
    },
};

// 2. Helper Functions ============================================================================


function getSlotValues(filledSlots) {
    const slotValues = {};

    console.log(`The filled slots: ${JSON.stringify(filledSlots)}`);
    Object.keys(filledSlots).forEach((item) => {
        const name = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        synonym: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        isValidated: true,
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        synonym: filledSlots[item].value,
                        resolved: filledSlots[item].value,
                        isValidated: false,
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                synonym: filledSlots[item].value,
                resolved: filledSlots[item].value,
                isValidated: false,
            };
        }
    }, this);

    return slotValues;
}

function getRandomPhrase(array) {
    // the argument is an array [] of words or phrases
    const i = Math.floor(Math.random() * array.length);
    return (array[i]);
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}


async function getPrevious() {
    const result = await axios.get(`https://aes1a.herokuapp.com/cem/cis/123456`)
    return result;
}

async function getChange(curCode) {
    const getChangeUrl = `http://data.fixer.io/api/latest?access_key=9ea402e45118ad096e80014dfffe9c05&symbols=`;
    const query = curCode
    const api = getChangeUrl + query;
    const result = await axios.get(api);
    return result.data;
}

async function bookFlight(from, to, date) {
    const org = getKeyByValue(list.cityList, from);
    const dest = getKeyByValue(list.cityList, to);
    const query = `originLocationCode=${org}&destinationLocationCode=${dest}&departureDateTime=${date}`;
    const api = api_url + query
    const result = await axios.get(api);
    return result;
}

function convertSeconds(totalSeconds) {
    var hours = Math.floor(totalSeconds / 3600);
    totalSeconds %= 3600;
    var minutes = Math.floor(totalSeconds / 60);
    return hours * 100 + minutes;
}


function ampm(times) {
    var temp;
    var hr = parseInt(times.slice(0, 2));

    if (times === 1200) {
        temp = "NOON";
        return temp;
    } else if (hr === "0") {
        temp = "12 " + times.slice(2, times.length) + " AM ";
        return temp;
    } else if (hr < 12) {
        if (times.slice(2, times.length) === "00") {
            temp = hr + " AM ";
            return temp;
        }
        temp = hr + " " + times.slice(2, times.length) + " AM ";
        return temp;
    } else {
        hr = hr % 12;
        if (times.slice(2, times.length) === "00") {
            temp = hr + " PM ";
            return temp;
        }
        temp = hr + " " + times.slice(2, times.length) + " PM ";
        return temp;
    }
}



function oneAtATime(n) {
    n = n.toString();
    var i;
    var sp = "";
    for (i = 0; i < n.length; i++) {
        if (n[i] === "0") {
            sp = sp + "zero"
        } else if (n[i] === "1") {
            sp = sp + "one"
        } else if (n[i] === "2") {
            sp = sp + "two"
        } else if (n[i] === "3") {
            sp = sp + "three"
        } else if (n[i] === "4") {
            sp = sp + "four"
        } else if (n[i] === "5") {
            sp = sp + "five"
        } else if (n[i] === "6") {
            sp = sp + "six"
        } else if (n[i] === "7") {
            sp = sp + "seven"
        } else if (n[i] === "8") {
            sp = sp + "eight"
        } else {
            sp = sp + "nine"
        }
        sp = sp + " ";
    }

    return sp;
}


// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.custom();
exports.handler = skillBuilder
    .addRequestHandlers(
        LaunchRequestHandler,
        HomeScreenIntentHandler,
        InProgressPlanMyTripHandler,
        CompletedPlanMyTripHandler,
        InProgressReverseTripIntentHandler,
        CompletedReverseTripIntentHandler,
        InProgressSeatSelectionIntentHandler,
        CompletedSeatSelectionIntentHandler,
        PreviousTripIntentHandler,
        GetCartIntentHandler,
        StartedInProgressOrderIntentHandler,
        VegMealGivenOrderIntentHandler,
        NonVegGivenOrderIntentHandler,
        HealthyMealGivenOrderIntentHandler,
        CompletedOrderIntentHandler,
        CompletedDrinkIntentHandler,
        TeaGivenOrderIntentHandler,
        CoffeeGivenOrderIntentHandler,
        StartedInProgressDrinkIntentHandler,
        PaymentIntentHandler,
        InProgressPaymentPinIntentHandler,
        CompletedPaymentPinIntentHandler,
        InProgressAncillaryIntentHandler,
        CompletedAncillaryIntentHandler,
        PinTouchEventHandler,
        PinMapLaunchIntentHandler,
        SeatMapLaunchIntentHandler,
        SeatMapTouchEventHandler,
        IternaryDetailIntentHandler,
        CancelStopHandler,
        HelpHandler,
        SessionEndedHandler,
    )
    .addErrorHandlers(ErrorHandler)
    .withCustomUserAgent('cookbook/dialog-delegate/v1')
    .lambda();