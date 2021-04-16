//variables
const cartBtn=document.querySelector('.cart-btn');
const closeCartBtn=document.querySelector('.close-cart');
const clearCartBtn=document.querySelector('.clear-cart');
const cartDOM=document.querySelector('.cart');
const cartOverlay=document.querySelector('.cart-overlay');
const cartItems=document.querySelector('.cart-items');
const cartTotal=document.querySelector('.cart-total');
const cartContent=document.querySelector('.cart-content');
const productsDOM=document.querySelector('.products-center');


//cart 
let cart=[];
//buttons 
let buttonsDOM=[]




//getting Products
class Products{
    async getProducts(){
        try{
      let result= await fetch('js/products.json')
      let data=await result.json();
      let products=data.items;
      products=products.map(item=>{
    const{title,price}=item.fields;
    const{id}=item.sys;
    const image=item.fields.image.fields.file.url;

    return {title,price,id,image}
      })
      return products
        } catch(error){
            console.error(error);
        }
    }
}
//displayProducts
class UI{

    displayProducts(products){
        let result='';
        products.forEach(product => {
            result+=`
            <!--Single product-->
            <article class="product">
                <div class="img-container">
                    <img src=${product.image} alt="Product 1" class="product-img">
                    <button class="bag-btn" data-id=${product.id}>
                        <i class="fas fa-shopping-cart"></i>
                        add to bag
                    </button>
                </div>
                <h3>${product.title}</h3>
                <h4>$${product.price}</h4>
            </article>
         <!--end of Single product-->
            `;

        });
        productsDOM.innerHTML=result;
    }
    getBagButtons(){
        const buttons=[...document.querySelectorAll(".bag-btn")];
        buttonsDOM=buttons;
        buttons.forEach(button=>{

            let id=button.dataset.id;
            let inCart=cart.find(item=>item.id==id);
            if(inCart){
                button.innerText="In Cart";
                button.disabled=true;
            }
            else{
                button.addEventListener('click',event=>{
                   event.target.innerText="In Cart";
                   event.target.disabled=true;
                    //get product from products
                    let cartItem={...Storage.getProduct(id),amount:1};
                    //add product to the cart
                    cart=[...cart,cartItem];
                    //save cart in local storage
                    Storage.saveCart(cart)
                    //set cart values
                    this.setCartValues(cart);
                    //display cart item
                    this.addCartItem(cartItem);
                    // show the cart
                    this.showCart();
                })


            }
        })
    };
    setCartValues(cart){
   
        let tempTotal=0;
        let itemsTotal=0;
        cart.map(item=>{
            tempTotal+=item.price*item.amount;
            itemsTotal+=item.amount;
        })
        cartTotal.innerText=parseFloat(tempTotal.toFixed(2))
        cartItems.innerText=itemsTotal;
        
    };
    addCartItem(item){
        const div=document.createElement('div');
        div.classList.add('cart-item');
        div.innerHTML=`
        <img src="${item.image}" alt="product">
                    <div>
                        <h4>${item.title}</h4>
                        <h5>${item.price}</h5>
                        <span class="remove-item" data-id=${item.id}>remove</span>
                    </div>
                    <div>
                        <i class="fas fa-chevron-up" data-id=${item.id}></i>
                        <p class="item-amount">${item.amount}</p>
                        <i class="fas fa-chevron-down" data-id=${item.id}></i>
                    </div>`;
        cartContent.appendChild(div);
        
    }
    showCart(){
        cartOverlay.classList.add('transparentBcg');
        cartDOM.classList.add('showCart');
  
    }
    setupAPP(){
        cart=Storage.getCart();
        this.setCartValues(cart);
        this.populateCart(cart);
        cartBtn.addEventListener('click',this.showCart)
        closeCartBtn.addEventListener('click',this.closeCart)
    }
    populateCart(cart){

        cart.forEach(item=>this.addCartItem(item));
    }
    closeCart(){

            cartOverlay.classList.remove('transparentBcg');
            cartDOM.classList.remove('showCart');      
    }
    cartLogic(){
clearCartBtn.addEventListener("click", ()=>{

this.clearCart();

});

cartContent.addEventListener('click',event=>{
if(event.target.classList.contains('remove-item')){

    let removeItem=event.target;
    let id=event.target.dataset.id; 
    cartContent.removeChild(removeItem.parentElement.parentElement)
    this.removeItem(id);
}
else if(event.target.classList.contains('fa-chevron-up')){

    let addAmount=event.target;
    let id=addAmount.dataset.id;
    let tempItem=cart.find(item=>item.id===id);
    tempItem.amount=tempItem.amount+1;
    Storage.saveCart(cart);
    this.setCartValues(cart);
    addAmount.nextElementSibling.innerText=tempItem.amount;


}
else if(event.target.classList.contains('fa-chevron-down')){

    let addAmount=event.target;
    let id=addAmount.dataset.id;
    let tempItem=cart.find(item=>item.id===id);
    tempItem.amount=tempItem.amount-1;
    if(tempItem.amount>0){
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.previousElementSibling.innerText=tempItem.amount;
    }
    else{
        cartContent.removeChild(addAmount.parentElement.parentElement);
        this.removeItem(id);
    }

}


});

    }
    clearCart(){
        let cartItems=cart.map(item=>item.id);
        console.log(cartItems);
        cartItems.forEach(id=>this.removeItem(id));
        while(cartContent.children.length>0){
            cartContent.removeChild(cartContent.children[0])
        }
        this.closeCart();
        window.location.reload();
    }
    removeItem(id){
        cart=cart.filter(item=>item.id!=id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button1=this.getSingleButton(id);
        button1.disabled=false;
        button1.innerHTML=`<i class="fas fa-shopping-cart"> </i>add to cart`;

    }
    getSingleButton(id){
        return buttonsDOM.find(button=>button.dataset.id===id);
    }
}

//local storage
class Storage{

    static saveProducts(products)
    {
      localStorage.setItem("products",JSON.stringify(products));
    }
    static getProduct(id)
    {
        let products=JSON.parse(localStorage.getItem('products'));
        return products.find(product=>product.id==id);
    }
    static saveCart(cart){
        localStorage.setItem('carts',JSON.stringify(cart));
    }
    static getCart()
    {
        let cards=localStorage.getItem('carts')?JSON.parse(localStorage.getItem('carts')):[];
        return cards;
    }
}

document.addEventListener("DOMContentLoaded",()=>{
const ui=new UI();
const products=new Products();
ui.setupAPP();
ui.cartLogic();
//get all products

products.getProducts().then(products=>{

    ui.displayProducts(products);
     Storage.saveProducts(products);
}).then(()=>{

ui.getBagButtons();


});

});


