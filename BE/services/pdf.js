const fs = require("fs");
const PDFDocument = require("pdfkit");

function createInvoice(invoice, path) 
{
  let doc = new PDFDocument({ size: "A4", margin: 50 });

  generateSheetHeader(doc);
  generateSheetInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc);

  doc.end();
  doc.pipe(fs.createWriteStream(path));
}



function generateSheetHeader(doc) 
{
  doc
    .image("olx-logo.png", 50, 35, { width: 70 })

    .fontSize(10)
    .fillColor("grey")
    .text("OLX Inc.", 200, 50, { align: "right" })
    .text("123 Main Street", 200, 65, { align: "right" })
    .text("New York, NY, 10025", 200, 80, { align: "right" })
    .moveDown();
}
function generateSheetInformation(doc, invoice) 
{
  doc
    .fillColor("#444444")
    .fontSize(20)
    .text("New Products", 50, 160);

  generateHr(doc, 185, "#d0f284");

  const customerInformationTop = 193;

  doc
    .fontSize(10)
    .text("Sheet Number:", 55, customerInformationTop)
    .font("Helvetica-Bold")
    .text(invoice.sheet_number, 155, customerInformationTop)
    
    .font("Helvetica")
    .text("Date:", 300, customerInformationTop )
    .text(formatDate(new Date()), 350, customerInformationTop )
    .moveDown()

  generateHr(doc, 210, "#d0f284");
}

function generateInvoiceTable(doc, invoice) 
{
  let i;
  const invoiceTableTop = 330;
  doc.font("Helvetica-Bold");
  generateTableRow( doc, invoiceTableTop,
    "Product",
    "Product ID",
    "Title",
    "Description",
    "Price"
  );

  generateHr(doc, invoiceTableTop + 20, "#d0f284");
  doc.font("Helvetica");

  for (i = 0; i < invoice.products.length; i++) {
    const product = invoice.products[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(doc, position,
      i+1,
      product._id,
      product.product_title,
      product.product_desc,
      formatCurrency(product.product_price)
    );

    generateHr(doc, position + 20, "#9fcc48");
  }

  doc.font("Helvetica");
}
function generateTableRow( doc, y,
  index,
  product_ID,
  product_title,
  product_desc,
  product_price,
) 
{
  doc
    .fontSize(10)
    .text(index, 55, y, {width: 40, align: "left" })
    .text(product_ID, 100, y, {width: 140, align: "center" })
    .text(product_title, 240, y, {width: 100, align: "center" })
    .text(product_desc, 320, y, { width: 160, align: "center"})
    .text(product_price, 490, y, { width: 50, align: "center"})
}


function generateFooter(doc) 
{
  doc
    .fontSize(10)
    .fillColor("grey")
    .text(
      "This is a list of all the products added toady.",
      50,
      780,
      { align: "center", width: 500 }
    );
}
function generateHr(doc, y, color = "#aaaaaa") 
{
  doc
    .strokeColor(color)
    .lineWidth(1)
    .moveTo(50, y)
    .lineTo(550, y)
    .stroke();
}
function formatCurrency(price) 
{
  return "$" + price;
}
function formatDate(date) 
{
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  
  return day + "/" + month + "/" + year ;
}

module.exports = 
{
  createInvoice
}