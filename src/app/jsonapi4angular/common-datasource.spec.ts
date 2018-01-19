import { TestBed, inject, fakeAsync, tick } from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/reduce';
import 'rxjs/add/observable/of';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { JsonApiError } from '../jsonapi4angular/http-datastore';
import { extend } from 'webdriver-js-extender';
import { CommonDataSource } from './common-datasource';

import {
  LoginAttempt,
  LOGIN_FAIL_BODY,
  User,
  USERS_BODY,
  USER_BODY,
  LOGIN_SUCCESS_BODY
} from 'data-shape-ng';
import { ManufacturerAttributes } from 'data-shape-ng/go2wheel/dto/manufacturer-attributes';
import { Manufacturer } from 'data-shape-ng/go2wheel/dto/manufacturer';


class MyDatasource extends CommonDataSource<ManufacturerAttributes, Manufacturer> {
    constructor() {
      super(null, Manufacturer);
    }
}

fdescribe('common datasource should work.', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpClient]
    });
  });

  it(
    'should handle adding different value filter phrase',
    fakeAsync(
      () => {
        const mds = new MyDatasource();
        const obms = mds.connect();

        mds.addFilter({fname: 'a', value: 'b'});
        let count = 0;
        mds._filterChange.subscribe(fps => {
          count++;
        });
        mds.addFilter({fname: 'a', value: 'b1'});
        mds.addFilter({fname: 'a', value: 'b2'});

        tick();
        expect(count).toBe(3);
      })
  );

  it(
    'should handle adding same value filter phrase',
    fakeAsync(
      () => {
        const mds = new MyDatasource();
        const obms = mds.connect();

        mds.addFilter({fname: 'a', value: 'b'});
        let count = 0;
        mds._filterChange.subscribe(fps => {
          count++;
        });
        mds.addFilter({fname: 'a', value: 'b'});
        mds.addFilter({fname: 'a', value: 'b'});

        tick();
        expect(count).toBe(1);
      })
  );

  it(
    'should handle adding total different value filter phrase',
    fakeAsync(
      () => {
        const mds = new MyDatasource();
        const obms = mds.connect();

        mds.addFilter({fname: 'a', value: 'b'});
        let count = 0;
        mds._filterChange.subscribe(fps => {
          count++;
        });
        mds.addFilter({fname: 'c', value: 'b'});
        mds.addFilter({fname: 'd', value: 'b'});

        tick();
        expect(count).toBe(3);
      })
  );


});
