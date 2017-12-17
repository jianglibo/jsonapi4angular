import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpDatastore } from '../jsonapi4angular/http-datastore';

@Injectable()
export class HttpDatastoreService extends HttpDatastore {

  constructor(http: HttpClient) {
    super(http, '/jsonapi', undefined);
  }

}
