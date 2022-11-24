const express = require('express');
const router = express.Router();
const con = require('../mysqlconnector');
var moment = require('moment')


router.post('/', (req, res) => {
    var customerId
    let sql1 = `SELECT * FROM customers WHERE customer_id = ?`;
    con.query(sql1, [req.body.customerId], (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        customerId = results[0].customer_id
        console.log(customerId)
        // return res.send("ok")
    });
    con.beginTransaction(function (err) {
        if (err) { throw err; }
        let sql = `INSERT INTO orderinfo (customer_id, date_placed, date_shipped, status, shipping) VALUES(?, ?, ?, ?, ?)`
        console.log(sql, moment(new Date()).format("YYYY-MM-DD"), customerId)
        let dateShipped = moment(new Date()).format("YYYY-MM-DD")
        let datePlaced = moment(new Date()).format("YYYY-MM-DD")
        con.query(sql, [customerId, dateShipped, datePlaced, req.body.status, req.body.shipping], function (error, results, fields) {
            if (error) {
                return con.rollback(function () {
                    throw error;
                });
            }
            var orderinfoId = results.insertId
            console.log(results, req.body.items)

            req.body.items.map((item) => {
                let sql2 = `INSERT INTO orderline (orderinfo_id, item_id, quantity) VALUES(?, ?, ?)`
                con.query(sql2, [orderinfoId, item.item_id, item.quantity], function (error, results, fields) {
                    if (error) {
                        return con.rollback(function () {
                            throw error;
                        });
                    }
                    let sql3 = `UPDATE stock SET quantity = quantity - ? WHERE item_id = ?`
                    con.query(sql3, [item.quantity, item.item_id], function (error, results, fields) {
                        if (error) {
                            return con.rollback(function () {
                                throw error;
                            });
                        }
                        con.commit(function (err) {
                            if (err) {
                                return con.rollback(function () {
                                    throw err;
                                });
                            }
                            console.log('success!');
                            return res.status(200).json({ success: true, message: 'order success' });
                        });
                        
                    })
                })
            })
           
        })
    });
})


module.exports = router;