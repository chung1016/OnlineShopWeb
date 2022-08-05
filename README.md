# OnlineShop
This ia a side project done by chung1016 to practice web development using node.js and react.js. This application contain a server and client interface. The server is using node.js with express framework, while the UI of the application is using React.js with simple CSS.
## Server Design
In the file of app.js, the request ends with '/' is redirected by the router productRouter. The server request follow RESTful style, which means:
  1.  All data communication is using JSON format
  2.  Using HTTP method (GET/POST/PUT/DELETE)
  3.  Simple URI

There're 10 routers responsible for different requests:
  1.  `GET /loadpage`: return a json file containing all the product info or those matching the search criteria
  2.  `GET /loadproduct/:productid`: return a json file containing the details of the respective product_id
  3.  `POST /signin`: read the username and password in the request body and return a json file descripting the result (success/fail), set a cookie of userID if login successed
  4.  `GET /signout`: clear the userID cookie and return a json file descripting the result (success/fail)
  5.  `GET /getsessioninfo`: read the userID in the cookie and return the username and total number of item in current cart
  6.  `PUT /addtocart`: read the productID and quantity in the body and edit the shopping cart record in the database, return the result (success/fail)
  7.  `GET /loadcart`: read the userID and return the current shopping cart
  8.  `PUT /updatecart`: read the productID and new quantity in the body and update the cart, return the result (success/fail)
  9.  `DELETE /deletefromcart/:productid`: read the productId and remove the product from the cart when the user decrease the quantity to 0, return the result (success/fail)
  10.  `GET /checkout`: read the userId and clear the cart, return the result (success/fail)

### Database Design
MongoDB is used in this project. Unlike SQL table, it allows more flexibility in the data structure. There're 2 Collections in the database:
  1.  userCollection:
      - userId (auto-generated)
      - username
      - password
      - cart: an array of productId and quantity
      - totalnum: total number of items in the cart

  2.  productCollection:
      - productId (auto-generated)
      - name
      - category
      - price
      - manufacturer
      - productImage: a link to the image
      - description

## Client UI
All pages (except login page) follow the following structure:<br>
![image](https://user-images.githubusercontent.com/62590843/183024343-c953029d-16e8-43f3-be66-1966924af010.png)<br>
<h3>1.  Header</h3>

This section contains the following components:
  - <b>Title/Logo of the website</b>
  - <b>Search Bar</b> -- filter by product type or keyword
  - <b>User Corner</b>:
    - if the user hasn't logged in, show a link redirecting to login page
    - if the user has logged in, show the user name and a shopping cart with total number of items displayed
<h3>2.  <b>Main Content</b><br></h3>

This section display the content based on which page the user is currently on. It is under a React component of `MainPage` and controled by `this.state.page`. When the user has clicked to another page, `this.state.page` will be set and the Main Content will be updated to the respective page the user is looking for.
<h3>3.  <b>Footer</b><br></h3>

This section is located at the bottom of the page. It is responsible for redirecting the user to the previous page, which is recorded in `this.state.lastPage` in the `MainPage` component. Also, it will redirect the user back to the main page when the user has successfully checked out. 
  

<h3>There're several pages in the website:</h3>

### 1.  Main Page -- Displaying all the products/ products fufilled search requirment

    Main Page showing all products without logged in.
![image](https://user-images.githubusercontent.com/62590843/183016424-6060359c-d065-4884-9982-ac2c97e90fb4.png)

    Main Page with filtering and user logged in.
![image](https://user-images.githubusercontent.com/62590843/183016556-5275defb-d89f-4f0d-8c06-ca66c763f193.png)

### 2. Product Information Page -- Displaying the product details and adding to cart action

    Info Page before adding product.
![image](https://user-images.githubusercontent.com/62590843/183040632-594ba940-e7e1-4266-8aa5-08edf282ea43.png)

    Info Page after adding product to cart.
![image](https://user-images.githubusercontent.com/62590843/183040796-474c24ac-b4f7-493d-9ea6-9c033c6a7f6f.png)

### 3.  Check Out Page -- Allow check out or edit number of item

    Example of Check out page.
![image](https://user-images.githubusercontent.com/62590843/183041750-2210d58c-c54c-4239-b50a-cbbdf4bc8210.png)
    
    The user are allowed to edit the number of items.
![image](https://user-images.githubusercontent.com/62590843/183042002-dfa094c9-7563-4473-839f-f50d8de01a86.png)

    After checking out.
![image](https://user-images.githubusercontent.com/62590843/183042190-dc75831d-807c-42d4-9ef4-9d4a5e1c624f.png)

### 4. Login page -- process login action

![image](https://user-images.githubusercontent.com/62590843/183042365-cf1a8e42-1656-4f6e-993a-f89ca069344b.png)
