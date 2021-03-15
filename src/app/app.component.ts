import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { ZoomMtg } from '@zoomus/websdk';
import { ActivatedRoute } from '@angular/router';
ZoomMtg.setZoomJSLib('https://sorinandrei.github.io/ZoomAngularTest/node/@zoomus/websdk/dist/lib', '/av');
ZoomMtg.preLoadWasm();
ZoomMtg.prepareJssdk();
declare const CY:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  private loader = CY.loader();

  public stopSDK;
  public startSDK;
  public terminateSDK;

  private ws; 
  private oppenedConnection = false;
  public user: any;

  // setup your signature endpoint here: https://github.com/zoom/websdk-sample-signature-node.js
  signatureEndpoint = 'https://benchmark-signature.herokuapp.com'
  apiKey = 'rZmqWjExSze-48_tCZVwYw'
  meetingNumber = ''
  role = 0
  leaveUrl = 'https://sorinandrei.github.io/ZoomAngularTest'
  userName = 'Angular'
  userEmail = ''
  passWord = ''

  constructor(
    public httpClient: HttpClient, 
    @Inject(DOCUMENT) document,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      let meetingId = params['meetingId'];
      this.meetingNumber = meetingId
  });
  }

  ngOnInit() {
    this.loadMorphcast();
    this.connectToServerAndStartSendingDataGuest(this.meetingNumber, "Guest_" + this.getRandomID(),"Guest_" + this.getRandomID() +"@gmail.com")
  }

  private getRandomID(): string{
    return Math.random().toString(36).substr(2, 9);
  }
  
  getSignature() {
    this.httpClient.post(this.signatureEndpoint, {
	    meetingNumber: this.meetingNumber,
	    role: this.role
    }).toPromise().then((data: any) => {
      if(data.signature) {
        console.log(data.signature)
        this.startMeeting(data.signature)
      } else {
        console.log(data)
      }
    }).catch((error) => {
      console.log(error)
    })
  }

  startMeeting(signature) {

    document.getElementById('zmmtg-root').style.display = 'block'

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success)

        ZoomMtg.join({
          signature: signature,
          meetingNumber: this.meetingNumber,
          userName: this.userName,
          apiKey: this.apiKey,
          userEmail: this.userEmail,
          passWord: this.passWord,
          success: (success) => {
            console.log(success)
          },
          error: (error) => {
            console.log(error)
          }
        })

      },
      error: (error) => {
        console.log(error)
      }
    })
  }

  private loadMorphcast() {
    this.loader.licenseKey("39d24a4191518dde3e4fbed5ec690d6fc6a22dd3507d");
    this.loader.addModule(CY.modules().FACE_DETECTOR.name, { maxInputFrameSize: 320, multiFace: true });
    this.loader.addModule(CY.modules().FACE_ATTENTION.name, { smoothness: 0.99 });
    this.loader.addModule(CY.modules().FACE_EMOTION.name, { smoothness: 0.99, enableBalancer: false });
    this.loader.addModule(CY.modules().FACE_AROUSAL_VALENCE.name, {smoothness: 0.8});
    this.loader.addModule(CY.modules().FACE_AGE.name);
    this.loader.powerSave(1);
    this.loader.maxInputFrameSize(320);
    this.loader.load().then(({ start, stop, terminate  }) => {
      this.startSDK = start;
      this.stopSDK = stop;
      this.terminateSDK = terminate;
    });
  }

  connectToServerAndStartSendingDataGuest(meetingNumber:string, name:string, email:string) {

      this.user = {};
      this.user.name = name;
      this.user.user_id = email;

      this.ws = new WebSocket('wss://guarded-garden-95047.herokuapp.com');
  
      this.ws.onopen = () => {
        console.log('WebSocket Client Connected');

        const data = {
          user_id: this.user.user_id,
          meetingNumber: meetingNumber
        }
        
        this.ws.send(JSON.stringify(data))
        this.oppenedConnection = true;
      };

      this.ws.onclose = () => {
        this.oppenedConnection = false;
      }
      
      this.ws.onmessage = function(message) {
        console.log(message)
        console.log(message.data)
        console.log(JSON.parse(message.data));
      };
  
      window.addEventListener(CY.modules().FACE_DETECTOR.eventName, (evt) => {
        console.log('Face detector result', evt.detail);
        const data = {
          user: this.user.name,
          eventType : evt.detail.type,
          eventValue : evt.detail.totalFaces
        }
        if(this.oppenedConnection){
          this.ws.send(JSON.stringify(data))
        }
        
      });
  
      window.addEventListener(CY.modules().FACE_AGE.eventName, (evt) => {
        console.log('Age result', evt.detail);

        let data:EventData = new EventData();
        data.user = this.user.name;
        data.eventType = evt.detail.type
        data.eventValue = evt.detail.output.numericAge;

        if(this.oppenedConnection){
          this.ws.send(JSON.stringify(data))
        }
      });
  
      window.addEventListener(CY.modules().FACE_EMOTION.eventName, (evt) => {
        console.log('Emotion result', evt.detail);
        let data:EventData = new EventData();
        data.user = this.user.name;
        data.eventType = evt.detail.type
        data.eventValue = evt.detail.output.dominantEmotion;

        if(this.oppenedConnection){
          this.ws.send(JSON.stringify(data))
        }
      });
  
      window.addEventListener(CY.modules().FACE_ATTENTION.eventName, (evt) => {
        console.log('Face attention result', evt.detail);

        let data:EventData = new EventData();
        data.user = this.user.name;
        data.eventType = evt.detail.type
        data.eventValue = evt.detail.output.attention;

        if(this.oppenedConnection){
          this.ws.send(JSON.stringify(data))
        }
      });

      window.addEventListener(CY.modules().FACE_AROUSAL_VALENCE.eventName, (evt) => {
        console.log('Face arousal valence result', evt.detail , evt.detail.output.arousalvalence.arousal > 0);
        if(evt.detail.output.arousalvalence.arousal > 0){
          let data:EventData = new EventData();
          data.user = this.user.name;
          data.eventType = "face_arousal"
          data.eventValue = evt.detail.output.arousalvalence.arousal;

          if(this.oppenedConnection){
            this.ws.send(JSON.stringify(data))
          }
        }

        if(evt.detail.output.arousalvalence.valence > 0){
          let data:EventData = new EventData();
          data.user = this.user.name;
          data.eventType = "face_valence"
          data.eventValue = evt.detail.output.arousalvalence.valence;

          if(this.oppenedConnection){
            this.ws.send(JSON.stringify(data))
          }
        }
      });

    }
}

class EventData {
  user: string;
  eventType: string;
  eventValue: any;
}