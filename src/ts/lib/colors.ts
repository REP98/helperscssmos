import { ObjHSLA, ObjHWBA, ObjRGBA } from "../types";
import { hasProp, isObject, not } from "./fascino";

/**
 * Valida si es un color Hexadecimal valido
 * @function isHex
 * @param  {String}  color Hexadecimal a validar
 * @return {Boolean}
 */
export function isHex(color: string): boolean {
	return /(^#[0-9a-f]{3}$)|(^#[0-9a-f]{4}$)|(^#[0-9a-f]{6}$)|(^#[0-9a-f]{8}$)/i.test(color)
}
/**
 * Obtiene el canal Alpha de un hexadecimal y lo convierte en decimal
 * @function AlphaHex
 * @param {String} hex Color Hexadecimal en formato #RRGGBBAA
 * @return {(Number|False)} El numero del porcentaje o false si no es un hexadecimal valido
 */
export function AlphaHex(hex: string): number | false {
	if (!isHex(hex)) {
		return false
	}
	let r: RegExpExecArray | null = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(hex)
	return (r as RegExpExecArray).length > 2 ? Hex2Per((r as RegExpExecArray)[2]) : 100
}
/**
 * Convierte Colores Hexadecimales a RGB
 * @see [Github]{http://gist.github.com/983661}
 * @function Hex2Rgb
 * @param {String} hex Color Hexadecimal
 * @return {(Object|False)} Objecto con el color RGBA o false si no es valido
 */
export function Hex2Rgb(hex: string): ObjRGBA | false {
	if (!isHex(hex)) {
		return false;
	}
	let withAlpha: boolean = /(^#[0-9a-f]{4}$)|(^#[0-9a-f]{8}$)/i.test(hex),
		alpha: number = withAlpha ? (AlphaHex(hex) as number) : 100

	if (withAlpha) {
		if (hex.length == 4) {
			hex = hex.substring(1, 4)
		} else {
			hex = hex.substring(1, 7)
		}
	} else {
		hex = hex.slice(1)
	}

	let searchValue: string | RegExp = hex.length < 5 ? /./g : '',
        hx: number = +("0x" + hex.replace( 
            searchValue, '$&$&'
	    )
	);

  return {
	r: hx >> 16 & 255,
	g: hx >> 8 & 255,
	b: hx & 255,
	a: alpha
  }
}
/**
 * Convierte Hexadecimal en HSL
 * @function Hex2Hsl
 * @param {String} hex Color
 * @return {(Object|Boolean)} Objecto hsl o false
 */
export function Hex2Hsl(hex: string): ObjHSLA | false {
	if (!isHex(hex)) {
		return false;
	}
	let c: ObjRGBA = (Hex2Rgb(hex) as ObjRGBA)

	return Rgb2Hsl(c.r, c.g, c.b)
}
/**
 * Convierte un Hexadecimal a HWB
 * @function Hex2Hsl
 * @param {String} hex
 * @return {(Object|false)} Objecto hsl o false
 */
export function Hex2Hwb(hex: string): object | false {
	if (!isHex(hex)) {
		return false;
	}
	let c: ObjRGBA = (Hex2Rgb(hex) as ObjRGBA)
	return Rgb2Hwb(c.r, c.g, c.b)
}

//-------------------- RGBA --------------------------------------------------------------------
/**
 * Valida si es un Objecto o String valido para rgb
 * @function isRGB
 * @param  {(Object|String)}  rgb RGBA
 * @return {Boolean}
 */
export function isRGB(rgb: ObjRGBA | string): boolean {
	return isObject(rgb) && hasProp(rgb, 'r') || 
        /(^rgb\([\d,?\s?]+\)$)|(^rgba\(([\d,?\s?]+)\s?\/?\s?(([\d.\d]|[\d\%])+)\)$)/gi.test((rgb as string))
}
/**
 * Convierte un valor RGBA a HEXADECIMAL
 * @function Rgb2Hex
 * @param {Number} r     Rojo
 * @param {Number} g     Verde
 * @param {Number} b     Azul
 * @param {Number} a 	 Alfa
 * @return {String}		Expresión Hexadecimal
 */
export function Rgb2Hex(r: number, g: number, b: number, a: number = 100): string {
	let ts = (c: number) => {
        let rt = c.toString(16)
        return rt.length == 1 ? rt+rt : rt
      },
      hex = "#"+ ts(r) + ts(g) + ts(b)
      
	if (a < 100) {
		hex += Per2Hex(a)
	}
 
	return hex.toUpperCase()
}
/**
 * Convierte un rgba a Hsla, el alfa es opcional
 * @function Rgb2Hsl
 * @param {Number} r     Rojo
 * @param {Number} g     Verde
 * @param {Number} b     Azul
 * @param {Number} alpha Opacidad
 * @return {Object} Objecto con los datos HSLA
 */
export function Rgb2Hsl (r: number, g: number, b: number, alpha: number = 100): ObjHSLA {
	r /= 255
	g /= 255
	b /= 255

    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);
    let [hue, sat, light] = [0, 0, (max + min)/2];
    let d = max - min;

    if (d !== 0) {
        sat = (light === 0 || light === 1)
            ? 0
            : (max - light) / Math.min(light, 1 - light);

        switch (max) {
            case r:   hue = (g - b) / d + (g < b ? 6 : 0); break;
            case g: hue = (b - r) / d + 2; break;
            case b:  hue = (r - g) / d + 4;
        }

        hue = hue * 60;
    }

    return {
    	h: Math.round(hue),
    	s: Math.round(sat * 100),
    	l: Math.round(light * 100),
    	a: alpha
    };
}
/**
 * Convierte un RGB en HWB
 * @function Rgb2Hwb
 * @param {Number} r Rojo
 * @param {Number} g Verde
 * @param {Number} b Azul
 * @return {Object} Objecto HWB
 */
export function Rgb2Hwb(r: number, g: number, b: number, a: number = 100): ObjHWBA {
    var hsl: ObjHSLA = (Rgb2Hsl(r, g, b, a) as ObjHSLA),
    	w = (1 / 255) * Math.min(r, Math.min(g, b)),
    	b = 1 - (1 / 255) * Math.max(r, Math.max(g, b))
   
    return {
    	h: hsl.h,
    	w: Math.round(100 * w),
    	b: Math.round(100 * b),
    	a: hsl.a
    }
}
/**
 * Calcula el HSP de un RGB 
 * @function Rgb2Hsp
 * @param {Number} r Rojo(0-255)
 * @param {Number} g Verde(0-255)
 * @param {Number} b Azul(0-255)
 * @return {Object} Un Objecto confomado por una clave hsp y una booleana isDark que indica si es o no oscuro el color
 */
export function Rgb2Hsp(r: number, g: number, b: number): {[index: string]:any} {
	// HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
	let hsp = Math.sqrt(
	    0.299 * (r * r) +
	    0.587 * (g * g) +
	    0.114 * (b * b)
	  );

	return {
		hsp,
		isDark: !(hsp > 127.5)
	}
}

//-------------------- HSLA --------------------------------------------------------------------
/**
 * Valida si es un Objecto o String HSL
 * @function isHSL
 * @param  {(Object|String)}  hsl
 * @return {Boolean}
 */
export function isHSL(hsl: ObjHSLA | string): boolean {
	return isObject(hsl) && hasProp(hsl, 's') || 
        /(^hsl\([\d%?,?\s?]+\)$)|(^hsla\(([\d%?,?\s?]+)\s?\/?\s?(([\d.\d]|[\d\%])+)\)$)/gi.test((hsl as string))
}
/**
 * Convierte HSLA en RGBA
 * @function Hsl2Rgb
 * @param {Number} hue   HUE
 * @param {Number} sat   Saturación
 * @param {Number} light Luz
 * @param {Number} alpha Opciada opcional
 * @return {Object} Object rgba
 */
export function Hsl2Rgb(hue: number = 0, sat: number = 100, light: number = 50, alpha: number = 100): ObjRGBA {
	hue = hue % 360
	if (hue < 0) {
		hue += 360
	}
	sat /= 100
	light /= 100

	let f = (n: number) => {
		let k = (n + hue / 30) % 12,
			a = sat * Math.min(light, 1 - light)
		return light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)))
	}

	return {
		r: Math.round(255 * f(0)),
		g: Math.round(255 * f(8)),
		b: Math.round(255 * f(4)),
		a: alpha
	}
}
/**
 * Convierte Hsl a Hexadecimal
 * @function Hsl2Hex
 * @param {Number} hue   HUE
 * @param {Number} sat   Saturación
 * @param {Number} light Luz
 * @param {Number} alpha Opciada opcional
 * @return {String}
 */
export function Hsl2Hex(hue: number = 0, sat: number = 100, light: number = 50, alpha: number = 100): string {
	let r = Hsl2Rgb(hue, sat, light, alpha)
	return Rgb2Hex(r.r, r.g, r.b, r.a)
}
/**
 * Convierte HSL a HWB
 * @function Hsl2Hwb
 * @param {Number} hue   HUE
 * @param {Number} sat   Saturación
 * @param {Number} light Luz
 * @param {Number} alpha Opciada opcional
 * @return {Object} Objecto hwba
 */
export function Hsl2Hwb(hue: number = 0, sat: number = 100, light: number = 50, alpha: number = 100): ObjHWBA {
	let r = Hsl2Rgb(hue, sat, light, alpha),
		w = (1 / 255) * Math.min(r.r, Math.min(r.g, r.b)),
    	b = 1 - (1 / 255) * Math.max(r.r, Math.max(r.g, r.b))

    	w = Math.round(w)
    	b = Math.round(b)

	return {
		h: Math.round(hue),
		w, 
		b,
		a: alpha
	}
}
//-------------------- HWB ---------------------------------------------------------------------
/**
 * Valida si es un Objecto o string HWB valido 
 * @function isHwb
 * @param  {(Object|String)}  hwb
 * @return {Boolean}
 */
export function isHwb(hwb: ObjHWBA | string): boolean {
	return isObject(hwb) && hasProp(hwb, 'w') || /^hwb\(([\/?\d%?\s?]+)\)$/gi.test((hwb as string))
}
/**
 * Convierte un HWB en RGBA
 * @function Hwb2Rgb
 * @param {Number} hue  
 * @param {Number} white
 * @param {Number} black
 * @param {Number} alpha
 * @return {Object}
 */
export function Hwb2Rgb(hue: number = 0, white: number = 0, black: number = 0, alpha: number = 100): ObjRGBA {
	hue /= 360
	white /= 100
	black /= 100

	let radio: number = white + black,
		r,g,b, i, v, f, n;

	if (radio > 1) {
		white = black = radio
	}

	i = Math.floor(6 * hue)
	v = 1 - black,
	f = 6 * hue - i

	if ((i & 0x01) !== 0) {
		f = 1 - f
	}

	n = white + f * (v - white)

	switch (i) {
		default:
		case 6:
		case 0: r = v; g = n; b = white; break;
		case 1: r = n; g = v; b = white; break;
		case 2: r = white; g = v; b = n; break;
		case 3: r = white; g = n; b = v; break;
		case 4: r = n; g = white; b = v; break;
		case 5: r = v; g = white; b = n; break;
	}
	return {
		r: Math.round(255 * r),
		g: Math.round(255 * g),
		b: Math.round(255 * b),
		a: alpha
	}
}
/**
 * Convierte un HWB a HEX
 * @function Hwb2Hex
 * @param {Number} hue  
 * @param {Number} white
 * @param {Number} black
 * @param {Number} alpha
 * @return {String}
 */
export function Hwb2Hex(hue: number = 0, white: number = 0, black: number = 0, alpha: number = 100): string {
	let r = Hwb2Rgb(hue, white, black, alpha)
	return Rgb2Hex(r.r, r.g, r.b, r.a)
}
/**
 * Convierte un HWB a HSL
 * @function Hwb2Hsl
 * @param {Number} hue  
 * @param {Number} white
 * @param {Number} black
 * @param {Number} alpha
 * @return {Object}
 */
export function Hwb2Hsl(hue: number = 0, white: number = 0, black: number = 0, alpha: number = 100): ObjHSLA {
	let r = Hwb2Rgb(hue, white, black, alpha)
	return Rgb2Hsl(r.r, r.g, r.b, r.a)
}


//============================================================================================
// UTILIDADES PARRA LAS FUNCIONES DE COLORES
//============================================================================================

/**
 * Convierte un color a su representacion en String
 * @function Color2Str
 * @param {(String|Object)} color El color
 * @return {String}
 */
export function Color2Str(color: string | ObjRGBA | ObjHWBA | ObjHSLA): string {
	if (isObject(color)) {
		if (hasProp(color, 'r')) {
            color = (color as ObjRGBA)
			return hasProp(color, 'a') && (color.a as number) < 100 ?
				`rgba(${color.r} ${color.g} ${color.b} / ${(color.a)}%)`
				: `rgb(${color.r} ${color.g} ${color.b})`
		} else if (hasProp(color, 'w')) {
            color = (color as ObjHWBA)
			return hasProp(color, 'a') && (color.a as number) < 100 ? 
				`hwb(${color.h} ${color.w}% ${color.b}% / ${color.a})` :
				`hwb(${color.h} ${color.w}% ${color.b}%)`
		} else if (hasProp(color, 'h')) {
            color = (color as ObjHSLA)
			return hasProp(color, 'a') && (color.a as number) < 100 ?
				`hsla(${color.h} ${color.s}% ${color.l}% / ${(color.a)}%)`
				: `hsl(${color.h} ${color.s}% ${color.l}%)`
		}
	}
    return `#${color.toUpperCase()}`
}
/**
 * Convierte un porcentaje a una expresión Hexadecimal

 * @function Per2Hex
 * @see [Github]{https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4?permalink_comment_id=3036936#gistcomment-3036936}
 * @param {Number} percent El valor del porcentaje
 * @return {String}
 */
export function Per2Hex(percent: number): string {
	percent = Math.max(0, Math.min(100, percent))
	let PerHex = Math.round(percent / 100 * 255).toString(16)
	return PerHex.padStart(2, "0").toUpperCase()
}
/**
 * Convierte un Hexadecimal a Porcentaje

 * @function Hex2Per
 * @param {String} Hex Hexadecimal
 * @return {Number}
 */
export function Hex2Per(Hex: string): number {
	return Math.round(((parseInt(Hex, 16) - 0) / 255) * 100)
}
/**
 * Ilumina u oscurece un color <br/>
 * Similar a las funciones de Sass

 * @function lightOrDark
 * @see [Author y Blog original]{https://css-tricks.com/snippets/javascript/lighten-darken-color/}
 * @param  {String} color Color Hexadecimal
 * @param  {Number} amt   Importe si es positivo seria Light negativo para dark
 * @return {String}       Color Hexadecimal
 */ 
export function lightOrDark(color: string, amt: number): string {
	if(!isHex(color)) {
		return color;
	}

	let hex = color.slice(1),
		a = hex.length >= 6 ? hex.slice(6) : "",
		num = parseInt(hex.replace(a, ""), 16),
		nor = (c: number) => {
			if (c > 255) {
				c = 255
			} else if(c < 0) {
				c = 0
			}
			return c
		},
		r = nor((num >> 16) + amt),
		g = nor((num & 0x0000FF) + amt),
		b = nor(((num >> 8) & 0x00FF) + amt)

	return "#" + String("000000" + (g | (b << 8) | (r << 16)).toString(16)).slice(-6) + a;
}
/**
 * Convierte un representación String de un color a un Objecto, si toRgb es verdadero el color suministrado
 * sera trasformado en un color RGB  y retorna su objecto dado.

 * @function ColorStr2Obj
 * @param {String}  color representación de colores
 * @param {Boolean} toRgb Retorna objecto rgb si se establece a true
 * @return {Object}
 */
export function ColorStr2Obj(color: string, toRgb: boolean = false): ObjRGBA | string |false {
	if (isHex(color)) {
    	return Hex2Rgb(color)
  	}
    var cl: RegExpExecArray | null = /^([rgb|rgba|hsl|hsla|hwb]+)\(([\d]+),?\s?([\d%?]+),?\s?([\d%?]+),?\s?\/?\s?([\d%?]+)?\)$/gi.exec(color),
        o: ObjRGBA = {r: 0, g: 0, b: 0}, 
        rgb: ObjRGBA = {r: 0, g: 0, b: 0};

    if (not(cl)) {
        return color
    }
    let c = (cl as RegExpExecArray)
    switch(c[1]) {
        case 'rgb':
        case 'rgba':
            o.r = parseInt(c[2])
            o.g = parseInt(c[3])
            o.b = parseInt(c[4])
            o.a = parseInt(c[5]) || 100
            rgb = o
        break;
        case 'hsl':
        case 'hsla':
            o.h = parseInt(c[2])
            o.s = parseInt(c[3])
            o.l = parseInt(c[4])
            o.a = parseInt(c[5]) || 100
            rgb = Hsl2Rgb(o.h, o.s, o.l, o.a)
        break;
        case 'hwb':
            o.h = parseInt(c[2])
            o.w = parseInt(c[3])
            o.b = parseInt(c[4])
            o.a = parseInt(c[5]) || 100
            rgb = Hwb2Rgb(o.h, o.w, o.b, o.a)
        break;
    }

    return toRgb ? rgb : Rgb2Hex(rgb.r, rgb.g, rgb.b, rgb.a || 100)
}

export function lume(color: string) {
	let a: ObjRGBA = (Hex2Rgb(color) as ObjRGBA),
		b = [a.r / 255, a.g / 255, a.b / 255].map((v) => {
			return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4 )
		})
	return 0.2126 * b[0] + 0.7152 * b[1] + 0.0722 * b[2];
}

export function isDark(color: string): boolean {
	return lume(color) <= 0.179;
}

export function isLigth (color: string): boolean {
	return !isDark(color)
}

String.prototype.toObject = function(toRgb: boolean = false): ObjRGBA | string | false {
    let d = String(this)
	return ColorStr2Obj(d, toRgb)
}
