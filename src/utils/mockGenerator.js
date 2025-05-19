import { faker } from '@faker-js/faker';

const PET_SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'hamster'];
const PET_BREEDS = {
    dog: ['Labrador', 'German Shepherd', 'Golden Retriever', 'Bulldog', 'Beagle'],
    cat: ['Persian', 'Siamese', 'Maine Coon', 'Ragdoll', 'Sphynx'],
    bird: ['Parrot', 'Canary', 'Cockatiel', 'Finch', 'Budgie'],
    rabbit: ['Holland Lop', 'Netherland Dwarf', 'Rex', 'Angora', 'Lionhead'],
    hamster: ['Syrian', 'Dwarf', 'Roborovski', 'Chinese', 'Campbell']
};

export const generateMockPets = (count = 100) => {
    const pets = [];
    for (let i = 0; i < count; i++) {
        const species = faker.helpers.arrayElement(PET_SPECIES);
        const breed = faker.helpers.arrayElement(PET_BREEDS[species]);
        
        pets.push({
            name: faker.animal[species](),
            species,
            breed,
            age: faker.number.int({ min: 1, max: 15 }),
            description: faker.lorem.paragraph(),
            image: faker.image.urlLoremFlickr({ category: 'animals' }),
            adopted: false,
            owner: null,
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        });
    }
    return pets;
};

export const generateMockUsers = (count = 50) => {
    const users = [];
    for (let i = 0; i < count; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        
        users.push({
            first_name: firstName,
            last_name: lastName,
            email: faker.internet.email({ firstName, lastName }),
            password: 'coder123', // Will be hashed later
            role: faker.helpers.arrayElement(['user', 'admin']),
            pets: [],
            createdAt: faker.date.past(),
            updatedAt: faker.date.recent()
        });
    }
    return users;
}; 