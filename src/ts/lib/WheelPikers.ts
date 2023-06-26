import { ObjHSLA, ObjHWBA, ObjRGBA, ObjectKeyOrString } from "../types";
import { Hex2Hsl, Hex2Hwb, Hex2Rgb, Hsl2Hex, Hwb2Hex, Rgb2Hex, Rgb2Hsl, isDark, lightOrDark } from "./colors";
import DB from "./db";
import { EV, extend, hasProp, not, querySelector } from "./fascino";
import ClipboardJS from "clipboard"
import { Modal } from 'bootstrap';
import saveFile from "./file"

const isAndroid = () => {
	return hasProp(window, "front")
}
export const listColor: ObjectKeyOrString = {
	"amber":        "#ffc107",
	"blue":         "#2196F3",
	"lightBlue":    "#03a9f4",
	"indigo":       "#3F51B5",
	"purple":       "#9C27B0",
	"deepPurple":   "#673ab7",
	"pink":         "#E91E63",
	"red":          "#F44336",
	"orange":       "#FF9800",
	"deepOrange":   "#ff5722",
	"yellow":       "#ffeb3b",
	"green":        "#4CAF50",
	"lightGreen":   "#8bc34a",
	"lime":         "#cddc39",
	"teal":         "#009688",
	"cyan":         "#00BCD4",
	"brown":        "#795548",
	"grey":         "#9e9e9e",
	"blueGrey":     "#607d8b",
	"ligthDark":    "#374046",
	"dark":         "#212121",
	"white":        "#ffffff",
	"black":        "#000000"
}

export default class WheelPikers {
	// Declare
	parent!: HTMLElement;
	output!: HTMLDivElement;
	gamaParent!: HTMLDivElement;
	controls!: {
	   [index: string]: {[index: string]: HTMLInputElement | null;} | HTMLInputElement | null;

		alpha: HTMLInputElement;
		hsl: {
			[index: string]: HTMLInputElement;
			hue: HTMLInputElement;
			sat: HTMLInputElement;
			light: HTMLInputElement;
		};
		rgb: {
			[index: string]: HTMLInputElement;
			red: HTMLInputElement;
			green: HTMLInputElement;
			blue: HTMLInputElement;
		};
		hwb: {
			[index: string]: HTMLInputElement;
			huewb: HTMLInputElement;
			white: HTMLInputElement;
			black: HTMLInputElement;
		};
		hex: HTMLInputElement;
	 };
	listColors!: ObjectKeyOrString;

	constructor(parent: HTMLElement | null) {
		this.parent = parent || (querySelector('body') as HTMLBodyElement)
		this._getInitState()
	}

	// Private
	private _qs(r: string) {
		return querySelector(r, this.parent)
	}
	private _setHueGrandient(el: HTMLElement, c: ObjHSLA = {h: 0, s: 100, l: 100, a: 1}) {
		let colorHue: string[] = []
		for (let i = 0; i <= 36; i++) {
			colorHue.push(`hsla(${i * 10}, ${c.s}%, ${c.l}%, ${c.a})`)
		}

		this._setGrandient(el, colorHue)
	}

	private _setGrandient(el: HTMLElement, color: string[], orientation: string = 'left'): void {
		['-o', '-ms', '-moz', '-webkit'].forEach((prefix) => {
			el.style.backgroundImage = `${prefix}-linear-gradient(${orientation}, ${color.join(', ')})`
		})
	}
	private _removeItemColors() {
		Array.from( this._qs("#listcolor .item.c") as NodeList).forEach((el) => {
			(el as  HTMLElement).remove()
		})
	}
	private _listColores () {
		var divColors: HTMLDivElement = (this._qs("#listcolor") as HTMLDivElement),
			lc = extend(listColor, DB.get("newcolor", {}));
			this._removeItemColors()
		Object.keys(lc).forEach((name) => {
			let color: string = lc[name],
				fontcolor: string = isDark(color) ? listColor.white : listColor.ligthDark,
				d = document.createElement('div');
			d.classList.add("item", "c")
			d.style.background = color
			d.style.color = fontcolor
			d.setAttribute("data-color", color)
			d.setAttribute("aria-label", name)
			d.setAttribute("data-clipboard-text", color)
			divColors.append(d)
			EV.add(d, 'click', (e: Event) => {
				var iam: HTMLDivElement = (e.target as  HTMLDivElement)
				this._removeItemsActive()
				iam.classList.add("active")
				this.setValue((iam.getAttribute('data-color') as string))
			})
		})
		this.listColors = lc
	}

	private _removeItemsActive() {
		Array.from(this._qs("#listcolor div.item") as NodeList).forEach((el) => {
			(el as HTMLElement).classList.remove("active")
		})
	}

	private _getInitState() {
		var clt: {[index: string]: any} = {
			hex: (this._qs("#hex") as HTMLInputElement)
		};

		Array.from( this._qs("input.control") as NodeList).forEach((input) => {
			let el: HTMLInputElement = (input as HTMLInputElement),
				group: string | null = el.getAttribute('data-type'),
				key: string = el.id,
				value: HTMLInputElement = el,
				withOutGroup = group == null

			if ( withOutGroup ) {
				clt[key] = value
			} else {
				if ( hasProp( clt, group as string ) ) {                    
					clt[group as string][key] = value
				} else {
					clt[group as string] = {}
					clt[group as string][key] = value
				}
			}
		})

		this.controls = extend({}, clt)
		this.controls.alpha = this._qs("#alpha") as HTMLInputElement

		this.output = this._qs("#viewcolors") as HTMLDivElement

		this.gamaParent = (this._qs("#gama") as HTMLDivElement)

		this.hex = (DB.get("colorpiker", listColor.amber) as string)
		this.alpha = (DB.get("coloralpha", 100) as number)
		this.HSL = Hex2Hsl(this.hex) as ObjHSLA
		this.HWB = Hex2Hwb(this.hex) as ObjHWBA
		this.RGB = Hex2Rgb(this.hex) as ObjRGBA
		
		this.setValue()
		this._listColores()
		this._startEvent()
		this._addColors()
		this._exportFS()

		if (ClipboardJS.isSupported()) {
			new ClipboardJS('[data-clipboard-text]');
		}
	}
	private _addColors() {
		var modal = new Modal('#addColorsModal'),
			modalE = new Modal('#existColor');
		
		EV.add(
			this._qs("#addcolors") as HTMLButtonElement,
			'click',
			() => {
				let color = this.hex,
					preview = this._qs("#previewcolor") as HTMLDivElement,
					valcolor = this._qs("#valcolor") as HTMLInputElement

				if (Object.values(this.listColors).indexOf(color) == -1) {
					preview.style.background = color
					valcolor.value = color
					modal.show()
				} else {
					(this._qs("#currentcolor") as SVGElement).style.color = color
					modalE.show()
				}
			}

		)

		EV.add(
			this._qs("#saveColor") as HTMLButtonElement,
			'click',
			() => {
				let n: string = (this._qs("#nameNewColor") as HTMLInputElement).value as string,
					h = (this._qs("#valcolor") as HTMLInputElement).value,
					o: {[index: string]: string} = {},
					lc = this.listColors;

				n = n.replace(/[^a-zA-Z0-9]/g, "")

				o[n] = h
				DB.set("newcolor", extend(lc, o))
				this._listColores()
				modal.hide()
				
			}

		)
	}
	private _exportFS() {
		let codeCSS = this._qs("#excss") as HTMLElement,
			codeSCSS = this._qs("#exscss") as  HTMLElement,
			savefile = this._qs(".savefile") as NodeList,
			listDensi: number[] = [-80, -60, -40, -20, 0, 20, 40, 60, 80],
			gama: string[] = [],
			gamaScss: string [] = [],
			lcScss: string[] = [],
			lc: string[] = [];
		Object.keys(this.listColors).forEach((name) => {
			let color = this.listColors[name]
			lc.push(`  --hc-${name}: ${color};`)
			lcScss.push(`$hc-${name}: ${color} !default;`)
		})
		listDensi.forEach((densi, ix) => {
			let c = lightOrDark(this.hex, densi),
				e = ix + 1;
			gama.push(`  --hc-gama-${e * 100}: ${c};`)
			gamaScss.push(`$gama-${e * 100}: ${c} !default;`)
		})

		codeCSS.innerHTML = `:root {
  /* LIST COLORS */
${lc.join("\n")}
/* currently selected color */
  --hc-hex: ${this.hex};
  --hc-hsl: hsl(${this.hue}, ${this.sat}%, ${this.light}%);
  --hc-hsla: hsla(${this.hue} ${this.sat}% ${this.light}% / ${this.alpha}%);
  --hc-rgb: rgb(${this.red}, ${this.green}, ${this.blue});
  --hc-rgba: rgba(${this.red} ${this.green} ${this.blue} / ${this.alpha}% );
  --hc-hwb: hwb(${this.hue}, ${this.white}%, ${this.black}%);
  /* GAMA */
${gama.join("\n")}
}`
		codeSCSS.innerHTML = `
  // LIST COLORS
${lcScss.join("\n")}
$hc-hex: ${this.hex} !default;
$hc-alpha: ${this.alpha} !default;
$hc-hsl: hsl(${this.hue}, ${this.sat}%, ${this.light}%) !default;
$hc-hsla: hsla(${this.hue} ${this.sat}% ${this.light}% / ${this.alpha}%) !default;
$hc-rgb: rgb(${this.red}, ${this.green}, ${this.blue}) !default;
$hc-rgba: rgba(${this.red} ${this.green} ${this.blue} / ${this.alpha}% ) !default;
$hc-hwb: hwb(${this.hue}, ${this.white}%, ${this.black}%) !default;
  // GAMA
${gamaScss.join("\n")}
`
		Array.from(savefile).forEach((el) => {
			let e: HTMLButtonElement = el as HTMLButtonElement,
				code: {[index: string]: string} = {
					css: (this._qs("#excss") as HTMLElement).innerHTML,
					scss: (this._qs("#exscss") as HTMLElement).innerHTML
				}
			/*	ext = 
			*/

			EV.add(e, 'click', () => {
				let ex: string = (e as HTMLButtonElement).getAttribute('data-file') as string
				
				if (isAndroid()) {
					saveFile(`HelperFile.${ex}`, code[ex].trim())
				} else {
					var a = document.createElement('a')
					const file = new Blob([code[ex].trim()], { 
						type: 'text/plain'
					})
					const url: string = URL.createObjectURL(file);
					a.href = url
					a.download = "helpercss."+ex
					a.click()
					URL.revokeObjectURL(url);
				}
			})
		})
	}
	private _events(el: HTMLInputElement) {
		let id = el.id == 'huewb' ? 'hue' : el.id,
			value: number = parseInt(el.value),
			type: string | null = el.getAttribute('data-type'),
			hex: string = this.hex;

		if (!not(type)) {
			if (type  as string == "hwb") {
				if ( id == "hue" ) {
					this.hue = value
				} else if ( id == "white") {
					this.white = value
				} else if ( id == "black" ) {
					this.black = value
				}
				hex = Hwb2Hex(this.hue, this.white, this.black, this.alpha) as string
			} else if (type as string == "rgb") {
				if ( id == "red" ) {
					this.red = value
				} else if ( id == "green") {
					this.green = value
				} else if ( id == "blue" ) {
					this.blue = value
				}
				hex = Rgb2Hex(this.red, this.green, this.blue, this.alpha) as string
			} else if ( type as string == 'hsl') {
				if ( id == "hue" ) {
					this.hue = value
				} else if ( id == "sat") {
					this.sat = value
				} else if ( id == "light" ) {
					this.light = value
				} else if ( id == "alpha" ) {
					this.alpha = value
				}
				hex = Hsl2Hex(this.hue, this.sat, this.light, this.alpha) as string
			}
		}
		
		this.setValue(hex)
	}

	private _nextElement(el: HTMLInputElement, value: string | number, sufi: string = ""): void {
		(el.nextElementSibling as HTMLElement).innerText = (value as string) + sufi
	}

	private _showOut() {
		(querySelector("#ohex") as HTMLElement).innerHTML = "HEX: "+this.hex;
		(querySelector("#orgba") as HTMLElement).innerHTML = `rgb(${this.red}, ${this.green}, ${this.blue})
rgba(${this.red} ${this.green} ${this.blue} / ${this.alpha}%)`;

		(querySelector("#ohwb") as HTMLElement).innerHTML = `hwb(${this.hue}, ${this.white}%, ${this.black}%)
hwb(${this.hue} ${this.white}% ${this.black}% / ${this.alpha}%)`;

		(querySelector("#ohsl") as HTMLElement).innerHTML = `hsl(${this.hue}, ${this.sat}%, ${this.light})
hsla(${this.hue} ${this.sat}% ${this.light}% / ${this.alpha}%)`;
		this.output.style.background = this.hex
		this.output.style.color  = isDark(this.hex) ? listColor.white : listColor.ligthDark
		this.output.setAttribute("data-clipboard-text", JSON.stringify({
			hex: this.hex,
			rgb: [this.red, this.green, this.blue],
			hsl: [this.hue, this.sat, this.light],
			hwb: [this.hue, this.white, this.black]
		}))
	}

	private _generateGama() {
		let color: string = Hsl2Hex(this.hue, this.sat, this.light, this.alpha) as string,
			listDensi: number[] = [-80, -60, -40, -20, 0, 20, 40, 60, 80]

		this.gamaParent.innerHTML = ""

		listDensi.forEach((densi: number) => {
			let fontcolor: string = isDark(color) ? listColor.white : listColor.ligthDark,
				div: HTMLElement = document.createElement('div')
			
			div.classList.add("gama-item")
			if (densi === 0) {
				div.classList.add("active")
				div.style.background = color
				div.style.color = fontcolor
				div.setAttribute("data-color",color)
				div.setAttribute("data-clipboard-text",color)
				div.setAttribute("data-clipboard", "true")
				div.innerText = color
			} else {
				let c = lightOrDark(color, densi);
				fontcolor = isDark(c) ? listColor.white : listColor.ligthDark;
				div.style.background = c
				div.style.color = fontcolor
				div.setAttribute("data-color",c)
				div.setAttribute("data-clipboard-text",c)
				div.setAttribute("data-clipboard", "true")
				div.innerText = c
			}
			this.gamaParent.append(div)
		});
	}

	private _startEvent() {
		// Set EVENTS
		Array.from( querySelector("input.control") as NodeList).forEach((el) => {
			EV.add(el as HTMLInputElement, 'input', (e: Event) => this._events(e.target as HTMLInputElement) )
			EV.add(el as HTMLInputElement, 'change', (e: Event) => this._events(e.target as HTMLInputElement) )
		})

		const hex = (e: Event) => {
			let gext = (e.target as HTMLInputElement).value,
				vl = gext.length;
			
			if ( (vl >= 4 && vl <= 5) || (vl >= 7 && vl <= 9)){
				this.setValue(gext)
			}			
		}
		EV.add(this.controls.hex, 'input', hex, false)
	}

	setValue(hex: string | null = null){
		this.hex = hex == null ? this.hex : hex
		this.HSL = Hex2Hsl(this.hex) as ObjHSLA
		this.RGB = Hex2Rgb(this.hex) as ObjRGBA
		this.HWB = Hex2Hwb(this.hex) as ObjHWBA

		this._setHueGrandient(this.controls.hsl.hue, this.HSL);
		
		["sat", "light", "alpha"].forEach((n) => {
			let el: HTMLInputElement = n == "alpha" ? this.controls.alpha : this.controls.hsl[n]

			this._setGrandient(el, [
				`hsla(${this.hue}, ${this.sat}%, 0%, ${this.alpha})`,
				`hsla(${this.hue}, ${this.sat}%, 20%, ${this.alpha})`,
				`hsla(${this.hue}, ${this.sat}%, 40%, ${this.alpha})`,
				`hsla(${this.hue}, ${this.sat}%, 60%, ${this.alpha})`,
				`hsla(${this.hue}, ${this.sat}%, 80%, ${this.alpha})`,
				`hsla(${this.hue}, ${this.sat}%, 100%, ${this.alpha})`
			])
		})

		this._showOut()
		this._generateGama()
		DB.set(
			"colorpiker", 
			this.hex
		)
		DB.set(
			"coloralpha", 
			this.alpha
		)
	}
	
	// HSL
	set hue(h:number) {
		this.controls.hsl.hue.value = "" + h;
		this.controls.hwb.huewb.value = "" + h;
		// SHOW VALUE 
		this._nextElement(this.controls.hsl.hue, h)
		this._nextElement(this.controls.hwb.huewb, h)
	}

	set sat(s:number) {
		this.controls.hsl.sat.value = "" + s;
		this._nextElement(this.controls.hsl.sat, s, "%")
	}

	set light(l:number) {
		this.controls.hsl.light.value = "" + l;
		this._nextElement(this.controls.hsl.light, l, "%")
	}

	get hue() {
		return parseInt(this.controls.hsl.hue.value) === parseInt(this.controls.hwb.huewb.value) ? 
			parseInt(this.controls.hsl.hue.value) :
			(Rgb2Hsl(this.red, this.green, this.blue, this.alpha) as ObjHSLA).h
	}

	get sat() {
		return parseInt(this.controls.hsl.sat.value)
	}

	get light() {
		return parseInt(this.controls.hsl.light.value)
	}

	// ALPHA
	set alpha(a:number) {
		this.controls.alpha.value = "" + a;
		this._nextElement(this.controls.alpha, a, "%")
	}

	get alpha() {
		return parseInt(this.controls.alpha.value)
	}
	// RGB
	set red(r:number) {
		this.controls.rgb.red.value = "" + r;
		this._nextElement(this.controls.rgb.red, r)

	}
	set green(g:number) {
		this.controls.rgb.green.value = "" + g;
		this._nextElement(this.controls.rgb.green, g)
	}
	set blue(b:number) {
		this.controls.rgb.blue.value = "" + b;
		this._nextElement(this.controls.rgb.blue, b)
	}

	get red() {
		return parseInt(this.controls.rgb.red.value)
	}
	get green() {
		return parseInt(this.controls.rgb.green.value)
	}
	get blue() {
		return parseInt(this.controls.rgb.blue.value)
	}
	// HWB
	set white(w:number) {
		this.controls.hwb.white.value = "" + w;
		this._nextElement(this.controls.hwb.white, w, "%")
	}
	set black(b:number) {
		this.controls.hwb.black.value = "" + b;
		this._nextElement(this.controls.hwb.black, b, "%")
	}
	
	get white() {
		return parseInt(this.controls.hwb.white.value)
	}
	get black() {
		return parseInt(this.controls.hwb.black.value)
	}
	// HEX
	set hex(hx: string) {
		this.controls.hex.value = hx;
	}

	get hex() {
		return this.controls.hex.value
	}

	// setFull
	set HSL(o: ObjHSLA) {
		this.hue = o.h
		this.sat = o.s
		this.light = o.l
	}

	get HSL() {
		return {
			h: this.hue,
			s: this.sat,
			l: this.light,
			a: this.alpha
		}
	}

	set RGB(o: ObjRGBA) {
		this.red = o.r
		this.green = o.g
		this.blue = o.b
	}

	get RGB() {
		return {
			r: this.red,
			g: this.green,
			b: this.blue,
			a: this.alpha
		}
	}
	
	set HWB(o: ObjHWBA) {
		this.hue = o.h
		this.white = o.w
		this.black = o.b
	}

	get HWB() {
		return {
			h: this.hue,
			w: this.white,
			b: this.black,
			a: this.alpha
		}
	}
}