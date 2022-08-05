
import './App.css';
import React from 'react';
import $ from 'jquery';

class CheckOutPage extends React.Component{
  constructor(props){
    super(props)
  }

  componentDidMount(){
    this.props.getSessionInfo();
  }
  

  render(){
    return(
      <div>
        <p class='middle'>✓ You have successfully placed order for {this.props.totalnum} item(s)</p>
        <p class='middle'>${this.props.amount} paid</p>
      </div>
    )
  }
  
}

class CartRow extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      quantity: props.product.quantity
    }
    this.handleLocalInputChange = this.handleLocalInputChange.bind(this);
  }

  handleLocalInputChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({[name]: value});
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.quantity !== prevState.quantity){
      if(this.state.quantity != 0){
        $.ajax(
          {xhrFields: {withCredentials: true},
          type: "PUT",
          url: `http://localhost:3001/updatecart`,
          data: {productId: this.props.product._id, quantity: this.state.quantity}
        }).done(function(result){
          console.log(result)
          if (!result.err){
            this.props.loadShoppingCart()
            this.props.getSessionInfo()
          }
        }.bind(this))
      }
      else{
        $.ajax(
          {xhrFields: {withCredentials: true},
          type: "DELETE",
          url: `http://localhost:3001/deletefromcart/${this.props.product._id}`,
        }).done(function(result){
          console.log(result)
          if (!result.err){
            this.props.loadShoppingCart()
            this.props.getSessionInfo()
          }
        }.bind(this))
      }
    }
      
  }

  render(){
    return(
    <tr>
      <td><img src={`http://localhost:3001/${this.props.product.productImage}`} class='cart-page-image'></img></td>
      <td class='name'>{this.props.product.name}</td>
      <td class='product-price'>${this.props.product.price}</td>
      <td><input name='quantity' value={this.state.quantity} type='number' min='0' max='99' onChange={e=>this.handleLocalInputChange(e)}></input></td>
    </tr>
  )
  }
  
}

class ShoppingCartPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      cart: new Array(),
      subtotal: ""
    }
    this.loadShoppingCart = this.loadShoppingCart.bind(this);
    this.handleCheckOut = this.handleCheckOut.bind(this);
  }

  loadShoppingCart(){
    $.ajax(
      {xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/loadcart`
    }).done(function(result){
      console.log(result)
      if (!result.err){
        result = JSON.parse(result)
        var total = 0
        for (var i = 0; i < result.cart.length; i++){
          total += result.cart[i].price * result.cart[i].quantity
        }
        this.setState(
          {
            cart: result.cart,
            subtotal: total
          }
        )
      }
    }.bind(this))
  }

  handleCheckOut(){
    this.props.recordCheckOut(this.props.totalnum, this.state.subtotal)
    if (this.props.totalnum != 0){
      $.ajax(
        {xhrFields: {withCredentials: true},
        type: "GET",
        url: `http://localhost:3001/checkout`
      }).done(function(result){
        if (!result.err){
          if (result.msg == ""){
            this.props.handlePageChange("checkOut")
          }
        }
      }.bind(this))
    }
    
  }

  componentDidMount(){
    this.loadShoppingCart()
  }

  render(){
    if (this.props.totalnum != 0){
      return(
        <div>
          <h2>Shopping cart</h2>
          <table>
            <tr>
              <th></th>
              <th></th>
              <th>Price:</th>
              <th>Quantity:</th>
            </tr>
            {
              this.state.cart.map((product=>{
                console.log(product)
                return <CartRow product={product} loadShoppingCart={this.loadShoppingCart} getSessionInfo={this.props.getSessionInfo}/>
              }))
            }
            
          </table>
          <p class='middle'>Cart subtotal ({this.props.totalnum} item(s)): ${this.state.subtotal}</p>
          <div class='checkOutbutton'>
            <input type='button' value='Proceed to check out' onClick={e=>this.handleCheckOut()}></input>
          </div>
          
        </div>
      )
    }
    else{
      return(
        <div>
          <h2>Shopping cart</h2>
          <h1 class='middle'>Nothing in your Cart.</h1>
          <p class='middle'>Cart subtotal ({this.props.totalnum} item(s)): ${this.state.subtotal}</p>
          <div class='checkOutbutton'>
            <input type='button' value='Proceed to check out' onClick={e=>this.handleCheckOut()} disabled></input>
          </div>
          
        </div>
      )
    }
    
  }
}

class AddingPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      productImage: "",
      success: false
    }
    this.getProductImage = this.getProductImage.bind(this);
  }

  getProductImage(){
    $.ajax(
      {xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/loadproduct/${this.props.productId}`
    }).done(function(result){
      console.log(result[0])
      if (!result.err){
        this.setState(
          {
            productImage: result[0].productImage
          }
        )
      }
    }.bind(this))
  }

  handleAddProduct(){
    if (this.props.quantity != 0){
      $.ajax(
        {xhrFields: {withCredentials: true},
        type: "PUT",
        url: `http://localhost:3001/addtocart`,
        data: {productId: this.props.productId, quantity: this.props.quantity}
      }).done(function(result){
        console.log(result)
        if (!result.err){
          this.setState(
            {
              success: true
            }
          )
          this.props.setProductInfo('reset')
        }
      }.bind(this))
    }
    else{
      this.props.handlePageChange(this.props.lastPage)
    }
  }

  componentDidMount(){
    this.getProductImage();
    this.handleAddProduct();
    this.props.getSessionInfo();
  }

  render(){
    if (this.state.success){
      return(
        <div class='AddingPage'>
          <img src={`http://localhost:3001/${this.state.productImage}`} class='adding-page-image'></img>
          <p class='left-padding'>✓ Added to Cart</p>
        </div>
      )
    }
    else{
      return(
        <div class='AddingPage'>
          <img src={`http://localhost:3001/${this.state.productImage}`} class='adding-page-image'></img>
          <p class='left-padding'>✕ Error occured.</p>
        </div>
      )
    }
    
    
  }
}

class SignInPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      username: "",
      password: ""
    }
    this.handleSignIn = this.handleSignIn.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({[name]: value});
  }

  handleSignIn(){
    if (this.state.username != "" && this.state.password != ""){
      $.ajax(
        {xhrFields: {withCredentials: true},
        type: "POST",
        url: `http://localhost:3001/signin`,
        data: this.state
      }).done(function(result){
        console.log(result)
        if (!result.err){
          if (result.msg == "Login success"){
            this.props.handleLogInStatus(true)
            if(this.props.lastPage == "productList"){
              this.props.handlePageChange("productList", true)
            }
            else{
              this.props.handlePageChange("Adding", true)
            }
            
          }
          else{
            alert(result.msg)
          }
        }
        else{
          alert(result.err)
        }
          
      }.bind(this))
    }
    else{
      alert("You must enter username and password.")
    }
    
  }

  render(){
    return(
      <div>
        <div class='input'>
          <p>Username:</p>
          <input type="text" name="username" value={this.state.username} onChange={e=>this.handleInputChange(e)}></input>
        </div>
        <div class='input'>
          <p>Password:</p>
          <input type="password" name="password" value={this.state.password} onChange={e=>this.handleInputChange(e)}></input>
        </div>
        <div class='LoginButton'>
          <input type="button" value='Sign in' onClick={e=>this.handleSignIn()}></input>
        </div>
        
      </div>
    )
  }
}

class ProductPage extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      name: "",
      price: "",
      productImage: "",
      manufacturer: "",
      description: "",
      quantity: 0
    }

    this.getProductInfo = this.getProductInfo.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleAddToCart = this.handleAddToCart.bind(this);
  }

  handleAddToCart(){
    if (this.props.loggedIn){
      this.props.setProductInfo('', this.state.quantity)
      this.props.handlePageChange("Adding")
    }
    else{
      this.props.setProductInfo('', this.state.quantity)
      this.props.handlePageChange("signin")
    }
  }

  getProductInfo(){
    $.ajax(
      {xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/loadproduct/${this.props.productId}`
    }).done(function(result){
      console.log(result[0])
      if (!result.err){
        this.setState(
          {
            description: result[0].description,
            manufacturer: result[0].manufacturer,
            name: result[0].name,
            price: result[0].price,
            productImage: result[0].productImage
          }
        )
      }
        
    }.bind(this))
  }

  handleInputChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({[name]: value});
  }

  componentDidMount(){
    this.getProductInfo();
  }

  render(){
    return(
      <div class="ProductPage">
        <img src={`http://localhost:3001/${this.state.productImage}`} class='product-page-image'></img>
        <div>
          <p class='name'>{this.state.name}</p>
          <p class='product-price'>${this.state.price}</p>
          <p>{this.state.manufacturer}</p>
          <p>{this.state.description}</p>
        </div>
        <div>
          <p>Quantity:</p>
          <input type='number' name='quantity' value={this.state.quantity} onChange={this.handleInputChange} min="0" max="99"></input>
          <input type='button' value="Add to Cart" onClick={e=>this.handleAddToCart()}></input>
        </div>
      </div>
    )
  }

}

function Footer(props){
  if (props.page == 'productInfo' || props.page == 'signin' || props.page == 'Adding'){
    if (props.page !== 'Adding'){
      return <a class="footer clickable" onClick={e=>{props.handlePageChange(props.lastPage)}}>← go back</a>
    }
    else{
      return <a class="footer clickable" onClick={e=>{props.handlePageChange("productList")}}>← go back</a>
    }
  }
  else{
    return <a class="footer clickable" onClick={e=>{props.handlePageChange("productList")}}>continue browsing</a>
  }
}

function ProductList(props){
  var grouping = new Array()
  var numOfProducts = props.productInfo.length
  var numOfRow = Math.ceil(numOfProducts / 4)
  for (var i = 0; i < numOfRow; i++){
    if (i == numOfRow - 1){
      grouping.push(Array.from(props.productInfo).slice(4*i, numOfProducts))
    }
    else{
      grouping.push(Array.from(props.productInfo).slice(4*i, 4*i+4))
    }
  }
  return(
    <div class="ProductList">
      {
        grouping.map((products=>{
          return <ProductRow 
          products={products}
          handlePageChange={props.handlePageChange}
          setProductInfo={props.setProductInfo}
          />
        }))
      }
    </div>
  )

}

function ProductRow(props){
  return(
    <div class="ProductRow">
      {
        props.products.map((product=>{
          return <Product 
            product={product}
            handlePageChange={props.handlePageChange}
            setProductInfo={props.setProductInfo}
          />
        }))
      }
    </div>
  )
}

function Product(props){
  function Redirect(event){
    props.setProductInfo(props.product._id);
    props.handlePageChange("productInfo");
  }
  return(
    <div class="product" id={props.product._id} onClick={e=>Redirect(e)}>
      <img src={`http://localhost:3001/${props.product.productImage}`} class='main-page-img'/>
      <p class="product-name">{props.product.name}</p>
      <p class="product-price">${props.product.price}</p>
    </div>
  )
}

class LoginCorner extends React.Component{
  constructor(props){
    super(props);
    this.redirectToLogin = this.redirectToLogin.bind(this);
    this.handleSignOut = this.handleSignOut.bind(this);
  }

  redirectToLogin(event){
    event.preventDefault();
    this.props.handlePageChange('signin')
  }

  handleSignOut(event){
    event.preventDefault();
    $.ajax(
      {xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/signout`
    }).done(function(result){
      console.log(result)
      if (!result.err){
        if (result.msg == 'logout success'){
          this.props.handleLogInStatus(false)
        }
      }
      else{
        alert(result.err)
      }
    }.bind(this))
    
  }

  render(){
    if(!this.props.loggedIn){
      return(
        <a href='' onClick={e=>this.redirectToLogin(e)}>Login</a>
      )
    }
    else{
      return(
        <div class='flex'>
          <div class='flex clickable' onClick={e=>this.props.handlePageChange('shoppingCart')}>
            <img src='shopping_cart_FILL0_wght400_GRAD0_opsz48.png' class='header-cart-image'></img>
            <p>{this.props.totalnum} in Cart</p>
          </div>
          
          <div class='logout-corner'>
            <p>Hello, {this.props.username}<br/></p>
            <a href='' onClick={e=>this.handleSignOut(e)}>Sign Out</a>
          </div>
        </div>
      )
    }
  }
}

function DropDownList(props) {
    const options = [
      {value: 'All', label:'All'},
			{value: 'Phones', label:'Phones'},
			{value: 'Tablet', label:'Tablet'},
			{value: 'EarBuds', label:'EarBuds'}
    ]
    return(
      <div>
        <select options={options} onChange={e=>props.handleFilterChange(e)}>
          {options.map((option, index)=><option value={option.value} key={index}>{option.value}</option>)}
        </select>
      </div>
      
    )
}

class Header extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      searchInput: "",
      filter: "All"
    }

    this.handleFilterChange = this.handleFilterChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({[name]: value});
  }

  handleFilterChange(event){
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({filter: value});
    this.props.showProduct(this.state.searchInput, value)
  }

  render(){
    return (
      <div class="header">
        <h2 onClick={e=>this.props.handlePageChange("productList")} class='clickable'>Phones Tablets Laptops</h2>
        <div class="header-search">
          <DropDownList 
          name="filter"
          value={this.state.filter}
          handleFilterChange={this.handleFilterChange}/>

          <input 
          type="search"
          name='searchInput'
          value={this.state.searchInput}
          onChange={this.handleInputChange}/>

          <input
          type="image"
          src='Search_Icon.png'
          class="search-button"
          onClick={e=>this.props.showProduct(this.state.searchInput, this.state.filter)}/>
        </div>

        <LoginCorner 
        loggedIn={this.props.loggedIn}
        handlePageChange={this.props.handlePageChange}
        username={this.props.username}
        totalnum={this.props.totalnum}
        handleLogInStatus={this.props.handleLogInStatus}
        setProductInfo={this.setProductInfo}
        />

      </div>
      
    )
  }
}

class MainPage extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      productInfo: new Array(), 
      loggedIn: false, 
      /* page={productList, signin, productInfo, shoppingCart, afterAdding}*/
      page:"productList",
      lastPage: "",
      productId: "",
      quantity: "",
      username: "",
      totalnum: "",
      completed: {totalnum: "", amount: ""}
    };

    this.showProductList = this.showProductList.bind(this);
    this.getSessionInfo = this.getSessionInfo.bind(this);
    this.handlePageChange = this.handlePageChange.bind(this);
    this.handleLogInStatus = this.handleLogInStatus.bind(this);
    this.setProductInfo = this.setProductInfo.bind(this);
    this.recordCheckOut = this.recordCheckOut.bind(this);
  }

  showProductList(searchInput, filter){
    $.ajax(
      {xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/loadpage?category=${filter}&searchstring=${searchInput}`
    }).done(function(result){
      console.log(result)
      if (!result.err){
        this.setState(
          {productInfo: result.productList}
        )
        this.handlePageChange("productList")
      }
        
    }.bind(this))
  }

  getSessionInfo(){
    $.ajax({
      xhrFields: {withCredentials: true},
      type: "GET",
      url: `http://localhost:3001/getsessioninfo`
    }).done(function(result){
      console.log(result)
      if (result.username){
        var loginState = true
      }
      else{
        var loginState = false
      }
      this.setState({loggedIn: loginState, username: result.username, totalnum: result.totalnum})
    }.bind(this))
    console.log(this.state.loggedIn)
  }

  handlePageChange(page, disableLastPage=false){
    if (!disableLastPage){
      this.setState((prevState)=>({page: page, lastPage: prevState.page}))
    }
    else{
      this.setState((prevState)=>({page: page}))
    }
  }

  setProductInfo(productId='', quantity=''){
    if (productId != '' && quantity != ""){
      this.setState((prevState)=>({productId: productId, quantity: quantity}))
    }
    else if (productId == '' && quantity !=''){
      this.setState((prevState)=>({quantity: quantity}))
    }
    else if (productId != '' && quantity ==''){
      this.setState((prevState)=>({productId: productId}))
    }
    else if (productId == "reset"){
      this.setState((prevState)=>({productId: '', quantity: ''}))
    }
  }

  handleLogInStatus(loggedIn){
    this.setState(
      {
        loggedIn: loggedIn,
      }
    )
  }

  recordCheckOut(totalnum, amount){
    this.setState({completed: {totalnum: totalnum, amount: amount}})
  }

  componentDidMount(){
    this.showProductList("", "");
    this.getSessionInfo();
  }

  render(){
    if (this.state.page == "productList"){
      return(
        <React.Fragment>
          <Header 
          showProduct={this.showProductList} 
          loggedIn={this.state.loggedIn}
          totalnum={this.state.totalnum}
          handleLogInStatus={this.handleLogInStatus}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          username={this.state.username}/>
          <section className='contents'>
            <ProductList
            productInfo={this.state.productInfo}
            handlePageChange={this.handlePageChange}
            setProductInfo={this.setProductInfo}
            />
          </section>
          
        </React.Fragment>
      );
    }else if (this.state.page == "signin"){
      return(
        <React.Fragment>
          <SignInPage 
          handlePageChange={this.handlePageChange}
          productId={this.state.productId}
          handleLogInStatus={this.handleLogInStatus}
          lastPage={this.state.lastPage}
          />
          <Footer 
          page={this.state.page}
          lastPage={this.state.lastPage}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          />
        </React.Fragment>
      )
    }else if (this.state.page == "productInfo"){
      return(
        <React.Fragment>
          <Header 
          showProduct={this.showProductList} 
          loggedIn={this.state.loggedIn}
          totalnum={this.state.totalnum}
          handleLogInStatus={this.handleLogInStatus}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          username={this.state.username}/>
          <section className='contents'>
            <ProductPage
            productId={this.state.productId}
            handlePageChange={this.handlePageChange}
            loggedIn={this.state.loggedIn}
            setProductInfo={this.setProductInfo}
            />
          </section>
          <Footer 
          page={this.state.page}
          lastPage={this.state.lastPage}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          />
        </React.Fragment>
      )
    }else if (this.state.page == "shoppingCart"){
      return(
        <React.Fragment>
          <Header 
          showProduct={this.showProductList} 
          loggedIn={this.state.loggedIn}
          totalnum={this.state.totalnum}
          handleLogInStatus={this.handleLogInStatus}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          username={this.state.username}/>
          <section className='contents'>
            <ShoppingCartPage
            getSessionInfo={this.getSessionInfo}
            handlePageChange={this.handlePageChange}
            totalnum={this.state.totalnum}
            recordCheckOut={this.recordCheckOut}
            />
          </section>
        </React.Fragment>
      )
    }else if (this.state.page == "Adding"){
      return(
        <React.Fragment>
          <Header 
          showProduct={this.showProductList} 
          loggedIn={this.state.loggedIn}
          totalnum={this.state.totalnum}
          handleLogInStatus={this.handleLogInStatus}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          username={this.state.username}/>
          <section className='contents'>
            <AddingPage
            productId={this.state.productId}
            quantity={this.state.quantity}
            lastPage={this.state.lastPage}
            handlePageChange={this.handlePageChange}
            getSessionInfo={this.getSessionInfo}
            setProductInfo={this.setProductInfo}
            />
          </section>
          <Footer 
          page={this.state.page}
          lastPage={this.state.lastPage}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          />
        </React.Fragment>
      )
    }
    else if (this.state.page == "checkOut"){
      return(
        <React.Fragment>
          <Header 
          showProduct={this.showProductList} 
          loggedIn={this.state.loggedIn}
          totalnum={this.state.totalnum}
          handleLogInStatus={this.handleLogInStatus}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          username={this.state.username}/>
          <section className='contents'>
            <CheckOutPage
            handlePageChange={this.handlePageChange}
            getSessionInfo={this.getSessionInfo}
            totalnum={this.state.completed.totalnum}
            amount={this.state.completed.amount}
            />
          </section>
          <Footer 
          page={this.state.page}
          lastPage={this.state.lastPage}
          handlePageChange={this.handlePageChange}
          setProductInfo={this.setProductInfo}
          />
        </React.Fragment>
      )
    }
  }
}

export default MainPage;
