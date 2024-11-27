const express=require("express");
const router= express.Router();
const connection=require("../db");

router.get("/dashboard", (req, res) => {
    const query1 = `SELECT customerName,DATE_FORMAT(transactionDate, "%a %b %d %Y") AS formattedDate,amountPending FROM customer_details WHERE amountPending > 0`;
    const query2 = `SELECT SUM(profit) AS total_profit FROM customer_details WHERE DATE(transactionDate) = CURDATE()`;

    // Execute the first query
    connection.query(query1, (err, results1) => {
        if (err) {
            console.error(err);
        }
        // Execute the second query inside the callback of the first
        connection.query(query2, (err, results2) => {
            if (err) {
                console.error(err);
            }
            // Render the page once both queries are completed
            res.render("pages/dashboard.ejs", {
                results1,  // Data for customers with pending amounts
                totalProfit: results2[0].total_profit||0 // Total profit
            });
        });
    });
});


router.get("/inventory",(req,res)=>{
    connection.query('SELECT * FROM medicines',(err, medicines)=>{
        if(!err){
            res.render("pages/inventory.ejs",{medicines});
        }else{
            console.log(err);
        }
        console.log('data from medicine table:\n', medicines);
    });
});

router.get("/search-med", (req, res) => {
    const { med_name } = req.query;  // Use req.query to get query parameters from URL
    let query = 'SELECT * FROM medicines';  // Default query to get all medicines
    let queryParams = [];
    if (med_name) {
        query += ' WHERE m_name LIKE ?';  // If there's a search term, filter the result
        queryParams.push(`%${med_name}%`);  // Use wildcards for partial matching
    }
    connection.query(query, queryParams, (err, medicines) => {
        if (err) {
            console.log(err);
        } else {
            res.render("pages/inventory.ejs", { medicines });
        }
    });
});


router.post("/api/add-medicine",(req,res)=>{
    const {name,quantity,buyingprice}=req.body;
    console.log("medicine data recieved",{name,quantity,buyingprice});

    const query='INSERT INTO medicines (m_name,quantity,buyingprice) VALUES (?,?,?)';
    connection.query(query,[name,quantity,buyingprice],(err,results)=>{
    if(err){
        console.error('Database error:', err);
    }
    console.log("Medicine added successfully", results);
    res.redirect("/inventory");
    });
});

router.get("/transaction",(req,res)=>{
    connection.query('SELECT id,DATE_FORMAT(transactionDate, "%a %b %d %Y") AS formattedDate, customerName, mobilePhone, medicineName, quantity, buyingprice, sellingPrice, profit, amountPaid, amountPending, totalAmount FROM customer_details ORDER BY transactionDate DESC',(err,customer_details)=>{
        if(!err){
            res.render("pages/transaction.ejs",{customer_details});
        }else{
            console.log(err);
        }
    });
});
router.post("/api/add-transaction",(req,res)=>{
    const {customerName,mobilePhone,medicineName,quantity,sellingPrice,amountPaid}=req.body;
    console.log("Received data:", { customerName, mobilePhone, medicineName, quantity, sellingPrice, amountPaid });
    // Step 1: Fetch the buying price and quantity for the medicine from the medicines table
    const getbuyingprice_quantity='SELECT buyingprice, quantity FROM medicines WHERE m_name = ?';
    connection.query(getbuyingprice_quantity,[medicineName],(err,results)=>{
        if(err){
            console.error('Database error:', err);
        }
        if (results.length === 0) {
            return res.status(404).send({ success: false, message: 'Medicine not found' });
        }
        const buyingPrice = results[0].buyingprice;
        const availableQuantity = results[0].quantity;
        if (availableQuantity < quantity) {
            return res.status(400).send({ success: false, message: 'Not enough quantity in stock' });
        }
        // Step 2: Calculate the profit
        const profit = (sellingPrice - buyingPrice) * quantity;
        // Step 3: Calculate the total amount (quantity * sellingPrice)
        const totalAmount = quantity * sellingPrice;
        // Step 4: Calculate the amount pending
        const amountPending = totalAmount - amountPaid;
        // Step 5: Insert the transaction details into the customer_details table
        const insertTransactionQuery = `
            INSERT INTO customer_details 
            (transactionDate, customerName, mobilePhone, medicineName, quantity, buyingprice, sellingPrice, profit, amountPaid, amountPending, totalAmount) 
            VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        connection.query(insertTransactionQuery, [customerName, mobilePhone, medicineName, quantity, buyingPrice, sellingPrice, profit, amountPaid, amountPending, totalAmount], (err) => {
            if (err) {
                console.error('Database error while inserting transaction:', err);
                return res.status(500).send({ success: false, message: 'Database error' });
            }
            // Step 6: Update the medicine quantity in the inventory
            const updateInventoryQuery = 'UPDATE medicines SET quantity = quantity - ? WHERE m_name = ?';
            connection.query(updateInventoryQuery, [quantity, medicineName], (err) => {
                if (err) {
                    console.error('Database error while updating inventory:', err);
                }
                res.redirect("/transaction");
            });
        });
    });
});

router.post('/api/edit-amount', (req, res) => {
    const { customerId, amountPending } = req.body;

    const query = 'UPDATE customer_details SET amountPending = ? WHERE id = ?';
    connection.query(query, [amountPending, customerId], (err, results) => {
        if (err) {
            console.log(err);
        }
        const updateAmountPaidQuery = 'UPDATE customer_details SET amountPaid = totalAmount - ? WHERE id = ?';
        connection.query(updateAmountPaidQuery, [amountPending, customerId], (err) => {
            if (err) {
                console.error(err);
            }
            res.redirect('/dashboard');
        });
    });
});




router.get("/report/monthly-report",(req,res)=>{
    const query = `SELECT MONTH(transactionDate) AS month,YEAR(transactionDate) AS year,SUM(profit) AS monthlyProfit,SUM(totalAmount) as monthlySale FROM customer_details GROUP BY YEAR(transactionDate), MONTH(transactionDate)ORDER BY YEAR(transactionDate) DESC, MONTH(transactionDate) DESC;`;
    connection.query(query,(err,results)=>{
        if(err){
            console.log(err);
        }
        res.render('pages/monthly-report.ejs',{results});
    });
});


module.exports=router;