import {digitCount} from './helpers'

export default class ExhibitPDF {
    static Page = class{
        constructor({width, height}){
            this.width = width
            this.height = height
        }
    }

    constructor({pages}){
        this.pages = pages
    }

    get utf8(){
        let page = (object)=>`${object} 0 obj\n  << /Type /Page\n    /Parent 3 0 R\n    /MediaBox [0 0 612 792]\n    /Contents ${object+this.pages.length} 0 R\n    /Resources << /ProcSet 6 0 R >>\n  >>\nendobj\n\n`
        let content = (object)=>`${object} 0 obj\n << /Length 1 >>\nstream\nendstream\nendobj\n\n`
        let decimal = (number)=>{
            let output = ``
            for(let i = 0; i < 10 - digitCount(number); i++){
                output += '0'
            }
            return output + number
        }

        let objects = 3
        let pdf = `%PDF-1.4\n1 0 obj\n  << /Type /Catalog\n    /Outlines 2 0 R\n    /Pages 3 0 R\n  >>\nendobj\n\n2 0 obj\n  << /Type Outlines\n    /Count 0\n  >>\nendobj\n`
        
        pdf +=  `\n3 0 obj\n  << /Type /Pages\n    /Kids [\n`
        for(let i = 1; i <= this.pages.length; i++){
            pdf+=`      ${objects+i} 0 R\n`
        }
        pdf += `    ]\n    /Count ${this.pages.length}\n  >>\nendobj\n\n`
        for(let i = 0; i < this.pages.length; i++){
            pdf += page(++objects)
        }
        for(let i = 0; i < this.pages.length; i++){
            pdf += content(++objects)
        }
        pdf += `${++objects} 0 obj\n  [/PDF]\nendobj\n\nxref\n0 ${objects+1}\n0000000000 65535 f\n`
        for(let i = 1; i <= objects; i++){
            pdf += decimal(pdf.search(`${i} 0 obj`)) + ' 00000 n\n'
        }
        pdf += `\ntrailer\n  << /Size ${objects+1}\n    /Root 1 0 R\n  >>\nstartxref\n${pdf.search('xref')}\n%Steamroller Copies`


        console.log(pdf)
        console.log(pdf.search("1 0 obj"))
    }
}