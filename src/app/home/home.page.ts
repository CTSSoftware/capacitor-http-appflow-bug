import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, NgZone } from '@angular/core';
import { LoggingService, LogLevel } from 'src/services/logging.service';
import { Deploy } from 'cordova-plugin-ionic/dist/ngx';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy, AfterViewInit {
  @ViewChild('myDiv') myDiv!: ElementRef;
  private isInitialized = false;

  constructor(
    private loggingService: LoggingService,
    private zone: NgZone,
    private deploy: Deploy) {}

  ngAfterViewInit(): void {
    if (!this.isInitialized) {
      this.isInitialized = true;
      const me = this;
      this.loggingService.setLogHandler((logLevel: LogLevel, data: any[]) => me.logHandler(logLevel, data));
      console.log('log override initialized!');
    }
  }

  ngOnDestroy(): void {
    this.loggingService.setLogHandler(null);
    this.isInitialized = false;
  }

  async test(): Promise<any> {
    const appId='40131b15';
    const channel='Dev';

    if (Capacitor.isNativePlatform()) {
      // step 1 - configure
      try {
        console.log(`########## Configuring ${appId} on channel ${channel}`);
        debugger;
        await this.deploy.configure({
          appId: appId,
          channel: channel
        });
        console.log('########## Configuration SET');
      } catch (err) { console.error(err); }

      // step 2 - fetch configuration to verify
      try {
        console.log('########## Fetching Configuration from server');
        const config = await this.deploy.getConfiguration();
        console.log('########## Configuration Fetched', config);
      } catch (err) { console.error(err); }

      // step 3 - fetch configuration to verify
      try {
        console.log('########## Getting all available versions from the server');
        const versions = await this.deploy.getAvailableVersions();
        console.log('########## Available Versions Fetched', versions);
      } catch (err) { console.error(err); }

      // step 4 - fetch configuration to verify
      try {
        console.log('########## Checking for updates');
        const updateCheckResponse = await this.deploy.checkForUpdate();
        console.log('########## Are there updates?', updateCheckResponse);
      } catch (err) { console.error(err); }
    } else {

      console.log('########## Cannot use cordova on web platform');
    }
  }

  private logHandler(logLevel: LogLevel, data: any[]) {
    this.zone.runGuarded(() => {
      try {
        if (data && data.length > 0 && this.myDiv) {
          const div = (this.myDiv.nativeElement as HTMLDivElement);
          div.innerText += data[0].toString() + '\n';
          div.scrollTo({behavior: 'smooth', top: div.clientHeight+20})
        }
      } catch (err) {}
    });
  }
}
