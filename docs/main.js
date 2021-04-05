(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Work\websdk-morph-zoom\MorphcastZoomAngular\src\main.ts */"zUnb");


/***/ }),

/***/ "AytR":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const environment = {
    production: false
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "Sy1n":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent, Participant, MeanAttention, MeanEngagement, MeanPositivity */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "Participant", function() { return Participant; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MeanAttention", function() { return MeanAttention; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MeanEngagement", function() { return MeanEngagement; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MeanPositivity", function() { return MeanPositivity; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/common */ "ofXK");
/* harmony import */ var _zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @zoomus/websdk */ "3hj0");
/* harmony import */ var _zoomus_websdk__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! rxjs */ "qCKp");
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! uuid */ "4USb");
/* harmony import */ var rxjs_operators__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! rxjs/operators */ "kU1M");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! @angular/router */ "tyNb");










_zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__["ZoomMtg"].setZoomJSLib('https://sorinandrei.github.io/MorphcastZoomAngular/node/@zoomus/websdk/dist/lib', '/av');
_zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__["ZoomMtg"].preLoadWasm();
_zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__["ZoomMtg"].prepareJssdk();
class AppComponent {
    constructor(httpClient, document, route) {
        this.httpClient = httpClient;
        this.route = route;
        this.loader = CY.loader();
        this.oppenedConnection = false;
        // setup your signature endpoint here: https://github.com/zoom/websdk-sample-signature-node.js
        this.signatureEndpoint = 'https://benchmark-signature.herokuapp.com';
        this.apiKey = 'rZmqWjExSze-48_tCZVwYw';
        this.meetingNumber = '';
        this.role = 0;
        this.leaveUrl = 'https://sorinandrei.github.io/MorphcastZoomAngular';
        this.passWord = '';
        this.participant = new Participant();
    }
    ngOnInit() {
        this.loadMorphcast();
        this.route.queryParams.subscribe(params => {
            console.log(params);
            this.participant.name = params['name'];
            let meetingId = params['meetingId'];
            if (meetingId && meetingId > 0) {
                this.meetingNumber = meetingId;
                if (!this.participant.name) {
                    this.participant.name = "Guest_" + this.getRandomID();
                }
                this.participant.email = this.participant.name + '@gmail.com';
                this.registerEventListener(meetingId, this.participant.name);
                //this.getSignature();
                //this.startSDK();
                setInterval(() => {
                    this.sendParticipantToServer(this.participant, meetingId).subscribe(res => { }, err => console.log(err));
                }, 10000);
            }
        });
    }
    getRandomID() {
        return Math.random().toString(36).substr(2, 9);
    }
    getSignature() {
        this.httpClient.post(this.signatureEndpoint, {
            meetingNumber: this.meetingNumber,
            role: this.role
        }).toPromise().then((data) => {
            if (data.signature) {
                console.log(data.signature);
                this.startMeeting(data.signature);
            }
            else {
                console.log(data);
            }
        }).catch((error) => {
            console.log(error);
        });
    }
    startMeeting(signature) {
        console.log("inside start meeting");
        _zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__["ZoomMtg"].init({
            leaveUrl: this.leaveUrl,
            isSupportAV: true,
            success: (success) => {
                console.log(success);
                console.log(this.meetingNumber, this.participant);
                _zoomus_websdk__WEBPACK_IMPORTED_MODULE_2__["ZoomMtg"].join({
                    signature: signature,
                    meetingNumber: this.meetingNumber,
                    userName: this.participant.name,
                    apiKey: this.apiKey,
                    userEmail: this.participant.email,
                    passWord: "1234",
                    success: (success) => {
                        console.log(success);
                    },
                    error: (error) => {
                        console.log(error);
                    }
                });
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
    loadMorphcast() {
        this.loader.licenseKey("39d24a4191518dde3e4fbed5ec690d6fc6a22dd3507d");
        this.loader.addModule(CY.modules().FACE_DETECTOR.name, { maxInputFrameSize: 320, multiFace: true });
        this.loader.addModule(CY.modules().FACE_ATTENTION.name, { smoothness: 0.99 });
        this.loader.addModule(CY.modules().FACE_EMOTION.name, { smoothness: 0.99, enableBalancer: false });
        this.loader.addModule(CY.modules().FACE_AROUSAL_VALENCE.name, { smoothness: 0.8 });
        this.loader.addModule(CY.modules().FACE_AGE.name);
        this.loader.powerSave(2);
        this.loader.maxInputFrameSize(320);
        this.loader.load().then(({ start, stop, terminate }) => {
            //start();
            this.startSDK = start;
            this.stopSDK = stop;
            this.terminateSDK = terminate;
        });
    }
    registerEventListener(meetingNumber, userName) {
        Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["fromEvent"])(window, CY.modules().FACE_DETECTOR.eventName).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["throttle"])(ev => Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["interval"])(1000))).subscribe((evt) => {
            let data = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.totalFaces);
            // this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
            this.participant.parseEvent(data);
        });
        Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["fromEvent"])(window, CY.modules().FACE_AGE.eventName).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["throttle"])(ev => Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["interval"])(1000))).subscribe((evt) => {
            console.log(evt);
            let data = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.numericAge);
            //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
            this.participant.parseEvent(data);
        });
        Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["fromEvent"])(window, CY.modules().FACE_EMOTION.eventName).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["throttle"])(ev => Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["interval"])(1000))).subscribe((evt) => {
            let data = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.dominantEmotion);
            //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
            this.participant.parseEvent(data);
        });
        Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["fromEvent"])(window, CY.modules().FACE_ATTENTION.eventName).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["throttle"])(ev => Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["interval"])(1000))).subscribe((evt) => {
            let data = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.attention);
            //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
            this.participant.parseEvent(data);
        });
        Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["fromEvent"])(window, CY.modules().FACE_AROUSAL_VALENCE.eventName).pipe(Object(rxjs_operators__WEBPACK_IMPORTED_MODULE_5__["throttle"])(ev => Object(rxjs__WEBPACK_IMPORTED_MODULE_3__["interval"])(1000))).subscribe((evt) => {
            if (evt.detail.output.arousalvalence.arousal > 0) {
                let data = new EventData(userName, meetingNumber, "face_arousal", evt.detail.output.arousalvalence.arousal);
                //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
                this.participant.parseEvent(data);
            }
            if (evt.detail.output.arousalvalence.valence > 0) {
                let data = new EventData(userName, meetingNumber, "face_valence", evt.detail.output.arousalvalence.valence);
                //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
                this.participant.parseEvent(data);
            }
        });
    }
    sendEventToServer(data) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_3__["Observable"](observer => {
            this.request(RequestMethod.POST, Endpoints.ADD_EVENT_ENDPOINT, {
                body: JSON.stringify(data)
            }).subscribe((result) => observer.next(result), (error) => observer.error(error));
        });
    }
    getMeetingState(meetingId) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_3__["Observable"](observer => {
            this.request(RequestMethod.GET, Endpoints.GET_MEETING + '/' + meetingId, {}).subscribe(result => observer.next(result), (error) => observer.error(error));
        });
    }
    sendParticipantToServer(participant, meetingId) {
        return new rxjs__WEBPACK_IMPORTED_MODULE_3__["Observable"](observer => {
            this.request(RequestMethod.POST, Endpoints.ADD_PARTICIPANT_ENDPOINT + '/' + meetingId, {
                body: JSON.stringify(participant)
            }).subscribe((result) => observer.next(result), (error) => observer.error(error));
        });
    }
    request(method, endpoint, options) {
        return this.httpClient.request(method, endpoint, options);
    }
}
AppComponent.ɵfac = function AppComponent_Factory(t) { return new (t || AppComponent)(_angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_common__WEBPACK_IMPORTED_MODULE_1__["DOCUMENT"]), _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdirectiveInject"](_angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"])); };
AppComponent.ɵcmp = _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵdefineComponent"]({ type: AppComponent, selectors: [["app-root"]], decls: 9, vars: 1, consts: [[3, "click"], ["id", "startSDK", 3, "click"], ["id", "stopSDK", 3, "click"]], template: function AppComponent_Template(rf, ctx) { if (rf & 1) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](0, "main");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](1, "h1");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](2, "Zoom WebSDK Sample Angular");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](3, "button", 0);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AppComponent_Template_button_click_3_listener() { return ctx.getSignature(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](5, "button", 1);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AppComponent_Template_button_click_5_listener() { return ctx.startSDK(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](6, "Start SDK ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementStart"](7, "button", 2);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵlistener"]("click", function AppComponent_Template_button_click_7_listener() { return ctx.stopSDK(); });
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtext"](8, "Stop SDK ");
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵelementEnd"]();
    } if (rf & 2) {
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵadvance"](4);
        _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵɵtextInterpolate1"]("Join Meeting ", ctx.meetingNumber, "");
    } }, styles: ["main[_ngcontent-%COMP%] {\r\n  width: 70%;\r\n  margin: auto;\r\n  text-align: center;\r\n}\r\n\r\nbutton[_ngcontent-%COMP%] {\r\n  margin-top: 20px;\r\n  background-color: #2D8CFF;\r\n  color: #ffffff;\r\n  text-decoration: none;\r\n  padding-top: 10px;\r\n  padding-bottom: 10px;\r\n  padding-left: 40px;\r\n  padding-right: 40px;\r\n  display: inline-block;\r\n  border-radius: 10px;\r\n}\r\n\r\nbutton[_ngcontent-%COMP%]:hover {\r\n  background-color: #2681F2;\r\n}\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb21wb25lbnQuY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0UsVUFBVTtFQUNWLFlBQVk7RUFDWixrQkFBa0I7QUFDcEI7O0FBRUE7RUFDRSxnQkFBZ0I7RUFDaEIseUJBQXlCO0VBQ3pCLGNBQWM7RUFDZCxxQkFBcUI7RUFDckIsaUJBQWlCO0VBQ2pCLG9CQUFvQjtFQUNwQixrQkFBa0I7RUFDbEIsbUJBQW1CO0VBQ25CLHFCQUFxQjtFQUNyQixtQkFBbUI7QUFDckI7O0FBRUE7RUFDRSx5QkFBeUI7QUFDM0IiLCJmaWxlIjoiYXBwLmNvbXBvbmVudC5jc3MiLCJzb3VyY2VzQ29udGVudCI6WyJtYWluIHtcclxuICB3aWR0aDogNzAlO1xyXG4gIG1hcmdpbjogYXV0bztcclxuICB0ZXh0LWFsaWduOiBjZW50ZXI7XHJcbn1cclxuXHJcbmJ1dHRvbiB7XHJcbiAgbWFyZ2luLXRvcDogMjBweDtcclxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMkQ4Q0ZGO1xyXG4gIGNvbG9yOiAjZmZmZmZmO1xyXG4gIHRleHQtZGVjb3JhdGlvbjogbm9uZTtcclxuICBwYWRkaW5nLXRvcDogMTBweDtcclxuICBwYWRkaW5nLWJvdHRvbTogMTBweDtcclxuICBwYWRkaW5nLWxlZnQ6IDQwcHg7XHJcbiAgcGFkZGluZy1yaWdodDogNDBweDtcclxuICBkaXNwbGF5OiBpbmxpbmUtYmxvY2s7XHJcbiAgYm9yZGVyLXJhZGl1czogMTBweDtcclxufVxyXG5cclxuYnV0dG9uOmhvdmVyIHtcclxuICBiYWNrZ3JvdW5kLWNvbG9yOiAjMjY4MUYyO1xyXG59XHJcbiJdfQ== */"] });
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_0__["ɵsetClassMetadata"](AppComponent, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"],
        args: [{
                selector: 'app-root',
                templateUrl: './app.component.html',
                styleUrls: ['./app.component.css']
            }]
    }], function () { return [{ type: _angular_common_http__WEBPACK_IMPORTED_MODULE_6__["HttpClient"] }, { type: undefined, decorators: [{
                type: _angular_core__WEBPACK_IMPORTED_MODULE_0__["Inject"],
                args: [_angular_common__WEBPACK_IMPORTED_MODULE_1__["DOCUMENT"]]
            }] }, { type: _angular_router__WEBPACK_IMPORTED_MODULE_7__["ActivatedRoute"] }]; }, null); })();
class EventData {
    constructor(user, meetingId, eventType, eventValue) {
        this.id = Object(uuid__WEBPACK_IMPORTED_MODULE_4__["v4"])();
        this.user = user;
        this.meetingId = meetingId;
        this.eventType = eventType;
        this.eventValue = eventValue;
    }
}
var Endpoints;
(function (Endpoints) {
    Endpoints["ADD_EVENT_ENDPOINT"] = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod/event";
    Endpoints["ADD_PARTICIPANT_ENDPOINT"] = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod/participant";
    Endpoints["GET_MEETING"] = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod";
})(Endpoints || (Endpoints = {}));
class RequestOptions {
}
var RequestMethod;
(function (RequestMethod) {
    RequestMethod["GET"] = "get";
    RequestMethod["POST"] = "post";
    RequestMethod["PUT"] = "put";
    RequestMethod["DELETE"] = "delete";
    RequestMethod["PATCH"] = "patch";
})(RequestMethod || (RequestMethod = {}));
class Participant {
    constructor() {
        this.faceLikelyAge = 0;
        this.meanPositivity = new MeanPositivity();
        this.meanEngagement = new MeanEngagement();
        this.meanAttention = new Map();
    }
    parseEvent(event) {
        if (event.eventType === "face_detector") {
            this.totalFaces = event.eventValue;
        }
        if (event.eventType === "face_emotion") {
            this.emotion = event.eventValue;
        }
        if (event.eventType === "face_age") {
            if (this.faceLikelyAge == 0 && this.attentionPercentage > 85) {
                this.faceLikelyAge = event.eventValue;
            }
        }
        if (event.eventType === "face_valence") {
            this.meanPositivity.add(event);
        }
        if (event.eventType === "face_arousal") {
            this.meanEngagement.add(event);
        }
        if (event.eventType === "face_attention") {
            this.attentionPercentage = parseInt((event.eventValue * 100).toFixed(0));
            let date = new Date();
            let timeKey = date.getHours() + ":" + (date.getMinutes() < 10 ? '0' : '') + date.getMinutes();
            if (this.meanAttention.has(timeKey)) {
                this.meanAttention.set(timeKey, this.meanAttention.get(timeKey).add(event));
            }
            else {
                this.meanAttention.set(timeKey, new MeanAttention().add(event));
            }
        }
        console.log(this);
        console.log(JSON.parse(JSON.stringify(this)));
    }
}
class MeanAttention {
    constructor() {
        this.attentionLevelsSum = 0;
        this.attentionLevelsEventSum = 0;
    }
    add(event) {
        let attentionInPercentage = parseInt((event.eventValue * 100).toFixed(0));
        this.attentionLevelsSum += attentionInPercentage;
        this.attentionLevelsEventSum += 1;
        this.meanAttendeesAttention = Math.round(this.attentionLevelsSum / this.attentionLevelsEventSum);
        return this;
    }
}
class MeanEngagement {
    constructor() {
        this.arousalEventsNumber = 0;
        this.arousalValuesSum = 0;
        this.meanEngagementValue = 0;
    }
    add(event) {
        event.eventValue *= 3;
        this.arousalEventsNumber += 1;
        this.arousalValuesSum += event.eventValue;
        this.meanEngagementValue = Math.round(this.arousalValuesSum * 100 / this.arousalEventsNumber);
        if (this.meanEngagementValue > 100) {
            this.meanEngagementValue = 100;
        }
        if (this.meanEngagementValue <= 25) {
            this.status = 'danger';
        }
        else if (this.meanEngagementValue <= 50) {
            this.status = 'warning';
        }
        else if (this.meanEngagementValue <= 75) {
            this.status = 'info';
        }
        else {
            this.status = 'success';
        }
    }
}
class MeanPositivity {
    constructor() {
        this.valenceEventsNumber = 0;
        this.valenceValuesSum = 0;
        this.meanPositivityValue = 0;
    }
    add(event) {
        event.eventValue *= 3;
        this.valenceEventsNumber += 1;
        this.valenceValuesSum += event.eventValue;
        this.meanPositivityValue = Math.round(this.valenceValuesSum * 100 / this.valenceEventsNumber);
        if (this.meanPositivityValue > 100) {
            this.meanPositivityValue = 100;
        }
        if (this.meanPositivityValue <= 25) {
            this.status = 'danger';
        }
        else if (this.meanPositivityValue <= 50) {
            this.status = 'warning';
        }
        else if (this.meanPositivityValue <= 75) {
            this.status = 'info';
        }
        else {
            this.status = 'success';
        }
    }
}


/***/ }),

/***/ "ZAI4":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _angular_common_http__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common/http */ "tk/3");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./app.component */ "Sy1n");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "tyNb");







class AppModule {
}
AppModule.ɵmod = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineNgModule"]({ type: AppModule, bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]] });
AppModule.ɵinj = _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵdefineInjector"]({ factory: function AppModule_Factory(t) { return new (t || AppModule)(); }, providers: [], imports: [[
            _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
            _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
            _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterModule"].forRoot([{
                    path: '',
                    component: _app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]
                },
            ]),
        ]] });
(function () { (typeof ngJitMode === "undefined" || ngJitMode) && _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵɵsetNgModuleScope"](AppModule, { declarations: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]], imports: [_angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
        _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"], _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterModule"]] }); })();
/*@__PURE__*/ (function () { _angular_core__WEBPACK_IMPORTED_MODULE_1__["ɵsetClassMetadata"](AppModule, [{
        type: _angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"],
        args: [{
                declarations: [
                    _app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]
                ],
                imports: [
                    _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                    _angular_common_http__WEBPACK_IMPORTED_MODULE_2__["HttpClientModule"],
                    _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterModule"].forRoot([{
                            path: '',
                            component: _app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]
                        },
                    ]),
                ],
                providers: [],
                bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_3__["AppComponent"]]
            }]
    }], null, null); })();


/***/ }),

/***/ "zUnb":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "fXoL");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./environments/environment */ "AytR");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "ZAI4");
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/platform-browser */ "jhN1");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_1__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
_angular_platform_browser__WEBPACK_IMPORTED_MODULE_3__["platformBrowser"]().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(err => console.error(err));


/***/ }),

/***/ "zn8P":
/*!******************************************************!*\
  !*** ./$$_lazy_route_resource lazy namespace object ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "zn8P";

/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map