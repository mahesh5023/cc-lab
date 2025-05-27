const express = require("express");
const soap = require("soap");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 3000;
const wsdlUrl = "http://www.dneonline.com/calculator.asmx?WSDL";

app.use(bodyParser.urlencoded({ extended: true }));

// Serve HTML form
app.get("/", (req, res) => {
  res.send(`
    <h2>SOAP Rectangle Calculator</h2>
    <form method="POST" action="/calculate">
      <input name="a" placeholder="Enter length (A)" required />
      <input name="b" placeholder="Enter breadth (B)" required />
      <button type="submit">Calculate Area and Perimeter</button>
    </form>
  `);
});

// Handle form submission
app.post("/calculate", (req, res) => {
  const { a, b } = req.body;
  const intA = Number(a);
  const intB = Number(b);

  soap.createClient(wsdlUrl, (err, client) => {
    if (err) return res.send("SOAP Client Error: " + err);

    // Step 1: Add (a + b)
    client.Add({ intA, intB }, (err, addResult) => {
      if (err) return res.send("Error in Add: " + err);

      const sum = addResult.AddResult;

      // Step 2: Multiply sum by 2 => Perimeter = 2 * (a + b)
      client.Multiply({ intA: 2, intB: sum }, (err, perimeterResult) => {
        if (err) return res.send("Error in Multiply (Perimeter): " + err);

        const perimeter = perimeterResult.MultiplyResult;

        // Step 3: Multiply a * b => Area
        client.Multiply({ intA, intB }, (err, areaResult) => {
          if (err) return res.send("Error in Multiply (Area): " + err);

          const area = areaResult.MultiplyResult;

          res.send(`
            <h3>Rectangle with Length = ${intA} and Breadth = ${intB}</h3>
            <p><strong>Area:</strong> ${area}</p>
            <p><strong>Perimeter:</strong> ${perimeter}</p>
            <a href="/">Back</a>
          `);
        });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
