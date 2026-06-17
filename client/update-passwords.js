const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://harshinibhandary21_db_user:newpassword123@cluster0.ktito3f.mongodb.net/campus_compass_tt?retryWrites=true&w=majority&appName=Cluster0';

async function updateCoordinatorPasswords() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const universities = await db.collection('universities').find({}).toArray();
    
    for (const university of universities) {
      console.log(`\nProcessing university: ${university.name}`);
      
      for (let i = 0; i < university.departments.length; i++) {
        const dept = university.departments[i];
        const coordinator = dept.coordinator;
        
        if (!coordinator) continue;
        
        // Get the plain password (either from password or plainPassword field)
        const plainPassword = coordinator.password || coordinator.plainPassword;
        
        if (!plainPassword) {
          console.log(`  ⚠ No plain password found for ${dept.name}`);
          continue;
        }
        
        // Generate new hash
        const newHash = await bcrypt.hash(plainPassword, 12);
        
        // Update the passwordHash in database
        await db.collection('universities').updateOne(
          { _id: university._id },
          { 
            $set: { 
              [`departments.${i}.coordinator.passwordHash`]: newHash 
            } 
          }
        );
        
        console.log(`  ✓ Updated password hash for ${dept.name} (${coordinator.email})`);
      }
    }
    
    console.log('\n✅ All coordinator passwords updated successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateCoordinatorPasswords();
