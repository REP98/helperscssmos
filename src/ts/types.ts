export declare type EventListenerType = {
    add(target: Element | Document | Window | HTMLElement, type: string, listiner: EventListenerOrEventListenerObject, useCapture?: boolean): void,
    remove(target: Element | Document | Window | HTMLElement, type: string, listiner: EventListenerOrEventListenerObject, useCapture?: boolean): void,
    fire(target: Element | Document | Window | HTMLElement, event: CustomEvent): void,
    custom(type: string, options?: Object): CustomEvent
}

export declare type meansure = {
    to: string,
    from: string
}

export const BaseForm = {
    base: "16",
    decimales: "",
    medida1: "px",
    medida2: "rem",
    numero: "16",
    rnumero: ""
}

export declare type Calculator = {
    [key: string]: any,
    base: number,
    decimal: number,
    numero: number,
    medidas: meansure,
    result: number
}

export const OptionsDefaultCalculator: Calculator = {
    base: 16,
    decimal: 3,
    numero: 16,
    medidas: {
        to: 'px',
        from: 'rem'
    },
    result: 1
}

export interface ObjectKeyOrAny {
    [key: string]: any
}

export interface ObjectKeyOrString {
    [key: string]: string
}

export type ObjectOrFalse = ObjectKeyOrAny | false

export declare type ObjectForm = {
    [key: string]: any,
    base: string,
    decimales: string,
    medida1: string,
    medida2: string,
    numero: string,
    rnumero: string
}

export declare type ToastifyOptions = {
    text: string,
    className: "bg-primary" | "bg-secondary" | "bg-success" | "bg-danger" | "bg-warning" | "bg-info" | "bg-dark" | "bg-light",
    duration: number,
    gravity: "top" | "bottom",
    position: "left" | "center" | "right",
    stopOnFocus: boolean
    close: boolean
}

export const toptions: ToastifyOptions = {
    text: "",
    className: "bg-primary",
    duration: 5000,
    gravity: "bottom", // `top` or `bottom`
    position: "center", // `left`, `center` or `right`
    stopOnFocus: true, // Prevents dismissing of toast on hover,
    close: false
}

export declare type ObjRGBA = {
    [key: string]: any,
    r: number,
    g: number,
    b: number,
    a?: number | 100
}

export declare type ObjHSLA = {
    [key: string]: any,
    h: number,
    s: number,
    l: number,
    a?: number | 100
}

export declare type ObjHWBA = {
    [key: string]: any,
    h: number,
    w: number,
    b: number,
    a?: number | 100
}

declare global {
    interface String {
        toObject(toRgb: boolean): ObjRGBA | string | false
    }
}