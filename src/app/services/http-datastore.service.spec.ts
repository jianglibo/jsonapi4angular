import { TestBed, inject } from '@angular/core/testing';

import { HttpDatastoreService } from './http-datastore.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/operator/reduce';
import 'rxjs/add/observable/of';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { JsonApiError } from '../jsonapi4angular/http-datastore';

import {
  LoginAttempt,
  LOGIN_FAIL_BODY,
  User,
  USERS_BODY,
  USER_BODY,
  LOGIN_SUCCESS_BODY
} from 'data-shape-ng';

describe('HttpDatastoreService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [HttpClient, HttpDatastoreService]
    });
  });

  it('rxjs of.', () => {
    Observable.of(1, 2, 3)
      .reduce((x, y) => x + y)
      .subscribe(v => expect(v).toBe(6));
    Observable.of('a', 'b', 'c')
      .reduce((x, y) => x + y)
      .subscribe(v => expect(v).toBe('abc'));
    function c() {}
    const o = { c: c };
    expect('c' in o).toBeTruthy();
  });

  it(
    'should handle 4xx response',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        expect(service).toBeTruthy();

        service.findAll(LoginAttempt).subscribe(
          data => expect(data).toBeTruthy,
          (err: JsonApiError[]) => {
            expect(err.length).toBe(1);
            expect(err[0].code).toBe(LOGIN_FAIL_BODY.errors[0].code);
          }
        );
        // const req = httpMock.expectOne('/jsonapi/loginAttempts?page[offset]=0&page[limit]=10');
        const req = httpMock.expectOne('/jsonapi/loginAttempts');
        req.flush(LOGIN_FAIL_BODY, { status: 400, statusText: 'xxx' });
        httpMock.verify();
      }
    )
  );

  it(
    'should handle list response',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        service.findAll(User).subscribe(lr => {
          expect(lr.data.length).toBe(4);
          expect(lr.data[0].id).toBe('1277956');
          expect(lr.data[0].type).toBe('users');
          expect(lr.data[0].attributes.createdAt).toBe(1499931915901);
          expect(lr.data[0].attributes.name).toBe('user0');
          expect(lr.data[0].attributes.gender).toBe('FEMALE');
          expect(lr.data[0].relationships.followers.links.related).toBe(
            'http://localhost/jsonapi/users/1277956/followers'
          );
        });
        // const req = httpMock.expectOne('/jsonapi/users?page[offset]=0&page[limit]=10');
        const req = httpMock.expectOne('/jsonapi/users');
        req.flush(USERS_BODY, { status: 200, statusText: 'OK' });
        httpMock.verify();
      }
    )
  );
  it(
    'should handle single response',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        const did = '1277974';
        service.findRecord(User, did).subscribe(sr => {
          expect(sr.data.id).toBe(did);
          expect(sr.data.type).toBe('users');
          expect(sr.data.attributes.createdAt).toBe(1499931924687);
          expect(sr.data.attributes.name).toBe('name1334');
          expect(sr.data.attributes.gender).toBe('FEMALE');
          expect(sr.data.relationships.followers.links.related).toBe(
            `http://localhost/jsonapi/users/${did}/followers`
          );
        });
        const req = httpMock.expectOne(`/jsonapi/users/${did}`);
        req.flush(USER_BODY, { status: 200, statusText: 'OK' });
        httpMock.verify();
      }
    )
  );

  it(
    'should handle update resource',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        const user = new User({ email: '' });
        user.id = '123456';
        service.saveRecord(user).subscribe(sr => {
          expect(sr.data.id).toBe('1277974');
          expect(sr.data.attributes.createdAt).toBe(1499931924687);
          expect(sr.data.attributes.name).toBe('name1334');
          expect(sr.data.attributes.gender).toBe('FEMALE');
          expect(sr.data.relationships.followers.links.related).toBe(
            'http://localhost/jsonapi/users/1277974/followers'
          );
        });
        const req = httpMock.expectOne('/jsonapi/users/123456');
        req.flush(USER_BODY, { status: 200, statusText: 'OK' });
        httpMock.verify();
      }
    )
  );
  it(
    'should handle delete resource',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        const user = new User({ email: '' });
        user.id = '123456';
        service.deleteRecord(user).subscribe(resp => {});
        const req = httpMock.expectOne(rq => {
          return rq.method === 'DELETE' && rq.url === '/jsonapi/users/123456';
        });
        req.flush(USER_BODY, { status: 200, statusText: 'OK' });
        httpMock.verify();
      }
    )
  );

  it(
    'should handle login success.',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        const la = new LoginAttempt({ username: '', password: '' });
        expect(la.type).toBe('loginAttempts');
        service.createRecord(LoginAttempt, la).subscribe(sr => {
          expect(sr.data.id).toBe('884765');
        });
        const req = httpMock.expectOne('/jsonapi/loginAttempts');
        req.flush(LOGIN_SUCCESS_BODY, { status: 200, statusText: 'OK' });
        expect(req.request.body['data']).toEqual(
          new LoginAttempt({ username: '', password: '' })
        );
        httpMock.verify();
      }
    )
  );

  it(
    'should handle login fail.',
    inject(
      [HttpDatastoreService, HttpTestingController],
      (service: HttpDatastoreService, httpMock: HttpTestingController) => {
        const la = new LoginAttempt({ username: '', password: '' });
        service.createRecord(LoginAttempt, la).subscribe(
          sr => {
            expect(sr.data.id).toBe('884765');
          },
          (err: JsonApiError[]) => {
            expect(err[0].code).toBe('E4001000');
          }
        );
        const req = httpMock.expectOne('/jsonapi/loginAttempts');
        req.flush(LOGIN_FAIL_BODY, {
          status: 400,
          statusText: 'Access Denied.'
        });
        expect(req.request.body['data']).toEqual(
          new LoginAttempt({ username: '', password: '' })
        );
        httpMock.verify();
      }
    )
  );
});
