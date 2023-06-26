import * as BS from 'bootstrap'
import { Event } from './lib/fascino'
import { OptionsDefaultCalculator } from './types'
import DB from './lib/db'
import './lib/plugins'
import CalculatorHTML from './calculate'
import  * as Colors from './lib/colors'
import WheelPikers, {listColor} from "./lib/WheelPikers";

Object.assign(window, { BS, C: Colors, listColor })

Event.add(document, 'DOMContentLoaded', () => {
    // Inicializamos La DB
    if (DB.get('formcalculator', false) === false) {
        DB.set("formcalculator", OptionsDefaultCalculator)
    }

    CalculatorHTML()
    new WheelPikers(null)

}, false)
