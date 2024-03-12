require("dotenv").config();
const { OpenAI } = require("openai"); // Correct way to import the openai package

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
let userInput = "";

// Function to ask OpenAI a question
async function askQuestion(question) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: `${question} Input: ${userInput}` }],
    });

    const answer = completion.choices[0].message.content.trim();
    return answer;
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to extract the number of rows from the user input using OpenAI's GPT-3 API
async function extractRows() {
  try {
    const answer = await askQuestion(
      "How many rows are in the form and create array of object using the information?"
    );

    console.log("Row completion: ", answer);

    const matches = answer.match(/\d+/); // Extract numeric values
    if (matches && matches.length > 0) {
      const numRows = parseInt(matches[0]); // Parse the numeric value as the number of rows
      return numRows;
    } else {
      console.log("Unable to extract the number of rows.");
      return null;
    }
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to ask OpenAI for the number of columns in a specific row
async function extractColumns(row) {
  try {
    const answer = await askQuestion(
      `How many columns are in row index ${row}?`
    );

    console.log("Column completion: ", answer);

    const matches = answer.match(/\d+/); // Extract numeric values
    if (matches && matches.length > 0) {
      return parseInt(matches[0]); // Parse the numeric value as the number of columns
    } else {
      console.log("Unable to extract the number of columns.");
      return 0;
    }
  } catch (error) {
    console.error("Error:", error);
    return 0;
  }
}

// Function to ask OpenAI for field details in a specific row and column
async function extractFields(row, column) {
  try {
    const answer = await askQuestion(
      `What is the input field type for row index ${row} and column index ${column}?`
    );

    console.log("Field completion: ", answer);

    // Here you can parse the response to extract the field details, such as field type
    // For simplicity, let's assume it returns a string representing the field type
    return answer.trim(); // Return the field type
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
}

// Function to generate the form structure
async function generateFormStructure() {
  const numRows = await extractRows();

  if (numRows !== null) {
    console.log("Number of rows:", numRows);
    const formStructure = [];

    for (let i = 0; i < numRows; i++) {
      const numColumns = await extractColumns(i); // Ask OpenAI for the number of columns in this row
      const row = [];

      for (let j = 0; j < numColumns; j++) {
        const fieldType = await extractFields(i, j); // Ask OpenAI for field details in this row and column
        row.push(fieldType); // Push field details to the row
      }

      formStructure.push(row); // Push the row to the form structure
    }

    return formStructure;
  }
}

async function main(input) {
  // Example usage
  userInput = input
    // "Create a form having 3 rows and 2 columns in each row, with 2 text fields in first row and a date field in first column of second row and number field in the second column of second row";

  //   const formStructure = await generateFormStructure();
  const formStructure = await askQuestion(
    `How many rows are in the form, create array of object using the information? 
    Generate the desired output, unformated in one line without any description apart from the array string:
    [{row: 1,columns: [{type: 'text'}]}]`
  );

  console.log(formStructure);
  try {
    const validJSONString = formStructure
      .replace(/([{,])(\s*)([a-zA-Z0-9_\-]+?)\s*:/g, '$1"$3":')
      .replace(/'/g, '"');
    const output = JSON.parse(validJSONString);
    console.log("parsed Array: ", output);

    return output;
  } catch (error) {
    console.log(error);
  }
}

module.exports = {
  main: main,
};
