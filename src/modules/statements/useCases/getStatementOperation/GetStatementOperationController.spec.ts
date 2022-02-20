import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Get Statement Operation Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able view a deposit", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "john@doe.com",
      password: "123456",
    });

    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;
    const responseDeposit = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "Deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });
    await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const result = await request(app)
      .get(`/api/v1/statements/${responseDeposit.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.status).toBe(200);
    expect(result.body.id).toBe(responseDeposit.body.id);
  });

  it("should be able view a withdraw", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;
    const responseWithdraw = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 5,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const result = await request(app)
      .get(`/api/v1/statements/${responseWithdraw.body.id}`)
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.status).toBe(200);
    expect(result.body.id).toBe(responseWithdraw.body.id);
  });

  it("should not be able list a statement item withou a existing user", async () => {
    const responseSession = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = responseSession.body;

    const response = await request(app)
      .get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${token}`,
      });
    const { id } = response.body.statement[1];
    const result = await request(app).get(`/api/v1/statements/${id}`).set({
      Authorization: `Bearer token-invalid`,
    });

    expect(result.status).toBe(401);
  });
});
