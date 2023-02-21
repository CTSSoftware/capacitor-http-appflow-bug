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
  @ViewChild('logDiv') logDiv!: ElementRef;
  @ViewChild('errorDiv') errorDiv!: ElementRef;
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
    const appId='c836b4a7';
    const channel='Buggy';

    if (Capacitor.isNativePlatform()) {
      // step 1 - configure
      try {
        console.log(`########## Configuring ${appId} on channel ${channel}`);
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
        console.log('########## Configuration Fetched...', config);
      } catch (err) { console.error(err); }

      // step 4 - fetch configuration to verify (THIS IS WHERE THE ERROR IS)
      try {
        console.log('########## Checking for updates');
        const updateCheckResponse = await this.deploy.checkForUpdate();
        console.log('########## Are there updates?', updateCheckResponse);
      } catch (err) { console.error('ERROR RUNNING CHECK RESPONSE', err); }
    } else {
      console.log('########## Cannot use cordova on web platform');
    }
  }

  private logHandler(logLevel: LogLevel, data: any[]) {
    this.zone.runGuarded(() => {
      try {
        if (data && data.length > 0 && this.errorDiv && this.logDiv) {
          const div = ((logLevel !== LogLevel.Fatal ? this.logDiv : this.errorDiv).nativeElement as HTMLDivElement);
          data.forEach(item => {
            try {
              let itemStr = typeof(item) === 'string' ? item : JSON.stringify(item, null, 2);
              if (itemStr === '{}') {
                itemStr = item.toString();
              }
              div.innerText += itemStr.toString() + `\n`;
            } catch (err) {}
          });
          div.scrollTo({behavior: 'smooth', top: div.clientHeight+20})
        }
      } catch (err) {}
    });
  }
}
