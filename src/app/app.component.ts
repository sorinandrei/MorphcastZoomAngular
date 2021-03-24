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
  userName = 'Angular'
  userEmail = ''
  passWord = ''

  constructor(
    public httpClient: HttpClient, 
    @Inject(DOCUMENT) document,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      console.log(params)
      this.passWord = params['password'];
      let meetingId = params['meetingId'];
      if(meetingId && meetingId > 0){
        this.registerEventListener(meetingId, "Guest_" + this.getRandomID())
      }
      this.meetingNumber = meetingId
    });
  }

  ngOnInit() {
    this.loadMorphcast();
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

  registerEventListener(meetingNumber:string, userName:string){
    
    fromEvent(window, CY.modules().FACE_DETECTOR.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.totalFaces);
      this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
    });

    fromEvent(window, CY.modules().FACE_AGE.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.numericAge);
      this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
    });

    fromEvent(window, CY.modules().FACE_EMOTION.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.dominantEmotion);
      this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
    });

    fromEvent(window, CY.modules().FACE_ATTENTION.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.attention);
      this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
    });

    fromEvent(window, CY.modules().FACE_AROUSAL_VALENCE.eventName).pipe(throttle(ev => interval(1000))).subscribe( (evt: any) => {
      if(evt.detail.output.arousalvalence.arousal > 0){
        let data:EventData = new EventData(userName, meetingNumber, "face_arousal", evt.detail.output.arousalvalence.arousal);
        this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      }

      if(evt.detail.output.arousalvalence.valence > 0){
        let data:EventData = new EventData(userName, meetingNumber, "face_valence", evt.detail.output.arousalvalence.valence);
        this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
      }
    });
    // let event = fromEvent(window, eventName);
    // let throttledEvent = event.pipe(throttle(ev => interval(1000)));
    // throttledEvent.subscribe( (evt: any) => {
    //   let data:EventData = new EventData(userName, meetingNumber, evt.detail.type, evt.detail.output.numericAge);
    //   this.sendEventToServer(data).subscribe( res => {}, err =>  console.log(err) );
    // })

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
