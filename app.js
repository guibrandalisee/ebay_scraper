const axios = require("axios");
const cheerio = require("cheerio");
var express = require('express');
const cors = require('cors');

var app = express();
const PORT = process.env.PORT || 8080;

let data = [];

const getBooks = async (url) => {
    data = [];
    await axios
        .get(url,
            {
                headers: {
                    "Accept-Encoding": "gzip, deflate, br",
                    "Accept-Language": "en",
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    "Dnt": 1,
                    "Referer": "https://www.ebay.com/",
                    "Sec-Ch-Ua": "'Not/A)Brand';v='99', 'Google Chrome';v='115', 'Chromium';v='115'",
                    "Sec-Ch-Ua-Full-Version": "115.0.5790.171",
                    "Sec-Ch-Ua-Mobile": "?0",
                    "Sec-Ch-Ua-Model": "",
                    "Sec-Ch-Ua-Platform": "Windows",
                    "Sec-Ch-Ua-Platform-Version": "10.0.0",
                    "Sec-Fetch-Dest": "document",
                    "Sec-Fetch-Mode": "navigate",
                    "Sec-Fetch-Site": "same-origin",
                    "Sec-Fetch-User": "?1",
                    "Sec-Gpc": 1,
                    "Upgrade-Insecure-Requests": 1,
                }
            })
        .then(response => {
            const $ = cheerio.load(response.data);

            const itens = $(".s-item__wrapper");
            itens.each(function () {
                title = $(this).find(".s-item__title span").text();
                subtitle = $(this).find(".s-item__subtitle").text();
                price = $(this).find(".s-item__price").text();
                sellerInfo = $(this).find(".s-item__seller-info-text").text();
                itemLocation = $(this).find(".s-item__itemLocation").text();
                originalPrice = $(this).find(".s-item__discount .BOLD , .s-item__trending-price").text();
                itemLink = $(this).find(".s-item__link").attr('href');
                img = $(this).find(".image-treatment img").attr('src');
                rating = $(this).find(".x-star-rating .clipped").text();



                data.push({ title, subtitle, price, originalPrice, sellerInfo, itemLocation, itemLink, img, rating });
            });

        })
}


app.use(cors());

app.get('/itens', async function (req, res) {

    const query = req.query.query; //busca
    const fs = req.query.fs //Free Shipping 0 | 1
    const condition = req.query.condition
    const fr = req.query.fr //Free Return 0 | 1
    //condition{
    // 1000 = New
    // 1500 = Open Box
    // 2010 = Excellent - Refurbished
    //separador > %7C
    //EX > LH_ItemCondition=1000%7C2010%7C1500
    //}
    const minPrice = req.query.min;
    const maxPrice = req.query.max;
    const usOnly = req.query.us; // 0 | 1
    const returnsAccepted = req.query.ra; // 0 | 1
    const autorizedSeller = req.query.as; // 0 | 1
    const desc = req.query.desc; //Search in Description 0 | 1
    const autenticityGuarantee = req.query.ag; // 0 | 1
    

    const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${query}&_sacat=0&LH_TitleDesc=0&rt=nc&LH_FS=${fs}&LH_ItemCondition=${condition}&_udlo=${minPrice}&_udhi=${maxPrice}&LH_BIN=1&LH_PrefLoc=${usOnly}&LH_FR=${fr}&LH_RPA=${returnsAccepted}&LH_AS=${autorizedSeller}&LH_AV=${autenticityGuarantee}&LH_TitleDesc=${desc}`;
    

    await getBooks(url);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.write(JSON.stringify(data));
    res.end();

});

var server = app.listen(PORT, function () {
    var host = server.address().address
    var port = server.address().port
    console.log("API listening at http://%s:%s", host, port)
});