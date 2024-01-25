const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');


const app = express();
const port = 3000;
const url = 'https://es.wikipedia.org/wiki/Categor%C3%ADa:M%C3%BAsicos_de_rap';


app.get('/', (req, res) =>{
  axios.get(url)
  .then(response => {
    const $ = cheerio.load(response.data);

      const links = [];
      $('div.mw-category a').each((index, element) => {
        links.push($(element).attr('href'));
      });

      const dataPromises = links.map(link => {
        const pageUrl = `https://es.wikipedia.org${link}`;
        return axios.get(pageUrl)
          .then(pageResponse => {
            const pageData = cheerio.load(pageResponse.data);

            const title = pageData('h1').text();
            const images = [];
            pageData('img').each((index, element) => {
              images.push(pageData(element).attr('src'));
            });
            const paragraphs = [];
            pageData('p').each((index, element) => {
              paragraphs.push(pageData(element).text());
            });

            return {
              title,
              images,
              paragraphs,
            };
          })
          .catch(error => {
            console.error(`Error al acceder a la página ${pageUrl}: ${error.message}`);
            return null;
          });
      });

      Promise.all(dataPromises)
        .then(data => {
      
          res.json(data);
        });
    })
    .catch(error => {
      res.status(500).send('Error al acceder a la página web: ' + error.message);
    });
});

app.listen(port, () => {
  console.log(`Express escuchando en el puerto http://localhost:${port}`);
});
