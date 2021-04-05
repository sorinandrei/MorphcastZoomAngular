import { Component, OnInit, Inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { DOCUMENT } from '@angular/common';

import { ZoomMtg } from '@zoomus/websdk';
import { ActivatedRoute } from '@angular/router';

import { interval, Observable } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { Subject, fromEvent  } from 'rxjs';
import { throttle } from 'rxjs/operators';


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
  passWord = ''

  public participant:Participant = new Participant();

  constructor(
    public httpClient: HttpClient, 
    @Inject(DOCUMENT) document,
    private route: ActivatedRoute
  ) {
    
  }

  ngOnInit() {
    this.loadMorphcast();

    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.participant.name = params['name'];
      let meetingId = params['meetingId'];

      if(meetingId && meetingId > 0){

        if(!this.participant.name){
          this.participant.name = "Guest_" + this.getRandomID();
        }
        this.participant.email = this.participant.name+'@gmail.com'

        this.registerEventListener(meetingId, this.participant.name);
        this.getSignature();
        this.startSDK();

        setInterval(() => {
          this.sendParticipantToServer(this.participant, meetingId).subscribe( res => {}, err =>  console.log(err) );
          //this.getMeetingState(meetingId).subscribe( res => {console.log(res)}, err =>  console.log(err) );
        }, 10000);
      }
      this.meetingNumber = meetingId
    });
    
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
    document.getElementById('startSDK').style.zIndex = "9";
    document.getElementById('startSDK').style.position = "absolute";
    document.getElementById('startSDK').style.right = "0px";
    document.getElementById('startSDK').style.top = "0px";
    document.getElementById('stopSDK').style.zIndex = "9";
    document.getElementById('stopSDK').style.position = "absolute";
    document.getElementById('stopSDK').style.right = "0px";
    

    ZoomMtg.init({
      leaveUrl: this.leaveUrl,
      isSupportAV: true,
      success: (success) => {
        console.log(success)

        ZoomMtg.join({
          signature: signature,
          meetingNumber: this.meetingNumber,
          userName: this.participant.name,
          apiKey: this.apiKey,
          userEmail: this.participant.email,
          passWord: "1234",
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
    this.loader.powerSave(2);
    this.loader.maxInputFrameSize(320);
    this.loader.load().then(({ start, stop, terminate  }) => {
      this.startSDK = start;
      this.stopSDK = stop;
      this.terminateSDK = terminate;
    });
  }

  registerEventListener(meetingNumber:string, userName:string){
    
    fromEvent(window, CY.modules().FACE_DETECTOR.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.totalFaces);
      // this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      this.participant.parseEvent(data)
    });

    fromEvent(window, CY.modules().FACE_AGE.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      console.log(evt)
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.numericAge);
      //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      this.participant.parseEvent(data)
    });

    fromEvent(window, CY.modules().FACE_EMOTION.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.dominantEmotion);
      //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      this.participant.parseEvent(data)
    });

    fromEvent(window, CY.modules().FACE_ATTENTION.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.attention);
      //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      this.participant.parseEvent(data)
    });

    fromEvent(window, CY.modules().FACE_AROUSAL_VALENCE.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      if(evt.detail.output.arousalvalence.arousal > 0){
        let data:EventData = new EventData(userName, meetingNumber, "face_arousal", evt.detail.output.arousalvalence.arousal);
        //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
        this.participant.parseEvent(data)
      }

      if(evt.detail.output.arousalvalence.valence > 0){
        let data:EventData = new EventData(userName, meetingNumber, "face_valence", evt.detail.output.arousalvalence.valence);
        //this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
        this.participant.parseEvent(data)
      }
    });

  }

  

  private sendEventToServer(data:EventData):Observable<any>{
    return new Observable( observer => {
      this.request(
        RequestMethod.POST, 
        Endpoints.ADD_EVENT_ENDPOINT,
        <RequestOptions>{
          body: JSON.stringify(data)
        }
      ).subscribe(
				(result: String) => observer.next(result),
				(error: any) =>  observer.error(error)
      );
    });
  }

  private getMeetingState(meetingId){
    return new Observable( observer => {
      this.request(
        RequestMethod.GET, 
        Endpoints.GET_MEETING + '/' + meetingId,
        <RequestOptions>{}
      ).subscribe(
				result => observer.next(result),
				(error: any) =>  observer.error(error)
      );
    });
  }

  private sendParticipantToServer(participant:Participant, meetingId:number){
    return new Observable( observer => {
      this.request(
        RequestMethod.POST, 
        Endpoints.ADD_PARTICIPANT_ENDPOINT + '/' + meetingId,
        <RequestOptions>{
          body: JSON.stringify(participant)
        }
      ).subscribe(
				(result: String) => observer.next(result),
				(error: any) =>  observer.error(error)
      );
    });
  }

  private request(method: string, endpoint: string, options: RequestOptions): Observable<any> {
    return this.httpClient.request(method, endpoint, options);
  }


}

class EventData {
  id: string;
  user: string;
  meetingId: string;
  eventType: string;
  eventValue: any;

  constructor(user:string, meetingId:string, eventType:string, eventValue:any  ){
    this.id = uuidv4();
    this.user = user;
    this.meetingId = meetingId;
    this.eventType = eventType;
    this.eventValue = eventValue;
  }
}

enum Endpoints {
	ADD_EVENT_ENDPOINT = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod/event",
  ADD_PARTICIPANT_ENDPOINT = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod/participant",
  GET_MEETING = "https://8ogkak0sti.execute-api.eu-central-1.amazonaws.com/Prod"
}

class RequestOptions {
	body?: any;
	headers?: HttpHeaders | {
		[header: string]: string | string[];
	};
	observe?: 'body';
	params?: HttpParams | {
		[param: string]: string | string[];
	};
	reportProgress?: boolean;
	responseType?: 'text';
	withCredentials?: boolean;

}

enum RequestMethod {
	GET = "get",
	POST = "post",
	PUT = "put",
	DELETE = "delete",
	PATCH = "patch"
}


export class Participant {
  name:string;

  email: string;
  totalFaces: number;
  emotion: string;
  faceLikelyAge: number = 0;
  attentionPercentage : number;
  
  meanPositivity: MeanPositivity = new MeanPositivity();
  meanEngagement: MeanEngagement = new MeanEngagement();

  meanAttention: Map<string, MeanAttention> =  new Map();
  
  public parseEvent(event: EventData){
    if(event.eventType === "face_detector"){
      this.totalFaces = event.eventValue;
    }

    if(event.eventType === "face_emotion"){
      this.emotion = event.eventValue;
    }

    if(event.eventType === "face_age"){
      if(this.faceLikelyAge == 0 && this.attentionPercentage > 85){
        this.faceLikelyAge = event.eventValue;
      }
    }

    if(event.eventType === "face_valence"){
      this.meanPositivity.add(event);
    }

    if(event.eventType === "face_arousal"){
      this.meanEngagement.add(event);
    }

    if(event.eventType === "face_attention" ){
      this.attentionPercentage  = parseInt((event.eventValue * 100).toFixed(0));
      let date = new Date()
      let timeKey = date.getHours() + ":" + (date.getMinutes()<10?'0':'') + date.getMinutes();
      if (this.meanAttention.has(timeKey)) {
        this.meanAttention.set(timeKey, this.meanAttention.get(timeKey).add(event));
      } else {
        this.meanAttention.set(timeKey, new MeanAttention().add(event));
      }
    }
    console.log(this)
    console.log(JSON.parse(JSON.stringify(this)))
  }
}

export class MeanAttention {
  meanAttendeesAttention: number;
  attentionLevelsSum: number = 0;
  attentionLevelsEventSum: number = 0;

  add(event: EventData){
    let attentionInPercentage:number = parseInt((event.eventValue * 100).toFixed(0));

    this.attentionLevelsSum += attentionInPercentage;
    this.attentionLevelsEventSum += 1;
    this.meanAttendeesAttention = Math.round(this.attentionLevelsSum / this.attentionLevelsEventSum);
    return this;
  }
}

export class MeanEngagement {
  arousalEventsNumber: number = 0;
  arousalValuesSum: number = 0;
  meanEngagementValue: number = 0;
  status: string;

  add(event: EventData){
   event.eventValue *= 3;
   this.arousalEventsNumber += 1;
   this.arousalValuesSum += event.eventValue;
   this.meanEngagementValue =  Math.round(this.arousalValuesSum * 100 / this.arousalEventsNumber);
   if(this.meanEngagementValue > 100) {
    this.meanEngagementValue = 100;
   }

   if (this.meanEngagementValue <= 25) {
      this.status = 'danger';
    } else if (this.meanEngagementValue <= 50) {
      this.status = 'warning';
    } else if (this.meanEngagementValue <= 75) {
      this.status = 'info';
    } else {
      this.status = 'success';
    }

  }
}

export class MeanPositivity {
  valenceEventsNumber: number = 0;
  valenceValuesSum: number = 0;
  meanPositivityValue: number = 0;
  status: string;

  add(event: EventData){
   event.eventValue *= 3;
   this.valenceEventsNumber += 1;
   this.valenceValuesSum += event.eventValue;
   this.meanPositivityValue =  Math.round(this.valenceValuesSum * 100 / this.valenceEventsNumber);
   if(this.meanPositivityValue > 100) {
    this.meanPositivityValue = 100;
   }

   if (this.meanPositivityValue <= 25) {
      this.status = 'danger';
    } else if (this.meanPositivityValue <= 50) {
      this.status = 'warning';
    } else if (this.meanPositivityValue <= 75) {
      this.status = 'info';
    } else {
      this.status = 'success';
    }

  }
}