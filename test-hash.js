const bcrypt = require('bcrypt');

const hash = '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

async function test() {
    try {
        // Tester avec admin123
        const result = await bcrypt.compare('admin123', hash);
        console.log('🔑 Mot de passe "admin123" est valide:', result);
        
        // Si false, tester d'autres mots de passe courants
        if (!result) {
            const mots = ['admin', 'admin2026', 'password', 'admin12345', 'test123', '123456'];
            console.log('\n🔍 Test d\'autres mots de passe courants...');
            for (const mot of mots) {
                const r = await bcrypt.compare(mot, hash);
                if (r) {
                    console.log(`✅ Le mot de passe est: "${mot}"`);
                    return;
                }
            }
            console.log('❌ Aucun mot de passe testé ne correspond');
        }
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

test();