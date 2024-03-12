const readline = require("readline");
const fs = require("fs");

const ai = require("./extraction-with-ai");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Initialize the JSON template
let jsonTemplate = {
  id: "form1",
  stages: {},
  rows: {},
  columns: {},
  fields: {},
};

// Function to add a new row
function addRow(id) {
  jsonTemplate.rows[`${id}`] = {
    children: [],
  };
}

// Function to add a new column to a specific row
function addColumn(rowId, columnId) {
  if (!jsonTemplate.columns[`${columnId}`]) {
    jsonTemplate.columns[`${columnId}`] = {
      children: [],
    };
  }
  jsonTemplate.rows[`${rowId}`].children.push(`${columnId}`);
}

// Function to add a new field to a specific column
function addField(columnId, type) {
  const fieldId = generateUUID();
  jsonTemplate.fields[fieldId] = {
    tag: "input",
    attrs: {
      type: type,
      required: true,
      className: "",
      fontSize: "",
      labelSize: "",
      attributeScope: "column",
      readonly: false,
      value: "",
    },
    id: generateUUID(),
    cellIndex: `1D${columnId}`,
  };
  jsonTemplate.columns[`${columnId}`].children.push(fieldId);
}

// Function to generate a UUID (Universally Unique Identifier)
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Function to parse the user input and generate the JSON template
async function parseInput(input) {
  const formStructure = await ai.main(input);

  // Generate UUIDs for form, stage, and fields
  const formId = generateUUID();
  const stageId = generateUUID();

  // Initialize the JSON template
  const jsonTemplate = {
    id: formId,
    stages: {
      [stageId]: {
        children: [], // Initially empty, will be populated later
        id: stageId,
      },
    },
    rows: {},
    columns: {},
    fields: {},
  };

  // Add rows to JSON template
  formStructure.forEach((row, rowIndex) => {
    const rowId = generateUUID();
    jsonTemplate.rows[rowId] = {
      children: [], // Initially empty, will be populated later
      id: rowId,
    };

    // Add columns to JSON template for each row
    row.columns.forEach((field, columnIndex) => {
      const columnId = generateUUID();
      jsonTemplate.columns[columnId] = {
        children: [], // Initially empty, will be populated later
        id: columnId,
      };
      const fieldId = generateUUID();
      jsonTemplate.fields[fieldId] = {
        tag: "input",
        attrs: {
          type: field.type,
          required: true,
          className: "",
          fontSize: "",
          labelSize: "",
          attributeScope: "column",
          readonly: false,
          value: "",
        },
        id: fieldId,
        cellIndex: `${rowIndex + 1}D${columnIndex + 1}`, // Example: "1D1" for first row, first column
      };

      // Add field ID to the children array of the corresponding column
      jsonTemplate.columns[columnId].children.push(fieldId);

      // Add column ID to the children array of the corresponding row
      jsonTemplate.rows[rowId].children.push(columnId);
    });

    // Add row ID to the children array of the stage
    jsonTemplate.stages[stageId].children.push(rowId);
  });

  console.log("Generated JSON template:");

  // Write JSON to file
  const jsonFileName = `output/form_${formId}.json`;
  fs.writeFileSync(jsonFileName, JSON.stringify(jsonTemplate, null, 2));

  console.log(jsonFileName);
  rl.close();
}

// Ask the user for the form structure
rl.question("Please describe the form structure: ", (input) => {
  parseInput(input);
});
