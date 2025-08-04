import {
  Component,
  HostListener,
  LOCALE_ID,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  standalone: true,
  imports: [RouterModule],
  providers: [{ provide: LOCALE_ID, useValue: 'es' }],
})
export class App implements OnInit, OnDestroy {
  protected title = 'UbikkApp-frontend';
  footerMarginLeft = '0px';

  windowWidth = 0;
  private routerSub!: Subscription;
  private intervalSub!: Subscription;

  private isBrowser: boolean =
    typeof window !== 'undefined' && typeof window.document !== 'undefined';

  constructor(private router: Router) {}

  ngOnInit() {
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
    }

    this.routerSub = this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd
        )
      )
      .subscribe((event) => {
        this.updateFooterMargin(event.urlAfterRedirects);
      });

    // Esto fuerza actualizar el footer cada 1s, para detectar cambios de token
    this.intervalSub = interval(1000).subscribe(() => {
      this.updateFooterMargin(this.router.url);
    });

    this.updateFooterMargin(this.router.url);
  }

  @HostListener('window:resize', [])
  onResize() {
    if (this.isBrowser) {
      this.windowWidth = window.innerWidth;
      this.updateFooterMargin(this.router.url);
    }
  }

  ngOnDestroy() {
    this.routerSub?.unsubscribe();
    this.intervalSub?.unsubscribe();
  }

  private updateFooterMargin(currentUrl: string) {
    const hasToken =
      this.isBrowser &&
      typeof localStorage !== 'undefined' &&
      !!localStorage.getItem('token');

    const isDesktop = this.windowWidth >= 768;
    const isHome = currentUrl === '/' || currentUrl === '/home';

    this.footerMarginLeft =
      isDesktop && (hasToken || !isHome) ? '220px' : '0px';
    console.log(
      `Footer margin updated: ${this.footerMarginLeft} for URL: ${currentUrl}`
    );
  }
}
