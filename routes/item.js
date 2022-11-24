const express = require('express');
const router = express.Router();
const con = require('../mysqlconnector');
const multer = require("multer");


router.get('/', (req, res) => {
    let sql = `SELECT * FROM items`;
    con.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        return res.status(200).json(results);
    });
});

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'public/uploads');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

router.post('/', uploadOptions.single('uploads'), (req, res) => {

    const file = req.file;
    
    // console.log(req.file)
    if (!file) return res.status(400).send('No image in the request');

    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;
    let img_path = `${basePath}${fileName}`
    let sql = `INSERT INTO items(description, sell_price, cost_price, title , img_path) VALUES(?,?,?,?,?)`;
    console.log(fileName, sql)
    con.query(sql, [req.body.description, req.body.sell_price, req.body.cost_price, img_path], (error, results, fields) => {
        if (error) {
            
            return console.error(error.message);
        }
       
        return res.status(200).json(results)
    });

    // 
});

router.put("/:id", uploadOptions.single("uploads"), (req, res) => {
    const file = req.file;
  
    // console.log(req.file)
    if (!file) return res.status(400).send("No image in the request");
  
    const fileName = file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let imagePath = `${basePath}${fileName}`;
    let sql = `UPDATE items SET description = ?, sell_price = ?, cost_price = ?, title = ?, imagePath = ? WHERE item_id = ${req.params.id}`;
    console.log(fileName, sql);
    con.query(
      sql,
      [
        req.body.description,
        req.body.sell_price,
        req.body.cost_price,
        req.body.title,
        imagePath,
        req.params.id,
      ],
      (error, results, fields) => {
        if (error) {
          return console.error(error.message);
        }
  
        return res.status(200).json(results);
      }
    );
  });
  

router.delete('/:id', (req, res) => {
    let sql = `DELETE From items WHERE item_id =${req.params.id}`;
    con.query(sql, (error, results, fields) => {
        if (error) {
            return console.error(error.message);
        }
        console.log(results);
        return res.status(200).json(results);
    });
});


module.exports = router;