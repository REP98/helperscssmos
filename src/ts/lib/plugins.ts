import Toastify from 'toastify-js'
import { ToastifyOptions, toptions } from "../types";

export const Toast = (text: string = "", cls: string = "primary", autoClose: boolean = true): void => {
    cls = cls.indexOf("bg-") > -1 ? cls : `bg-${cls}`
    var o: ToastifyOptions = Object.assign({}, toptions, {
        text,
        className: cls
    })
    if(autoClose == false) {
        o.duration = -1
        o.close = true
    }
    Toastify(o).showToast()
}

Object.assign(
    window,
    {
        Toast
    }
)