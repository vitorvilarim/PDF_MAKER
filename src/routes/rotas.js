const express = require('express');
const knex = require('../database/conection');
const PdfPrinter = require('pdfmake');
const fs = require('fs');
const rotas = express();

rotas.get('/produtos', async (req, res) => {
    const listarProdutos = await knex('produtos');

    return res.json(listarProdutos);
});


rotas.get('/produtos/report', async (req, res) => {
    try {
        const listarProdutos = await knex('produtos');


        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };

        const printer = new PdfPrinter(fonts);

        const body = [];

        const columnsTitle = [
            { text: "ID", style: "columnsTitle" },
            { text: "Descrição", style: "columnsTitle" },
            { text: "Preço", style: "columnsTitle" },
            { text: "Quantidade", style: "columnsTitle" },
        ];

        const columnsBody = new Array();

        columnsTitle.forEach((column) => columnsBody.push(column));
        body.push(columnsBody);

        for await (let product of listarProdutos) {
            const rows = new Array();
            rows.push(product.id);
            rows.push(product.description);
            rows.push(product.price);
            rows.push(product.quantity);

            body.push(rows);
        }


        const docDefinitions = {
            defaultStyle: {
                font: 'Helvetica'
            },
            content: [
                {
                    columns: [
                        { text: "Relatótio de produtos", style: "header" },
                        { text: "01/10/2021 11:00hs\n\n", style: "header" },
                    ]
                },
                {
                    table: {
                        heights: function (row) {
                            return 30;
                        },
                        body
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                },
                columnsTitle: {
                    fontSize: 15,
                    bold: true,
                    fillColor: "#7159c1",
                    color: "#FFF"
                }
            }
        }


        const pdfDoc = printer.createPdfKitDocument(docDefinitions);

        // pdfDoc.pipe(fs.createWriteStream('Relatorio.pdf'));

        const chunks = [];

        pdfDoc.on("data", (chunk) => {
            chunks.push(chunk);
        })

        pdfDoc.end();

        pdfDoc.on("end", () => {
            const results = Buffer.concat(chunks);
            return res.end(results);
        });
    } catch (error) {
        console.log(error.message);
    }




    // return res.send("Relatório concluído!");
})

module.exports = rotas;
