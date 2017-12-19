import { extend } from 'webdriver-js-extender';
import { AttributesBase } from 'data-shape-ng';

export class DtoUtil {
    static cloneAttributes<T extends AttributesBase>(attr: T) {
        const mo = Object.assign({}, attr);
        delete mo.createdAt;
        delete mo.dtoAction;
        delete mo.dtoApplyTo;
        return mo;
    }
}

export interface NameValuePair {
    name: string;
    value: string;
}

export function toDateInputValue(v: number | Date): string {
    let d: Date;
    if (v) {
        if (typeof v === 'number') {
            d = new Date(v);
        } else {
            d = v;
        }
    } else {
        d = new Date();
    }
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}
