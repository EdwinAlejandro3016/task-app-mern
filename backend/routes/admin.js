const router = require('express').Router();
const {verifyToken} = require('../middlewares/validate-token');

router.get('/',verifyToken,(req,res)=>{
    res.json({
        error: null,
        data: {
            title: 'mi ruta protegida',
            user: req.user
        }
    })
});

module.exports = router;