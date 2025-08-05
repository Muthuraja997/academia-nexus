// Load environment variables
require('dotenv').config({ path: '../.env.local' });

const mysql = require('mysql2/promise');
const { dbConfig } = require('./mysql-config');

async function addProfileColumns() {
    try {
        console.log('🔄 Connecting to database...');
        const connection = await mysql.createConnection(dbConfig);
        
        // List of columns to add
        const columnsToAdd = [
            { name: 'year_of_study', type: 'VARCHAR(50)', description: 'Year of study (e.g., Freshman, Sophomore)' },
            { name: 'education_level', type: 'VARCHAR(50)', description: 'Education level (high_school, undergraduate, etc.)' },
            { name: 'gpa', type: 'DECIMAL(3,2)', description: 'GPA (0.00 to 4.00)' },
            { name: 'bio', type: 'TEXT', description: 'User biography' },
            { name: 'interests', type: 'TEXT', description: 'User interests' },
            { name: 'achievements', type: 'TEXT', description: 'User achievements' },
            { name: 'skills', type: 'TEXT', description: 'User skills' },
            { name: 'career_goals', type: 'TEXT', description: 'Career goals' },
            { name: 'linkedin_url', type: 'VARCHAR(255)', description: 'LinkedIn profile URL' },
            { name: 'github_url', type: 'VARCHAR(255)', description: 'GitHub profile URL' },
            { name: 'portfolio_url', type: 'VARCHAR(255)', description: 'Portfolio website URL' },
            { name: 'date_of_birth', type: 'DATE', description: 'Date of birth' },
            { name: 'nationality', type: 'VARCHAR(100)', description: 'Nationality' }
        ];

        // Check which columns already exist
        const [existingColumns] = await connection.execute('DESCRIBE users');
        const existingColumnNames = existingColumns.map(col => col.Field);
        
        console.log('📋 Existing columns:', existingColumnNames.join(', '));
        
        // Add missing columns
        for (const column of columnsToAdd) {
            if (!existingColumnNames.includes(column.name)) {
                try {
                    console.log(`➕ Adding column: ${column.name} (${column.type})`);
                    await connection.execute(`
                        ALTER TABLE users 
                        ADD COLUMN ${column.name} ${column.type}
                    `);
                    console.log(`✅ Successfully added ${column.name}`);
                } catch (error) {
                    console.error(`❌ Error adding ${column.name}:`, error.message);
                }
            } else {
                console.log(`⏭️  Column ${column.name} already exists`);
            }
        }
        
        // Show final table structure
        console.log('\n📊 Final table structure:');
        const [finalColumns] = await connection.execute('DESCRIBE users');
        finalColumns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
        });
        
        await connection.end();
        console.log('\n🎉 Database schema update completed!');
        
    } catch (error) {
        console.error('❌ Error updating database schema:', error);
        process.exit(1);
    }
}

addProfileColumns();
