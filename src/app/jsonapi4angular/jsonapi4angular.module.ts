import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpDatastore } from './http-datastore';
import { CommonDataSource } from './common-datasource';

@NgModule({
  imports: [CommonModule],
  declarations: [],
  exports: []
})
export class Jsonapi4angularModule {
  static forRoot() {
    return {
      ngModule: Jsonapi4angularModule,
      providers: []
    };
  }
}
