import { Collapse } from 'bootstrap'
import { Toast } from './lib/plugins'
import * as CV from './lib/converter'
import { Event, not, querySelector } from './lib/fascino'
import { Calculator, ObjectForm, OptionsDefaultCalculator } from './types'
import DB, { ORM } from './lib/db'

const ObjectF: {[index: string]:any} = {
    form: (querySelector('form#convertes') as HTMLFormElement),
    base: (querySelector("#base") as HTMLInputElement),
    decimal: (querySelector("#decimales") as HTMLInputElement),
    number: (querySelector("#numero") as HTMLInputElement),
    rnumber: (querySelector("#rnumero") as HTMLInputElement),
    medidas: {
        to: (querySelector("#medida1") as HTMLSelectElement),
        from: (querySelector("#medida2") as HTMLSelectElement)
    },
    btnConvert: (querySelector("#convertir") as HTMLButtonElement),
    output: (querySelector("#output code") as HTMLElement)
}

function toName(n: string): string {
    if (n == 'decimal') { return "decimales" }
    if (n == 'result') { return "rnumero" }
    return n
}

const validateMessage: ObjectForm = {
    "base": 'Debe establecer una <strong>Base de Calculo</strong>',
    "decimales": "Debe establecer una cantidad de <strong>Decimales</stron>",
    "medida1": "Indique una medida valida",
    "medida2": "Indique una medida valida",
    "numero": "Añada un valor a calcular",
    "rnumero": "Añada un valor a calcular"
}
function validateElemet(): boolean {
    Array.from(ObjectF.form.elements).forEach((el) => {
        var e = (el as HTMLInputElement | HTMLSelectElement)
        if (not(e.value)) {
            Toast(
                validateMessage[e.name], 
                "danger"
            )
            e.focus()
            return false
        }
    })

    if (ObjectF.number.value == "0") {
        Toast("Debe indicar un valor mayor que <code>0</code>")
        ObjectF.number.focus()
        return false
    }
    if (ObjectF.base.value == "0") {
        Toast(validateMessage.base, "danger")
        ObjectF.base.focus()
        return false
    }
    if (!ObjectF.form.checkValidity()) {
        Array.from(ObjectF.form.elements).forEach((el) => {
            var e: HTMLInputElement | HTMLSelectElement = (el as HTMLInputElement | HTMLSelectElement)
            if(e.validity.valid == false) {
              Toast(e.validationMessage, "danger")
              e.focus()
              return false
            }
        })
    }
    return true
}

function clearNper(meansure: string): string {
    return meansure == "n%" ? "%" : meansure.toUpperCase()
}

function calculate (): void {
    if ( ObjectF.medidas.to.value == ObjectF.medidas.from.value ) {
        Toast("Las Medidas no pueden ser iguales", "danger")
        return;
    }

    // Calculamos los Valores
    if (validateElemet() == false) {
        ObjectF.form.classList.add("was-validated")
        return;
    } else {
        ObjectF.form.classList.remove("was-validated")
    }
    CV.loadfunction(ObjectF)
    ObjectF.output.innerText = `${ObjectF.number.value}${clearNper(ObjectF.medidas.to.value)} <=> ${ObjectF.rnumber.value}${clearNper(ObjectF.medidas.from.value)} `
    
    var c = Collapse.getOrCreateInstance("#output")

    if ((querySelector("#output") as HTMLElement).classList.contains("show")) {
        c.show()
    }

    // Añadimos a la DB
    ORM.Calculator.set(ObjectF.form)
}
function ifOrMeasure(to: string, from: string, med: string): boolean {
    return (to == med || from == med )
}

function inMeasure(to: string, from: string, arr: string[]): boolean {
    return (arr.indexOf(to) > -1 || arr.indexOf(from) > -1)
}

function updateBases(): void {
    var to = ObjectF.medidas.to.value.toLowerCase(),
        from = ObjectF.medidas.from.value.toLowerCase()

    if (ifOrMeasure(to, from, "vw")) {
        (querySelector("#des-1") as HTMLSpanElement).innerText = "Ancho: "
        let newBase: string = "" + window.screen.width
        ORM.Calculator.setItem('base', newBase);
        ObjectF.base.value = newBase
    } else if(ifOrMeasure(to, from, "vh")){
        (querySelector("#des-1") as HTMLSpanElement).innerText = "Altura: "
        let newBase1: string = "" + window.screen.height
        ORM.Calculator.setItem('base', newBase1);
        ObjectF.base.value = newBase1
    } else if(inMeasure(to, from, ["cm", "mm", "in", "pt", "pc"])) {
        (querySelector("#des-1") as HTMLSpanElement).innerText = "PPI/DPI"
        ORM.Calculator.setItem('base', 96);
        ObjectF.base.value = "96"
    } else {
        (querySelector("#des-1") as HTMLSpanElement).innerText = "Base en PX: "
        ORM.Calculator.setItem('base', 16);
        ObjectF.base.value = "16"
    }

    if (["cm", "mm"].indexOf(to) > -1 && ["vw", "vh"].indexOf(from) > -1) {
        let x: string = "" + (from == "vw" ? window.screen.width : window.screen.height),
            t: string = from == "vw" ? "Ancho: " : "Alto: ";

            (querySelector("#des-1") as HTMLSpanElement).innerText = t
            ORM.Calculator.setItem('base', x);
            ObjectF.base.value = x
    }
}

export default function CalculatorHTML() {
    var form = querySelector('form#convertes') as HTMLFormElement,
        o: Calculator = Object.assign(OptionsDefaultCalculator, DB.get('formcalculator', {}));

    // Establecemos Valores por defecto o previamente cargados
    Object.keys(o).forEach((name) => {
        if ( name == 'medidas') {
            var sm = querySelector("#medida1", form)! as HTMLSelectElement,
                sm1 = querySelector("#medida2", form)! as HTMLSelectElement;
            sm.value = o.medidas.to
            sm1.value = o.medidas.from
        } else {
            let nm = toName(name)
            var i = querySelector(`#${nm}`, form)! as HTMLInputElement;
            i.value = o[(name as string)]
        }        
    })

    // EVENTOS
    Array.from(querySelector("#medida1, #medida2") as NodeList).forEach((el) => {
        Event.add((el as HTMLElement), 'change', () => {
            updateBases()
            calculate()
        })
    })
 
    Array.from(querySelector("input", ObjectF.form) as NodeList).forEach((el) => {
        ["input", "change"].forEach((ev) => {
            Event.add((el as HTMLInputElement), ev, calculate)
        })
    })

    Event.add(ObjectF.form, "submit", (e) => {
        e.preventDefault()
        e.stopPropagation()
        calculate()
    })

    Event.add(ObjectF.btnConvert, "click", calculate)
}