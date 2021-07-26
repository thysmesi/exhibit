import fs from 'fs'
import {sampleImage} from './tests.js'
import pdfmake from 'pdfmake'
// import pdf from './exhibit-pdf-kit.js'

var printer = new pdfmake();

var docDefinition = {
    pageMargins: [0, 0, 0, 0],
    content: [
        {
            image: 'sample',
            width: 100,
            absolutePosition: { x: 100, y: 100 }
        }
    ],

    images: {
        sample: sampleImage,
    }
};

var options = {
    
}

var pdfDoc = printer.createPdfKitDocument(docDefinition, options);
pdfDoc.pipe(fs.createWriteStream('document.pdf'));
pdfDoc.end();