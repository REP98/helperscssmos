// Utils
import { EventListenerType } from '../types'
/**
 * Alias String.prototype.valueOf
 * @memberOf module:Utils
 * @type {Function}
 */
export const strValue = String.prototype.valueOf

export const toStr = Object.prototype.toString

export function isObject(obj:any): boolean {
    let proto

	if ( !obj || toStr.call( obj ) !== "[object Object]" ) {
		return false
	}

	proto = obj.prototype !== undefined
	if ( !proto ) {
		return true
	}
	return proto.constructor && typeof proto.constructor === "function"
}

/**
 * Verifica si es una Matriz
 * @memberOf module:Utils
 * @function isArrayish
 * @param  {*}  obj
 * @return {Boolean}  Verdadero si es un array
 */
export function isArrayish(obj: any): boolean {
	if (!obj) {
		return false
	}

	return obj instanceof Array || isArray(obj) ||
		(obj.length >= 0 && obj.splice instanceof Function)
}

export const isArray = Array.isArray

export function not(arg: any): boolean {
	return arg === undefined || arg === null
}
/**
 * Alias Object.defineProperty
 * @memberOf module:Utils
 * @type {Function}
 */
export const defineProperty = Object.defineProperty
/**
 * Alias Object.getOwnPropertyDescriptor
 * @memberOf module:Utils
 * @type {Function}
 */
export const gOPD: Function = Object.getOwnPropertyDescriptor

export function isJson(o: any): boolean {
    return /^[\],:{}\s]*$/.test(o.replace(/\\["\\\/bfnrtu]/g, '@').
    replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
    replace(/(?:^|:|,)(?:\s*\[)+/g, ''))
}
/**
 * Establece Propiedades de los Objetos
 * @memberOf module:Utils
 * @private
 * @param {Object} target el Objecto
 * @param {Object} opt    opciones del objecto
 */
export function setPropertyObj(target: {[key: string]: any}, opt: {[key: string]: any}) : void {
	if (defineProperty && opt.name === "__proto__") {
		defineProperty(target, opt.name, {
			enumerable: true,
			configurable: true,
			value: opt.newValue,
			writable: true,
		})
	} else {
		target[opt.name] = opt.newValue
	}
}
/**
 * Obtiene una propiedad de un objecto
 * @memberOf module:Utils
 * @private
 * @param  {Object} obj  El Objecto
 * @param  {String} name Nombre de la propiedad
 *
 * @return {(Void|*)}
 */
export function getProperty(obj: {[key: string | number]: any}, name: string): any {
	if (name === "__proto__") {
		if (!hasProp(obj, name)) {
			return void 0
		} else if (gOPD) {
			return gOPD(obj, name).value
		}
	}

	return obj[name]
}
/**
 * Extiende un objeto o matriz y combinar sus elementos
 * @memberOf module:Utils
 * @function extend
 * @param {...*} Argumentos Lista de Objetos a iterar
 * @return {(String|Object|Array)} retorna el elemento, o la unión de ellos
 */
export function extend(...args: any[]): any {
	let options,
		name,
		src,
		copy,
		copyIsArray,
		clone,
		target,
		deep,
		i,
		length = 0

	if (args.length === 0) {
		return void 0
	}

	target = args[0]
	length = args.length
	i = 1
	deep = false

	if (typeof target === "boolean") {
		deep = target
		target = args[1] || {}
		i = 2
	}

	if (empty(target) || (typeof target !== "object" && typeof target !== "function")) {
		target = {}
	}

	for (; i < length; ++i) {
		if (args[i] !== null) {
			options = args[i]

			for (name in options) {
				if (hasProp(options, name)) {
					src = getProperty(target, name)
					copy = getProperty(options, name)

					if (target !== copy) {
						copyIsArray = isArrayish(copy)
						if (deep && copy && (isObject(copy) || copyIsArray)) {
							if (copyIsArray) {
								copyIsArray = false
								clone = src && isArrayish(src) ? src : []
							} else {
								clone = src && isObject(src) ? src : {}
							}

							setPropertyObj(target, {
								name: name,
								newValue: extend(deep, clone, copy),
							})
						} else if (!not(copy)) {
							setPropertyObj(target, { name: name, newValue: copy })
						}
					}
				}
			}
		}
	}
	return target
}
/**
 * Busca y valida la propiedad del objeto dato
 * @memberOf module:Utils
 * @function hasProp
 * @param  {Object}  obj  objeto a verificar
 * @param  {String}  prop propiedad a buscar
 * @return {Boolean}  verdadero si la propiedad existe dentro del objeto
 */
export function hasProp(obj: Object, prop: string): boolean {
	return Object.prototype.hasOwnProperty.call(obj, prop)
}

/**
 * Verifica si la variable dada esta vaciá
 * @memberOf module:Utils
 * @function empty
 * @example
 * let a
 * empty(a) // true
 * empty(0) // true
 * empty(0.0) // true
 * empty(false) // true
 * empty([]) // true
 * empty({}) // true
 * empty("") // true
 * empty() // true
 * empty(1) // false
 * @param  {*} arg Variable, Objecto, matriz etc.. a verificar
 * @return {Boolean}  Verdadero si esta vació
 */
export function empty(arg: any): boolean {
	let und
	const emptyVal = [undefined, null, false, 0, 0.0, "", "0", "0.0", und],
		l = emptyVal.length

	if (typeof arg === "undefined") {
		return true
	}

	for (let i = 0; i < l; i++) {
		if (arg === emptyVal[i]) return true
	}

	if (isArrayish(arg)) {
		return arg.length === 0
	}

	if (isObject(arg)) {
		let o = 0
		for (let i in arg) {
			if (hasProp(arg, i)) {
				o++
			}
		}

		return o === 0
	}

	return false
}
/**
 * Valida String u Object
 * @memberOf module:Utils
 * @param  {(String|Object)} value la cadena a evaluar
 *
 * @return {Boolean} 
 */
export const tryStringObject = function tryStringObject(value: string | Object): boolean {
	try {
		strValue.call(value)
		return true
	} catch (e) {
		return false
	}
}
/**
 * Verifica si es un texto valido
 * @memberOf module:Utils
 * @function isString
 * @param  {*}  value
 * @return {Boolean}  verdadero si es un string
 */
export function isString(value: any): boolean {
	const strClass = "[object String]",
		hasToStringTag = typeof Symbol === "function" && typeof Symbol.toStringTag === "symbol"

	if (typeof value === "string") {
		return true
	}
	if (typeof value !== "object") {
		return false
	}
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass
}
/**
 * Verifica si es un selector valido
 * @memberOf module:Utils
 * @function isSelector
 * @param  {String}  selector
 * @return {Boolean}  Verdadero si es un selector
 */
export function isSelector(selector: string): boolean {
	if (!isString(selector)) {
		return false
	}
	try {
		document.querySelector(selector)
	} catch (error) {
		return false
	}

	return true
}

/**
 * Verifica si es una función
 * @memberOf module:Utils
 * @function isFunction
 * @param  {*} fn
 * @return {Boolean}  verdadero si es una función
 */
export function isFunction(fn: any): boolean {
	if (!fn) {
		return false
	}
	const string = toStr.call(fn)
	return string === "[object Function]" ||
		(typeof fn === "function" && string !== "[object RegExp]") ||
		(typeof window !== "undefined" &&
		 // IE8 and below
		 (fn === window.setTimeout ||
		  fn === window.alert ||
		  fn === window.confirm ||
		  fn === window.prompt))
}

export function querySelector(selector: string, context: Document | Element | null = document): false | Element | NodeListOf<Element> | null {
	let d = context || document
	return d.querySelectorAll(selector).length > 1 ?
			d.querySelectorAll(selector) :
			d.querySelector(selector) != null ? d.querySelector(selector) : false
}

export const Event: EventListenerType = {
	add(target: Element | Document | Window | HTMLElement, type: string, listiner: EventListenerOrEventListenerObject, useCapture: boolean = false): void {
		target.addEventListener(type, listiner, useCapture)
	},
    remove(target: Element | Document | Window | HTMLElement, type: string, listiner: EventListenerOrEventListenerObject, useCapture?: boolean): void {
		target.removeEventListener(type, listiner, useCapture)
	},
	fire(target: Element | Document | Window | HTMLElement, event: CustomEvent): void {
		target.dispatchEvent(event);
	},
	custom(type: string, options?: Object): CustomEvent {
		options = Object.assign({
			bubbles: false,
			cancelable: true,
			detail: true
		}, options)
		return new CustomEvent(type, options)
	}
}
// Alias
export const EV: EventListenerType = Event