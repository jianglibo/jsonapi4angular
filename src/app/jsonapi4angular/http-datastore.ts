import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import {
  DataStore,
  DatastoreUtil,
  AttributesBase,
  JsonapiObject,
  JsonapiObjectType,
  PageOffsetLimit,
  PageNumberSize,
  PageCursor,
  SortPhrase,
  FilterPhrase,
  ListBody,
  isModelInstance,
  SingleBody
} from 'data-shape';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface JsonApiError {
  code: string;
  title: string;
  detail: string;
}

export class HttpDatastore implements DataStore {
  constructor(
    private http: HttpClient,
    private baseUrl: string,
    private defaultPager: { offset: 0; limit: 10 }
  ) {}

  findAll<E extends AttributesBase, T extends JsonapiObject<E>>(
    jsonapiObjectType: JsonapiObjectType<E, T>,
    page?: PageCursor | PageNumberSize | PageOffsetLimit,
    sort?: SortPhrase[] | SortPhrase,
    filter?: FilterPhrase[] | FilterPhrase,
    params?: any
  ): Observable<ListBody<E, T>> {
    if (page == null) {
      page = this.defaultPager;
    }
    const url = DatastoreUtil.getListUrl(
      jsonapiObjectType,
      this.baseUrl,
      page,
      sort,
      filter
    );
    console.log(url);
    return this.http
      .get<ListBody<E, T>>(url, { observe: 'response' })
      .map(resp => {
        const r = resp.body;
        return r;
      })
      .catch((err: HttpErrorResponse) => {
        // err.
        if (
          err.error &&
          err.error.errors &&
          err.error.errors instanceof Array
        ) {
          return Observable.throw(err.error.errors as JsonApiError[]);
        }
        return Observable.throw(err);
      });
  }

  findRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    jsonapiObjectType: JsonapiObjectType<E, T>,
    id: number | string,
    params?: any
  ): Observable<SingleBody<E, T>> {
    const url = DatastoreUtil.getSingleUrl(jsonapiObjectType, id, this.baseUrl);
    console.log(url);
    return this.http
      .get<SingleBody<E, T>>(url, { observe: 'response' })
      .map(resp => {
        const r = resp.body;
        return r;
      })
      .catch((err: HttpErrorResponse) => {
        if (
          err.error &&
          err.error.errors &&
          err.error.errors instanceof Array
        ) {
          return Observable.throw(err.error.errors as JsonApiError[]);
        }
        return Observable.throw(err);
      });
  }

  createRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    jsonapiObjectType: JsonapiObjectType<E, T>,
    data: T
  ): Observable<SingleBody<E, T>> {
    const url = DatastoreUtil.getListUrl(jsonapiObjectType, this.baseUrl);
    return this.http
      .post<SingleBody<E, T>>(url, new SingleBody<E, T>(data), {
        observe: 'response'
      })
      .map(resp => {
        const r = resp.body;
        return r;
      })
      .catch((err: HttpErrorResponse) => {
        if (
          err.error &&
          err.error.errors &&
          err.error.errors instanceof Array
        ) {
          return Observable.throw(err.error.errors as JsonApiError[]);
        }
        return Observable.throw(err);
      });
  }

  saveRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    model: T,
    params?: any
  ): Observable<SingleBody<E, T>> {
    const jsonapiObjectType: JsonapiObjectType<E, T> = <JsonapiObjectType<
      E,
      T
    >>model.constructor;
    const url = DatastoreUtil.getSingleUrl(
      jsonapiObjectType,
      model.id,
      this.baseUrl
    );
    return this.http
      .patch<SingleBody<E, T>>(url, new SingleBody<E, T>(model), {
        observe: 'response'
      })
      .map(resp => {
        const r = resp.body;
        return r;
      })
      .catch((err: HttpErrorResponse) => {
        if (
          err.error &&
          err.error.errors &&
          err.error.errors instanceof Array
        ) {
          return Observable.throw(err.error.errors as JsonApiError[]);
        }
        return Observable.throw(err);
      });
  }
  /*
  202 Accepted
  If a deletion request has been accepted for processing, but the processing has not been completed by the time the server responds,
  the server MUST return a 202 Accepted status code.
  204 No Content
  A server MUST return a 204 No Content status code if a deletion request is successful and no content is returned.
  200 OK
  A server MUST return a 200 OK status code if a deletion request is successful and the server responds with only top-level meta data.
  404 NOT FOUND
  A server SHOULD return a 404 Not Found status code if a deletion request fails due to the resource not existing.
  */
  deleteRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    model: T
  ): Observable<Response>;
  deleteRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    jsonapiObjectType: JsonapiObjectType<E, T>,
    id: string
  ): Observable<Response>;

  deleteRecord<E extends AttributesBase, T extends JsonapiObject<E>>(
    jsonapiObjectType: JsonapiObjectType<E, T> | T,
    id?: string | number
  ): Observable<Response> {
    let url: string;
    if (isModelInstance(jsonapiObjectType)) {
      url = DatastoreUtil.getSingleUrl(jsonapiObjectType, this.baseUrl);
    } else {
      url = DatastoreUtil.getSingleUrl(jsonapiObjectType, id, this.baseUrl);
    }
    return this.http
      .delete<SingleBody<E, T>>(url, { observe: 'response' })
      .map(resp => {
        switch (resp.status) {
          case 200:
            return resp.body;
          default:
            return null;
        }
      })
      .catch((err: HttpErrorResponse) => {
        if (
          err.error &&
          err.error.errors &&
          err.error.errors instanceof Array
        ) {
          return Observable.throw(err.error.errors as JsonApiError[]);
        }
        return Observable.throw(err);
      });
  }
}
