import request from "supertest";
import { Connection, createConnection } from "typeorm";
import { app } from "../../../../app";

let connection: Connection;
describe("Show User Profile Controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should be able to list a user profile", async () => {
    await request(app).post("/api/v1/users").send({
      name: "John Doe",
      email: "john@dow.com",
      password: "123456",
    });

    const response = await request(app).post("/api/v1/sessions").send({
      email: "john@doe.com",
      password: "123456",
    });

    const { token } = response.body;
    const result = await request(app)
      .get("/api/v1/profile")
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(result.body).toHaveProperty("id");
    expect(result.body).toHaveProperty("name");
    expect(result.body).toHaveProperty("email");
    expect(result.body.email).toEqual("john@doe.com");
    expect(result.status).toBe(200);
  });

  it("should not be able to list a profile for a nonexisting user", async () => {
    const response = await request(app).get("/api/v1/profile").set({
      Authorization: `Bearer fake-bearer-token-here`,
    });

    expect(response.status).toBe(401);
  });
});
