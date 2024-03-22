const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const fs = require('fs');
const app = express();
const PORT = 3000;



app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/submit', upload.array(), (req, res) => {
    const formData = req.body;
    console.log('Form data received:', formData);

    // Append submission to a file
    const submission = JSON.stringify(formData) + ",\n"; // Add a newline for readability
    fs.appendFile('submissions.json', submission, (err) => {
        if (err) throw err;
        console.log('Saved submission to submissions.json');
    });

    res.send('Form submission received! Thank you.');
});

app.get('/analyst', (req, res) => {
    fs.readFile('submissions.json', 'utf8', (err, data) => {
        if (err || data.trim() === "") {
            console.error('Error reading submissions file or file is empty:', err);
            data = "[]"; // Default to an empty array if there's an error or the data is empty
        } else {
            // Clean up data format
            data = "[" + data.trim().replace(/,\s*$/, "") + "]";
        }

        let submissions;
        try {
            submissions = JSON.parse(data);
        } catch (parseError) {
            console.error('Error parsing submissions data:', parseError);
            submissions = []; // Default to an empty array if parsing fails
        }

        // Start building the table HTML string
        let tableRows = submissions.map(submission => {
            // Correctly defining `features` within the map callback function
            let features = Array.isArray(submission.feature) ? submission.feature.join(", ") : submission.feature || '';
            
            return `<tr>
                        <td>${submission.textQuestion || ''}</td>
                        <td>${submission.usability || ''}</td>
                        <td>${submission.websiteSpeed || ''}</td>
                        <td>${submission.colors || ''}</td>
                        <td>${features}</td>
                        <td>${submission.comments || ''}</td>
                    </tr>`;
        }).join('');

        // Send HTML response with Bootstrap styling and the table
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Analyst View</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.6.0/css/bootstrap.min.css">
                <link rel="stylesheet" href="/styles/analyst.css">
            </head>
            <body>
                <div class="container mt-5">
                    <h1>Submission Results</h1>
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Initial Impression</th>
                                <th>Usability</th>
                                <th>Speed</th>
                                <th>Colors</th>
                                <th>Features Liked</th>
                                <th>Other Comments</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    <footer class="mt-5">
                        Website designed by Gini
                    </footer>
                </div>
            </body>
            </html>
        `);
    });
});




// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
