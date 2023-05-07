/** Tests for companies. */

const request = require("supertest");

const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

beforeEach(createData);

afterAll(async () => {
    await db.end()
})

describe("GET /", function () {

    test("It should respond with array of companies", async function () {
        const response = await request(app).get("/companies");
        expect(response.body).toEqual({
            "companies": [
                { code: "apple", name: "Apple" },
                { code: "ibm", name: "IBM" },
            ]
        });
    })

});

describe("GET /apple", function () {

    test("It return company info", async function () {
        const response = await request(app).get("/companies/apple");
        expect(response.body).toEqual(
            {
                "company": {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of OSX.",
                    invoices: [1, 2],
                }
            }
        );
    });
});

describe("POST /", function () {

    test("It should add company", async function () {
        const response = await request(app)
            .post("/companies")
            .send({ name: "TacoTime", description: "Yum!" });

        expect(response.body).toEqual(
            {
                "company": {
                    code: "tacotime",
                    name: "TacoTime",
                    description: "Yum!",
                }
            }
        );
    });
});