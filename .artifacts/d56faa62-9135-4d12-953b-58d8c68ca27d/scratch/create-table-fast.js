import pg from 'pg';
const { Client } = pg;

async function main() {
  const password = "dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com:5432/?Action=connect&DBUser=postgres&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIAYVMY5Q7JPW37B3CX%2F20260721%2Fus-east-1%2Frds-db%2Faws4_request&X-Amz-Date=20260721T135058Z&X-Amz-Expires=900&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPb%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJIMEYCIQDxz0m%2B7YPqf2MdgaGpWRTJi8e%2F6xvSiQfYVCgqeoN6FAIhAPhq8ZLv%2F4PYXCFMXoNHYjkBcP8nVCTUMSk3mLKpqMDiKt4DCL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQABoMNTk1NzEwNTQzODI2Igzy5JBSbnbF%2BrbagLwqsgNMOKoxeWstb4eEYtp59xRS7PjSGcm%2Frg8xLXqH7BGnfRL9aVZpswyY%2BX4Ktl4%2BvrEPiiDB2q8XIAGJd11TQagOdGWyctrq8sg5XKaq%2BdzYiN9RPfFMsh8SXPq3W2kbEe7OmbT7%2BThefXkX2tKS3ZVk4XKG2z2lJN9LW%2FV4CQZjLdVh69PNa9iJr3pHhhgPLsrGeyWwBW%2B4n6LIqMHdk1aYZzuzReF1dKnQPla18mmgoEI47UqqZtIvYeJl6k2cQJZhGo4%2FZtVWmQDrRKrl8HTmFxIZ0XXvpMb2LqnpuROZE7ok1vLGVEzfhdl8wanPIC2EzQCAzr%2BZ7Nyj7J69TaHaYH8DF1%2BfvXsVCsf7ZDEbHRfepK%2BZcpqfl3wzBa6YpZDQIu4eDlwLyPBtIu4P1Ie%2FqQaZVpxtG%2B9yAXohEdF9EafSEziDRIeBKlkH1qiFncNz2a9F5C328nTZnx5NkMiQLiCUrCERzHS53J%2FKKJf1Xky8OPyi22eVrET2dv1aPI%2BsRMEJA72nysBxQeo859qZ5BA2p08WCWxWoDZ%2BQ5WKYGULK5Q%2Btos59RazwUOW%2Fk%2BnkDDh5P3SBjqBAl%2B6OknBvtDKK2KkLP0MWXKZVVNNa1qAMaCVvndLQ0Bz%2FHbbd7SnXGz2GNZE2KTG1NAc93g8BVNHN8qwFnDipv5r0F2xKO2MwxTmZYx%2FxM2H9P8QZyVaFqqao8M4m3qJfQzmSzplNi%2FS2qM65Cg2u4oMwZ70psGraKYw%2BNMIG9XrbmF3cbL1iu%2BwHFFDiXOAZt02SFKxBUxOEO%2FqMQRC9BeJiz%2F7H5RrL2hphWgIc5IbCrlyKWWrBvNhkzTY4WniZCFf6OHOcuc%2BmN%2F4PBqSljbx6UimaEWuF8MAvywwWCJSH0oK7pMxTUIds%2FUgkR85ZWmCJMvP0TjsKemC%2BK4K6QSh&X-Amz-Signature=d5e0f5042cb77fd00ab67d268d36eddba27483879246b8fb46bfbf73c706e060&X-Amz-SignedHeaders=host";

  const client = new Client({
    host: 'dcp-production-db.cluster-cs7wcksg2js1.us-east-1.rds.amazonaws.com',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting...');
    await client.connect();
    console.log('✓ Connected!');

    console.log('Creating table "comments"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        comment TEXT
      )
    `);
    console.log('✓ Table created successfully.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

main();
