import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs/Observable';
import { MatSort, MatPaginator } from '@angular/material';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/merge';
import { element } from 'protractor';
import {
  AttributesBase,
  JsonapiObject,
  DataStore,
  JsonapiObjectType,
  PageCursor,
  PageOffsetLimit,
  PageNumberSize,
  SortPhrase,
  FilterPhrase,
  ListBody
} from 'data-shape-ng';

/**
 * Data source to provide what data should be rendered in the table. Note that the data source
 * can retrieve its data in any way. In this case, the data source is provided a reference
 * to a common data base, ExampleDatabase. It is not the data source's responsibility to manage
 * the underlying data. Instead, it only needs to take the data and send the table exactly what
 * should be rendered.
 */
export class CommonDataSource<
  A extends AttributesBase,
  J extends JsonapiObject<A>
> extends DataSource<J> {
  _filterChange = new BehaviorSubject<FilterPhrase[]>([]);

  pageIndexChange = new BehaviorSubject(0);

  get filter(): FilterPhrase[] {
    return this._filterChange.value;
  }
  set filter(filters: FilterPhrase[]) {
    this._filterChange.next(filters);
  }

  resultsLength = 0;
  isLoadingResults = false;
  _paginator: MatPaginator;
  _sort: MatSort;

  // filteredData: J[] = [];
  renderedData: J[] = [];

  constructor(
    protected _dataStore: DataStore,
    protected _type: JsonapiObjectType<A, J>
  ) {
    super();
    // Reset to the first page when the user changes the filter.
  }

  initDatasource(
    _paginator: MatPaginator,
    _sort: MatSort
  ): CommonDataSource<A, J> {
    this._paginator = _paginator;
    this._sort = _sort;
    this._filterChange.subscribe(() => (this._paginator.pageIndex = 0));
    return this;
  }

  /** Connect function called by the table to retrieve one stream containing the data to render. */
  connect(): Observable<J[]> {
    // Listen for any changes in the base data, sorting, filtering, or pagination
    const displayDataChanges: any[] = [this._filterChange];
    if (this._sort) {
      displayDataChanges.push(this._sort.sortChange);
    }
    if (this._paginator) {
      displayDataChanges.push(this._paginator.page);
    }

    return Observable.merge(...displayDataChanges)
      .startWith(null)
      .switchMap(() => {
        this.pageIndexChange.next(0);
        this.isLoadingResults = true;
        if (this._dataStore) {
          return this.findAll();
        } else {
          return Observable.of(new ListBody<A, J>());
        }
      })
      .map(listBody => {
        this.isLoadingResults = false;
        this.resultsLength = listBody.meta.totalResourceCount;
        this.renderedData = listBody.data;
        return this.renderedData;
      })
      .catch(() => {
        console.log('connect exception catched.');
        this.isLoadingResults = false;
        return Observable.of([]);
      });
    //   .map(() => {
    //     // Filter data
    //     // this.filteredData =;
    //     this._dataStore.findAll(this._type).subscribe
    //     // .filter((item: J) => {
    //     //   let searchStr = (item.name + item.color).toLowerCase();
    //     //   return searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    //     // });

    //     // Sort filtered data
    //     const sortedData = this.sortData(this.filteredData.slice());

    //     // Grab the page's slice of the filtered sorted data.
    //     const startIndex = this._paginator.pageIndex * this._paginator.pageSize;
    //     this.renderedData = sortedData.splice(startIndex, this._paginator.pageSize);
    //     return this.renderedData;
    //   });
  }

  transOffsetLimit(): PageCursor | PageNumberSize | PageOffsetLimit {
    return {
      offset: this._paginator.pageIndex * this._paginator.pageSize,
      limit: this._paginator.pageSize
    };
  }

  transSort(): SortPhrase[] {
    return [{ fname: this._sort.active, direction: this._sort.direction }];
  }

  transFilter(): FilterPhrase[] {
    return this.filter;
  }

  findAll(): Observable<ListBody<A, J>> {
    return this._dataStore.findAll(
      this._type,
      this.transOffsetLimit(),
      this.transSort(),
      this.transFilter()
    );
  }

  disconnect() {}

  addFilter(...filters: FilterPhrase[]): void {
    let changed = false;
    filters.forEach(newItem => {
      const found = this.filter.find(existFp => {
        return existFp.fname === newItem.fname;
      });
      if (found) {
        changed = found.value !== newItem.value;
        found.value = newItem.value;
      } else {
        this.filter.push(newItem);
        changed = true;
      }
    });

    if (changed) {
      this._filterChange.next(this.filter.map(a => a));
    }
  }

  // /** Returns a sorted copy of the database data. */
  // sortData(data: J[]): J[] {
  //   if (!this._sort.active || this._sort.direction === '') { return data; }

  //   return data.sort((a, b) => {
  //     let propertyA: number|string = '';
  //     let propertyB: number|string = '';

  //     switch (this._sort.active) {
  //       case 'userId': [propertyA, propertyB] = [a.id, b.id]; break;
  //       case 'userName': [propertyA, propertyB] = [a.name, b.name]; break;
  //       case 'progress': [propertyA, propertyB] = [a.progress, b.progress]; break;
  //       case 'color': [propertyA, propertyB] = [a.color, b.color]; break;
  //     }

  //     let valueA = isNaN(+propertyA) ? propertyA : +propertyA;
  //     let valueB = isNaN(+propertyB) ? propertyB : +propertyB;

  //     return (valueA < valueB ? -1 : 1) * (this._sort.direction === 'asc' ? 1 : -1);
  //   });
  // }
}
