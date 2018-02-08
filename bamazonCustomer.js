var mysql = require('mysql');
var inquirer = require('inquirer');
var cart = {};

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "dxz139ixw",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;

    console.log("connected as id " + connection.threadId);
    console.log("Welcome to bamazon! Jeff Bezo's worst nightmare!");
    shop();

    connection.end();
});

function shop(){

    
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

        var query_product = inquirerResponse.product;
        var query_quantity = inquirerResponse.quantity;

        console.log(query_product);
        console.log(query_quantity);
        
        var query = connection.query("SELECT * FROM products WHERE product_name=?", [query_product], function (err, res) {
                                        console.log(res);
                                        if(res.length === 0){
                                            console.log('Sorry! That product is out of stock.');
                                            return;
                                        }

                                        for(var i = 0; i < res.length; i++){

                                            var order_cost = res[i].price * quantity;

                                            console.log(quantity.toString() +
                                                        " of " + res[i].product_name + " at" + 
                                                        res[i].price + " costs " +
                                                        order_cost.toString() + '.');
                                        }
                                    });
        inquirer.response([
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
        ]).then(function(inquirerResponse){

            if(add_to_cart){

                addToCart(product, quantity);

            }

            if(confirm){

                shop();

            }

        });


    });

};

function addToCart(item, quantity){

    var query = connection.query("SELECT * FROM products WHERE product_name=?", [item], function (err, res) {
        for (var i = 0; i < res.length; i++) {
            console.log(res[i].id + " | " + res[i].product_name + " | " +
                        res[i].stock_quantity + " | " + res[i].department_name);

                if(quantity <= res[i].stock_quantity){

                    console.log('Can purchase');
                    cart[res[i].product_name] = quantity;
                    

                }
                else{

                    console.log('Insufficient Quantity!');
                    return;
                }
        }
        console.log(cart);
        console.log("-----------------------------------");
    });

};

function purchase(cart){


}