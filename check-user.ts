import { DataSource } from 'typeorm';

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'postgres',
    database: 'homecare_db',
    synchronize: false,
});

async function checkUser() {
    await dataSource.initialize();
    const result = await dataSource.query(`SELECT email, "identificationPath" FROM users WHERE email = 'man@homecare.com'`);
    console.log('User found:', result);
    await dataSource.destroy();
}

checkUser().catch(console.error);
