import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  VERSION
} from '@angular/core';
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  switchMap,
  tap
} from 'rxjs/operators';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  name = 'Angular ' + VERSION.major;

  // errSubj = new BehaviorSubject<ValidationErrors | null>(null);
  errSubj = new Subject<ValidationErrors | null>();
  err$ = this.errSubj.asObservable().pipe(first());

  get errMsg() {
    return this.imgFormControl.hasError('required')
      ? 'plz enter img url'
      : this.imgFormControl.hasError('imageDoesNotExist')
      ? 'image does not exit'
      : '';
  }

  //. https://www.w3schools.com/tags/img_girl.jpg

  constructor(private _cdref: ChangeDetectorRef) {}

  vld1 = (control: AbstractControl): Observable<ValidationErrors | null> => {
    let val = control.value;

    // control.statusChanges.subscribe(status => console.log({status}))

    return control.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(700),
      switchMap(() => {
        const stream = new Observable<ValidationErrors | null>(emitter => {
          const img = new Image();

          img.onload = () => {
            emitter.next(null);
            this._cdref.detectChanges();
          };

          img.onerror = () => {
            emitter.next({
              imageDoesNotExist: val
            });
            this._cdref.detectChanges();
          };

          img.src = val;
        });

        return stream;
      }),
      first()
    );
  };

  vld2 = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const val = control.value;
    const img = new Image();
    // control.statusChanges.subscribe(stats2 => console.log({ stats2 }));
    img.onload = () => {
      this.errSubj.next(null);
      this._cdref.detectChanges();
    };
    img.onerror = () => {
      this.errSubj.next({
        imageDoesNotExist: val
      });
      this._cdref.detectChanges();
    };
    img.src = val;

    // return this.errSubj.asObservable().pipe(
    //   first(),
    //   tap(err2 => console.log({ err2 }))
    // );

    return this.err$.pipe(tap(err2 => console.log({ err2 })));
  };

  imgFormControl = new FormControl('', Validators.required, this.vld2);
}
