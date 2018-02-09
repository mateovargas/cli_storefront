//Script that runs the customer view for bamazon.

//Dependencies
var mysql = require('mysql');
var inquirer = require('inquirer');
var cart = [];
var keepShopping = false;

//mysql connection
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "tde289ida",
    database: "bamazon"
});

//connect to database and run functions.
connection.connect(function (err) {
    if (err) throw err;

    console.log("connected as id " + connection.threadId);
    console.log("Welcome to bamazon! Jeff Bezo's worst nightmare!");
    shop();

});

//Function that runs the shopping platform. Queries users for produc to search
//and how many of them. It then displays the cost of the product in that
//quantity and asks the user if they would like to add it to their cart.
//It then determines whether the user would like to continue adding to
//their cart, or proceed to purchase.
function shop(){

    //Prompt to ask user what they want and how many
    inquirer.prompt([
        {
            type: 'input',
            message: 'Which product would you like to search for?',
            name: 'product'
        },
        {
            type: 'input',
            message: 'How many would you like to purchase?',
            name: 'quantity'
        }
    ]).then(function(inquirerResponse){

        //Takes input and then uses it in the search.
        var query_product = inquirerResponse.product.toString();
        var query_quantity = parseInt(inquirerResponse.quantity);

        var query = connection.query("SELECT * FROM products WHERE product_name=?", 
                                    [query_product], function (err, res) {
                                        
                                        //Returns if the product is not in database.
                                        if(res.length === 0){

                                            console.log('Sorry! That product is out of stock.');
                                            return;

                                        }

                                        //Displays the item chosen.
                                        for(var i = 0; i < res.length; i++){

                                            var order_cost = res[i].price * query_quantity;

                                            console.log(query_quantity.toString() +
                                                        " of " + res[i].product_name + " at " + 
                                                        res[i].price + " costs " +
                                                        order_cost.toString() + '.');
                                        }

                                        //Prompts user to confirm and see if they need to
                                        //add more.
                                        inquirer.prompt([
                                            {
                                                type: 'confirm',
                                                message: 'Add to cart?',
                                                name: 'add_to_cart'
                                            },
                                            {
                                                type: 'confirm',
                                                message: 'Would you like to search for another product?',
                                                name: 'confirm'
                                            }
                                        ]).then(function (inquirerResponse) {
                                            
                                            //Sets global flag for keep_shopping
                                            keepShopping = inquirerResponse.confirm;

                                            if (inquirerResponse.add_to_cart) {

                                                addToCart(query_product, query_quantity);

                                            }

                                            if (inquirerResponse.confirm) {

                                                shop();

                                            }

                                        });

                                    });

    });

};

//Function to query a product and then add it to the shopping cart, which is
//a JSON object with product name being the key and the quantity needed being the key
function addToCart(item, quantity){

    var query = connection.query("SELECT * FROM products WHERE product_name=?", 
                                [item], function (err, res) {
        for (var i = 0; i < res.length; i++) {

                var product_name = res[i].product_name;
                var product_price = res[i].price;

                //Adds items to cart if quantity is available.
                if(quantity <= res[i].stock_quantity){

                    cart.push({
                                name: product_name,
                                quantity: quantity,
                                price: product_price,
                                quantity_available: res[i].stock_quantity
                              });
                }
                else{

                    console.log('Insufficient Quantity!');
                    return;
                }
        }


        if(!keepShopping){

            purchase();

        }
    });

};

//Function that displays the cart and then proceeds to purchase it if
//confirmed.
function purchase(){

    var total = 0;
    
    for(var i = 0; i < cart.length; i++){
        
        var total = total + (cart[i].quantity * cart[i].price);
        console.log('----------');
        console.log(cart[i].quantity.toString() + ' | ' + 
                    cart[i].name + ' | ' + cart[i].price.toString());

    }

    console.log('----------');
    console.log('TOTAL: $' + total);

    inquirer.prompt([
        {
            type: 'confirm',
            message: 'Does this look correct?',
            name: 'correct'
        },
        {
            type: 'confirm',
            message: 'Confirm purchase?',
            name: 'purchase'
        }
    ]).then(function(inquirerResponse){

        if(!inquirerResponse.correct){

            console.log('Restarting shopping! Sorry about that.');
            cart = [];
            shop();

        }

        if(inquirerResponse.purchase){

            for(var i = 0; i < cart.length; i++){

                var new_stock = cart[i].quantity_available - cart[i].quantity;
                var name = cart[i].name;
                connection.query("UPDATE products SET stock_quantity=? WHERE product_name=?", 
                                 [new_stock, name], 
                                 function(err, res, fields){
                    if (err) throw err;
                });
            }
            console.log('Thank you for shopping at bamazon!');
            connection.end();
        }
    });

}