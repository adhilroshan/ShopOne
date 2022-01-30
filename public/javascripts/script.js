function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1 
                $("#cart-count").html(count)
            }
            alert(response)
        }
    })
    console.log("ajax Called");
}
function delProduct(cartId,proId){
    $.ajax({
        url:'/delete-product',
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            console.log(response)
            if(response.removeProduct){
                alert("Product Removed from cart")
                location.reload()
            }else{
                location.reload()
            }
        }
    })
}
function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1 
                $("#cart-count").html(count)
            }
        }
    })
    console.log("ajax Called");
}