var express = require('express');
var router = express.Router();
var monk = require('monk');

/* GET home page. */
router.get('/loadpage', async function(req, res, next) {
  var category = req.query.category
  if (category == "All"){
    category = ""
  }
  var name = req.query.searchstring
  var db = req.db
  var col = db.get('productCollection');

  if (category == "" && name == ""){
    var query = [{$sort: {name: 1}}]
  }
  else if (category == "" && name != ""){
    var query = [{$match: { name: {$regex: new RegExp(name)}}}, {$sort: {name: 1}}]
  }
  else if (category != "" && name == ""){
    var query = [{$match: { category: category}}]
  }
  else{
    var query = [{$match: {$and: [{ name: {$regex: new RegExp(name)}}, { category: category}]}}, {$sort: {name: 1}}]
  }

  try{
    resultDocs = await col.aggregate(query)
    returnList = ``
    for (let i = 0; i < resultDocs.length; i++){
        var doc = resultDocs[i]
        if (i != 0){
            returnList += `,`
        }
        returnList += `{
            "_id": "${doc._id}",
            "name": "${doc.name}",
            "price": " ${doc.price}",
            "productImage": "${doc.productImage}"
        }`
    }
    console.log(returnList)
    res.json({msg: "Success", productList: JSON.parse("["+returnList+"]")})
  }
  catch(err){
      console.log(err)
    res.json({err: err})
  }
});

router.get('/loadproduct/:productid', async function(req, res, next){
    var id = monk.id(req.params.productid);
    var db = req.db;
    var col = db.get('productCollection');
    query = [
        {$match: { _id: id}}, 
        /*{$project: {_id: 0, manufacturer: 1, description: 1}}*/
    ];
    try
    {result = await col.aggregate(query)
    res.json(result)}
    catch(err){
        res.json({err: err})
    }
});

router.post('/signin', async(req, res)=>{
    var username = req.body.username;
    var password = req.body.password;
    if (username == "" || password == ""){
        res.json({err: "No login info"})
    }
    var db = req.db;
    var col = db.get('userCollection');
    result = await col.aggregate([
        {$match: {$and: [
            {username: username},
            {password: password}
        ]}}
    ])
    if (result != null){
        res.cookie('userId', result[0]._id)
        res.json({msg: "Login success", totalnum: result[0].totalnum})
    }
    else{
        res.json({msg: "Login failure"})
    }
})

router.get('/signout', async (req, res)=>{
    try{
        res.clearCookie('userId');
        res.json({msg: 'logout success'})
    }
    catch (err){
        res.json({err: err})
    }
})

router.get('/getsessioninfo', async(req, res)=>{
    var userId = req.cookies.userId;
    var db = req.db;
    var col = db.get('userCollection');
    if (userId != null){
        try{
            userId = monk.id(userId)
            result = await col.aggregate([
                {$match: 
                    {_id: userId}
                },
                {$project: {'username': 1, 'totalnum': 1}}
            ])
            res.json({username: result[0].username, totalnum: result[0].totalnum})
        }
        catch(err){
            res.json({err: err})
        }
    }
    else{
        res.json({})
    }
})

router.put('/addtocart', async(req, res)=>{
    var db = req.db;
    var col = db.get('userCollection');
    var productId = req.body.productId
    var quantity = req.body.quantity
    var userId = monk.id(req.cookies.userId)
    previous = await col.aggregate([
        {$match: {_id: userId}},
        {$project: {cart: 1, totalnum: 1}}
    ])
    var previousCart = previous[0].cart
    var previousTotal = previous[0].totalnum
    var newCart = null
    for (let i = 0; i < previousCart.length; i++){
        if (previousCart[i].productId == productId){
            newCart = previousCart
            newCart[i].quantity = parseInt(newCart[i].quantity) + parseInt(quantity)
        }
    }
    if (newCart == null){
        previousCart.push({'productId': monk.id(productId), 'quantity': quantity})
        newCart = previousCart
    }
    console.log(previousTotal)
    var newTotal = parseInt(previousTotal) + parseInt(quantity)
    console.log(newCart)
    col.update({'_id': userId}, {$set: {'cart': newCart, 'totalnum': newTotal}}).then((docs)=>{
        if(docs.ok==1){
            res.json({totalnum: newTotal})
        }
        else{
            res.json({msg: 'Error', err:result})
        }
    })
})

router.get('/loadcart', async(req, res)=>{
    var db = req.db;
    var usercol = db.get('userCollection');
    var productcol = db.get('productCollection');

    var userId = monk.id(req.cookies.userId)
    try{
        var userResult = await usercol.aggregate([
            {$match: {_id: userId}},
            {$project: {cart: 1, totalnum:1}}
        ])
        console.log(userResult)
        var cart = userResult[0].cart
        var totalnum = userResult[0].totalnum
        var resJson = ``
        for(let i = 0; i < cart.length; i++){
            console.log(cart)
            var searchId = cart[i].productId
            var result = await productcol.aggregate([
                {$match: {_id: monk.id(searchId)}}
            ])
            console.log(result)
            if (i != 0){
                resJson += `,`
            }
            resJson += `{
                "_id": "${result[0]._id}",
                "name": "${result[0].name}",
                "price": "${result[0].price}",
                "productImage": "${result[0].productImage}",
                "quantity": "${cart[i].quantity}"
            }`
        }
        resJson = `{
            "totalnum": "${totalnum}",
            "cart": [${resJson}]
        }`
        console.log(resJson)
        res.json(resJson)
    }
    catch(err){
        res.json({err: err})
    }
    
})

router.put('/updatecart', async(req, res)=>{
    console.log(req.body)
    var db = req.db;
    var col = db.get('userCollection');
    var userId = monk.id(req.cookies.userId)
    var productId = req.body.productId
    var newquantity = req.body.quantity

    try{
        previous = await col.aggregate([
            {$match: {_id: userId}},
            {$project: {cart: 1, totalnum: 1}}
        ])
        var previousCart = previous[0].cart
        var previousTotal = previous[0].totalnum
        var totalnumDifference = 0
        var newCart = null
        for (let i = 0; i < previousCart.length; i++){
            console.log("previous[i]:" + previousCart[i].productId)
            console.log("target:" + productId)
            if (previousCart[i].productId == productId){
                totalnumDifference = parseInt(newquantity) - parseInt(previousCart[i].quantity)
                previousCart[i].quantity = newquantity
                newCart = previousCart
            }
        }
        if (newCart == null){
            res.json({err: "Cannot find item " + productId})
        }
        console.log(newCart)
        var newTotal = parseInt(previousTotal) + totalnumDifference
        col.update({'_id': userId}, {$set: {'cart': newCart, 'totalnum': newTotal}}).then((docs)=>{
            if(docs.ok==1){
                res.json({totalnum: newTotal})
            }
            else{
                res.json({msg: 'Error', err:result})
            }
        })
    }
    catch(err){
        res.json({err: err})
    }
})

router.delete('/deletefromcart/:productid', async(req, res)=>{
    var db = req.db;
    var col = db.get('userCollection');
    var userId = monk.id(req.cookies.userId)
    var productId = req.params.productid
    console.log("target: "+productId)

    try{
        previous = await col.aggregate([
            {$match: {_id: userId}},
            {$project: {cart: 1, totalnum: 1}}
        ])
        console.log(previous)
        var previousCart = previous[0].cart
        var previousTotal = previous[0].totalnum
        var totalnumDifference = 0
        var newCart = null
        for (let i = 0; i < previousCart.length; i++){
            if (previousCart[i].productId == productId){
                console.log(previousCart[i].productId)
                console.log(productId)
                totalnumDifference = 0 - previousCart[i].quantity
                previousCart.splice(i, 1)
                newCart = previousCart
            }
        }
        if (newCart == null){
            res.json({err: "Cannot find item " + productId})
        }
        console.log(newCart)
        var newTotal = parseInt(previousTotal) + totalnumDifference
        col.update({'_id': userId}, {$set: {'cart': newCart, 'totalnum':newTotal}}).then((docs)=>{
            if(docs.ok==1){
                res.json({totalnum: newTotal})
            }
            else{
                res.json({msg: 'Error', err:result})
            }
        })
    }
    catch(err){
        res.json({err: err})
    }
})

router.get('/checkout', async(req, res)=>{
    var db = req.db;
    var col = db.get('userCollection');
    var userId = monk.id(req.cookies.userId)

    try{
        var newCart = [ ]
        col.update({'_id': userId}, {$set: {'cart': newCart, 'totalnum': 0}}).then((docs)=>{
            if(docs.ok==1){
                res.json({msg: ""})
            }
            else{
                res.json({msg: 'Error', err:result})
            }
        })
    }
    catch(err){
        res.json({err: err})
    }
})

module.exports = router;