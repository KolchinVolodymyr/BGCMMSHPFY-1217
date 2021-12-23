const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
const logger = require('./configs/logger');

dotenv.config();

const BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
    clientId: 'kfnfy9fisjsuqaa8ki6op8fx0sww49l',
    accessToken: '5zjwikcnycybjiupfu9x90ccn4cjc6b',
    storeHash: 'u3omg5mo4v',
    responseType: 'json',
});
const app = express();

app.use(bodyParser.json())

    bigCommerce.get('/hooks')
    .then(data => {
        let webhooks = data;
        let scopes = webhooks.map(a => a.scope);
        const hookBody = {
            "scope": "store/customer/created",
            "destination": "https://4075-188-230-124-168.ngrok.io/webhooks",
            "is_active": true
        }
        console.log(scopes);

        if (scopes.indexOf("store/customer/created") > -1 || scopes.indexOf("store/customer/*") > -1) {
            console.log("Customer webhook already exists");
        } else {
            bigCommerce.post('/hooks', hookBody)
                .then(data => {
                    console.log('Customer webhook created');
                })
        }
    });

    app.post('/webhooks', function (req, res) {
        res.send('OK');
        let webhook = req.body;
        let customerId = webhook.data.id;
        console.log(customerId);

        bigCommerce.get(`/customers/${customerId}`)
        .then(data => {
            data.form_fields.forEach((el)=>{
                if(el.name === 'Secret code'){
                    if(el.value === 'B2BUSER') {
                        dataCustomer = { "customer_group_id": 2, "store_credit": "100" };
                        bigCommerce.put(`/customers/${customerId}`, dataCustomer)
                            .then(data => {
                                console.log('Data customer', data);
                            })
                            .catch(err => {
                                logger.info(`Request returned error code: ${err.code}`);
                            });
                    }
                    if(el.value === 'REGULAR') {
                        dataCustomer = { "customer_group_id": 1 };
                        bigCommerce.put(`/customers/${customerId}`, dataCustomer)
                            .then(data => {
                                console.log('Data customer', data);
                            })
                            .catch(err => {
                                logger.info(`Request returned error code: ${err.code}`);
                            });
                    }
                    if(el.value !== 'REGULAR') {
                        if( el.value !== 'B2BUSER') {
                            logger.info(` ${data.first_name}, ${data.last_name}, ${data.email}, ${data.registration_ip_address}`);
                        }
                    }
                }
            })
        })
        .catch(err => {
            logger.info(`Request returned error code: ${err.code}`);
        });
    });


http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});