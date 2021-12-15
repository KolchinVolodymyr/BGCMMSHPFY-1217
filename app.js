const http = require('http');
const express = require('express');
const bodyParser = require('body-parser')
const dotenv = require('dotenv');
dotenv.config();

const BigCommerce = require('node-bigcommerce');
const bigCommerce = new BigCommerce({
  clientId: '91b9jalhudogsst03vmoeqia3tiiayp',
  accessToken: '44k9qx9obxx2x1o99c4ieu1c1ooliz6',
  storeHash: '1olu80ndn1',
  responseType: 'json'
});
const app = express();

app.use(bodyParser.json())

  bigCommerce.get('/hooks')
    .then(data => {
      let webhooks = data;
      let scopes = webhooks.map(a => a.scope);
      const hookBody = {
        "scope": "store/customer/created",
        "destination": "https://1119-46-211-20-86.ngrok.io/webhooks",
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
                            // Catch any errors, or handle the data returned
                                console.log('data customer', data);
                            });
                    }
                    if(el.value === 'REGULAR') {
                        dataCustomer = { "customer_group_id": 1 };
                        bigCommerce.put(`/customers/${customerId}`, dataCustomer)
                            .then(data => {
                            // Catch any errors, or handle the data returned
                                console.log('data customer', data);
                            });
                    }
                }
            })
          })
        });


http.createServer(app).listen(3000, () => {
  console.log('Express server listening on port 3000');
});