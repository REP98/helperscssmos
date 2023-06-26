import { BaseForm, Calculator, ObjectForm, ObjectOrFalse, OptionsDefaultCalculator } from "../types";
import {
    isArray,
    isObject,
    not,
    isJson,
    hasProp
} from "./fascino"

export const DB = {
    get(name:string, defaults: any = false): any {
        var store = localStorage.getItem(name)
        if(not(store)) {
            return defaults;
        }
        if (isJson(store)) {
            return JSON.parse(store!);
        }
        return localStorage.getItem(name) || defaults;
    },
    set(name: string, value: any): void {
        let val: string = ""
        if (isObject(value) || isArray(value)) {
            val = JSON.stringify(value)
        } else {
            val = value
        }

        localStorage.setItem(name, val)
    },
    has(name: string): boolean {
        return this.get(name, false)
    },
    remove(name: string): void {
        localStorage.removeItem(name)
    },
    clear(): void {
        localStorage.clear()
    }
}

function sanitizeFormValue(f: FormData): Object {
    var s: ObjectForm = Object.assign(BaseForm ,Object.fromEntries(f)),
        o: Calculator = Object.assign(OptionsDefaultCalculator, s);
    
    o.medidas.to = s.medida1
    o.medidas.from = s.medida2
    return o
}

export const ORM = {
    Calculator: {
        set(form: HTMLFormElement) {
            var s = new FormData(form),
                a: ObjectOrFalse = ORM.Calculator.getAll()

            if (a !== false) {
                DB.set("formcalculator", sanitizeFormValue(s))
            }
        },
        setItem(name: string, value: number | string): void {
            var all: ObjectOrFalse = ORM.Calculator.getAll()
            if (hasProp(all, name)) {
                let a: {[index: string]:any} = {}
                a[name] = value
                all = Object.assign(all, a)
            }
            DB.set("formcalculator", all)
        },
        get(name: string): number | string | false {
            var all: ObjectOrFalse = ORM.Calculator.getAll()
            
            if ( all !== false ) {
                if (hasProp(all, name)) {
                    return all[name]
                }
            }
            return false
        },
        getAll(): false | Object {
            return DB.get('formcalculator', false)
        }
    }
}
export default DB