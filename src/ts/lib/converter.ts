import {
    not
} from "./fascino"
import DB, { ORM } from "./db"
import { Toast } from "./plugins";

function r(str:string | number): Number {
    var val = Number(ORM.Calculator.get('decimal'))
    str = str.toString();
    str = str.slice(0, (str.indexOf(".")) + val + 1);
    return Number(str);  
}

export const Base = {
    _value: 16.0,
    set value(b: number | string) {
        ORM.Calculator.setItem('base', b)
        Base._value = parseFloat( ORM.Calculator.get('base') as string )
    },
    get value(): number {
        return DB.get('base', Base._value )
    }
}

export const percentage = {
    /**
     * Convierte un número a porcentaje
     * @param n Numero
     * @returns Number
     */
    to(n:number): Number {
        return r(
            (n * 100) / Base.value
        )
    },
    /**
     * Convierte un porcentaje a medidas en base a la base PX
     * @param n Porcentaje
     * @returns Number
     */
    from(n:number): Number {
        return r((n * Base.value) / 100)
    }
}

export function pxTo (n: number, to: string): Number {
    let num: Number | null | number = null, txt: string = ""

    if (["rem", "em", "lh"].indexOf(to) > -1) {
        num = (n / Base.value)
    }

    if (['vh', 'vw'].indexOf(to) > -1) {
        num = ( (100 * n) / Base.value )
    }
    
    switch(to.toLowerCase()) {
        case 'n%': 
            return percentage.to(n)
        break;
        case 'cm':
            num = ( (n / Base.value) * 2.54 )
        break;
        case 'mm': 
            num = ( (n / Base.value) * 25.4 )
        break;
        case 'in': 
            num = (n / Base.value)
        break;
        case 'pt': 
            num = (n * (72 / Base.value))
        break;
        case 'pc': 
            num = (n * (6 / Base.value))
        break;
        default: 
            txt = `Medida [${to}] no soportada para PX`
    }
    
    if ( not(num) ) {
       Toast(txt, 'danger')
        return 0
    }

    return r((num as number)!)
}

export function M(n: number, to: string): Number {
    if (to.toLowerCase() == 'px') {
        return r((n * Base.value))
    }
    var px = M(n, 'px')
    if (to == 'n%') {
        return percentage.to(n)
    } else {
        return pxTo(Number(px), to)
    }
}

export function viewport(n: number, to: string): Number {
    if (to.toLowerCase() == "px") {
        return r((Base.value * n) / 100)
    } else if (to.toLowerCase() == 'n%') {
        return percentage.to(n)
    }
    let px = viewport(n, "px")
    return pxTo(Number(px), to)
}

export function cm(n: number, to: string): Number {
    var num, txt: string = "";
    to = to.toLowerCase()

    if (["rem", "em", "lh", "vw", "vh"].indexOf(to) > -1) {
        let px = cm(n, 'px')
        Base.value = 16
        return pxTo(Number(px), to)
    } else if(to == "n%") {
        return percentage.to(n)
    }

    switch(to) {
        case "px":
            num = (Base.value * n) / 2.54
            break;
        case "in":
            num = (n / 2.54)
            break;
        case "mm":
            num = (n * 10)
            break;
        case "pc":
            num = (n * (6/2.54))
            break;
        case "pt":
            num = (n * (72/2.54))
            break;
        default: 
            txt = `Medida [${to}] no soportada para CM`
    }

    if (not(num)) {
        Toast(txt, 'danger')
        return 0
    }

    return r(num!)
}

export function mm(n: number, to: string): Number {
    var num, txt: string = "";
    to = to.toLowerCase()

    if (["rem", "em", "lh", "vw", "vh"].indexOf(to) > -1) {
        let px = mm(n, 'px')
        Base.value = 16
        return pxTo(Number(px), to)
    } else if(to == "n%") {
        return percentage.to(n)
    }

    switch(to) {
        case "px":
            num = (Base.value * n) / 25.4
            break;
        case "in":
            num = (n / 25.4)
            break;
        case "cm":
            num = (n / 10)
            break;
        case "pc":
            num = (n * (6/25.4))
            break;
        case "pt":
            num = (n * (72/2.54))
            break;
        default: 
            txt = `Medida [${to}] no soportada para MM`
    }

    if (not(num)) {
        Toast(txt, 'danger')
        return 0
    }

    return r(num!)
}

export function inches(n: number, to: string): Number {
    var num, txt: string = "";
    to = to.toLowerCase()

    if (["rem", "em", "lh", "vw", "vh"].indexOf(to) > -1) {
        let px = inches(n, 'px')
        Base.value = 16
        return pxTo(Number(px), to)
    } else if(to == "n%") {
        return percentage.to(n)
    }

    switch(to) {
        case "px":
            num = (Base.value * n)
            break;
        case "mm":
            num = (25.4 * n)
            break;
        case "cm":
            num = (2.54 * n)
            break;
        case "pc":
            num = (n * 6)
            break;
        case "pt":
            num = (n * 72)
            break;
        default: 
            txt = `Medida [${to}] no soportada para IN`
    }

    if (not(num)) {
        Toast(txt, 'danger')
        return 0
    }

    return r(num!)
}

export function point(n: number, to: string): Number {
    var num, txt: string = "";
    to = to.toLowerCase()

    if (["rem", "em", "lh", "vw", "vh"].indexOf(to) > -1) {
        let px = inches(n, 'px')
        Base.value = 16
        return pxTo(Number(px), to)
    } else if(to == "n%") {
        return percentage.to(n)
    }

    switch(to) {
        case "px":
            num = (n * (Base.value / 72))
            break;
        case "mm":
            num = ((n / 72) * 25.4)
            break;
        case "cm":
            num = ((n / 72) * 2.54)
            break;
        case "pc":
            num = (n * (6 / 72))
            break;
        case "in":
            num = (n / 72)
            break;
        default: 
            txt = `Medida [${to}] no soportada para PT`
    }

    if (not(num)) {
        Toast(txt, 'danger')
        return 0
    }

    return r(num!)
}

export function picas(n: number, to: string): Number {
    var num, txt: string = "";
    to = to.toLowerCase()

    if (["rem", "em", "lh", "vw", "vh"].indexOf(to) > -1) {
        let px = inches(n, 'px')
        Base.value = 16
        return pxTo(Number(px), to)
    } else if(to == "n%") {
        return percentage.to(n)
    }

    switch(to) {
        case "px":
            num = (n * (Base.value / 6))
            break;
        case "mm":
            num = ((n / 6) * 25.4)
            break;
        case "cm":
            num = ((n / 6) * 2.54)
            break;
        case "pt":
            num = (n * 12)
            break;
        case "in":
            num = (n / 6)
            break;
        default: 
            txt = `Medida [${to}] no soportada para PC`
    }

    if (not(num)) {
        Toast(txt, 'danger')
        return 0
    }

    return r(num!)
}

export function lh(n: number, to: string): Number {
    if (to.toLowerCase() == "px") {
        return r((n * Base.value))
    }
    let px = lh(n, "px")
    return pxTo(Number(px), to)
}

export function loadfunction(o: {[index: string]:any}): void {
    // SET
    Base.value = o.base.value;
    ORM.Calculator.setItem('decimal', Number(o.decimal.value))

    var n = Number(o.number.value),
        rnum: Number | number | string = "1",
        from = o.medidas.from.value;

    switch(o.medidas.to.value.toUpperCase()) {
        case "PX":
            rnum = pxTo(n, from)
            break;
        case "EM":
        case "REM":
            rnum = M(n, from)
            break;
        case "N%":
            rnum = percentage.from(n)
            break;
        case "VW":
        case "VH":
            rnum = viewport(n, from)
            break;
        case "IN":
            rnum = inches(n, from)
            break;
        case "MM":
            rnum = mm(n, from)
            break;
        case "CM":
            rnum = cm(n, from)
            break;
        case "PT":
            rnum = point(n, from)
            break;
        case "PC":
            rnum = picas(n, from)
            break;
        case "LH":
            rnum = lh(n, from)
            break;
        default:
            Toast(`Medida "${o.medidas.to.value.toUpperCase()}" no encotrada`, "danger")
    }

    if (not(rnum)) {
        Toast("No calculado", "danger")
    }
    o.rnumber.value = rnum
}
