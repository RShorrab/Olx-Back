const clientIO = io("http://localhost:3000/")

let productCartona= `` 
clientIO.on('addProduct', data =>
{
    displayProduct(data)
})
clientIO.on('updateProduct', data =>
{
    updateProduct(data)
})
clientIO.on('deleteProduct', data =>
{
    deleteProduct(data)
})


function displayProduct(data)
{
    for (let i = 0; i < data.length; i++) 
    {
        productCartona += 
        `
        <div class=" col-md-4 col-sm-6 text-center p-2" id='productID_${data[i]._id}' >
            <div class="border rounded">
                <div style="height: 200px;"> <img src='../BE/${data[i].image}' alt="product pic" class=" w-100 h-100 img-fluid"> </div>
                <h5 class="mt-2">${data[i].product_title}</h5>
                <p class="">${data[i].product_desc}</p>
                <p class="text-muted">${'$'+ data[i].product_price}</p>

    
                <button type="button" class="btn btn-warning text-light my-3" data-toggle="modal" data-target="#productModel_${data[i]._id}">
                    Comments
                </button>

                <div class="modal fade" id="productModel_${data[i]._id}" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-content">
                        <div class="modal-header">
                            <h5>Comments</h5>
                            <button class="close" data-dismiss="modal" aria-label="Close">  <span aria-hidden="true">&times;</span>    </button>
                        </div>

                        <div class="modal-body container">
                            <div class="row justify-content-center" id='${data[i]._id}'> 
                            
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
        `
    }
    $(".products").html(productCartona)
}
function updateProduct(data)
{
    let product = document.getElementById(data[0]._id)
    let updatedProduct = 
    `
    <div class="col-lg-3 col-md-4 col-sm-6 text-center p-2 id='${data[1]._id}"  >
        <div class="border rounded">
            <div style="height: 200px;"> <img src='../BE/${data[1].image}' alt="product pic" class=" w-100 h-100 img-fluid"> </div>
            <h5 class="mt-2">${data[1].product_title}</h5>
            <p class="">${data[1].product_desc}</p>
            <p class="text-muted">${'$'+ data[1].product_price}</p>
        </div>
    </div>
    `
    product.outerHTML = updatedProduct
}
function deleteProduct(data)
{
    let product = document.getElementById(`productID_${data._id}`)
    product.remove()
}



clientIO.on('addComment', data =>
{
    displayComments(data)
})
clientIO.on('addReply', data =>
{
    addReply(data)
})

function displayComments(data)
{
    
    for (let i = 0; i < data.length; i++) 
    {
        let commentsCartona = ``
        let replies = ``
        let replies2 = `` 
        if(data[i].reply.length > 0)
        {
            data[i].reply.forEach( element => 
            {
                if(element.reply.length > 0) //searching for better sol. this is till replies Level 2 only.
                {
                    element.reply.forEach(reply => 
                    {
                        replies2 += `<p class="ml-4 mb-1 text-secondary"> <span class="badge badge-secondary text-secondary rounded-circle mr-1" style="width: 15px; height: 15px;">.</span> ${reply.comment_body}</p>`
                    })
                }
                replies +=  
                `<div>
                    <p class="ml-4 mb-1 text-secondary"> <span class="badge badge-secondary text-secondary rounded-circle mr-1" style="width: 15px; height: 15px;">.</span> ${element.comment_body}</p>
                    <div class="ml-5"  id="${element._id}" >
                        ${replies2}
                    </div>
                </div>
                `
            });
        }

        commentsCartona += 
        `
        <div class="col-11 text-left p-2 m-2 border rounded">
            <p class="mb-2"> <span class="badge badge-dark text-dark rounded-circle mr-1 " style="width: 15px; height: 15px;">.</span> ${data[i].comment_body} </p>
            <div class="reply" id="${data[i]._id}" >
                ${replies? replies : ''}      
            </div>
        </div>
        `

        const product = document.getElementById(data[i].product_id )
        product.innerHTML += commentsCartona
    }
    
}
function addReply(data)
{
    let reply = ``
    reply += 
        `
        <p class="ml-4 mb-1 text-secondary"> <span class="badge badge-secondary text-secondary rounded-circle mr-1" style="width: 15px; height: 15px;">.</span> ${data.comment_body}</p>
        <div class="ml-5"  id="${data._id}">  </div>
        `
    const parentComment = document.getElementById(data.parentComment)
    parentComment.innerHTML += reply
}
/* 
//need to handle comment/parent id 
clientIO.on('deleteComment', data =>
{
    deleteComment(data)
})
function deleteComment(data)
{
    let comment = document.getElementById(data._id)
    comment.remove()
} 
*/ 