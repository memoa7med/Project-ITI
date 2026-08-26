const petForm = document.getElementById("petForm");
const searchInput = document.getElementById("searchInput");
const petsTableBody = document.getElementById("petsTableBody");

let pets = [];


// Get pets from database
async function loadPets() {

    const response = await fetch("/pets");

    pets = await response.json();

    displayPets(pets);

    loadStatistics();
}


// Display pets
function displayPets(list) {

    petsTableBody.innerHTML = "";

    list.forEach((pet) => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${pet.id}</td>
            <td>${pet.name}</td>
            <td>${pet.type}</td>
            <td>${pet.age}</td>
            <td>${pet.owner}</td>

            <td>
                <button
                    class="edit-btn"
                    onclick="editPet(${pet.id})">
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deletePet(${pet.id})">
                    Delete
                </button>
            </td>
            
        `;

        petsTableBody.appendChild(row);
    });
}


// Add pet
petForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const pet = {

        name: document.getElementById("petName").value,

        type: document.getElementById("petType").value,

        age: Number(
            document.getElementById("petAge").value
        ),

        owner: document.getElementById("ownerName").value
    };


    await fetch("/pets", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(pet)
    });


    petForm.reset();

    alert("Pet added successfully!");

    loadPets();
});


// Search
searchInput.addEventListener("input", function() {

    const searchValue =
        searchInput.value.toLowerCase();


    const filteredPets = pets.filter((pet) => {

        return pet.name
            .toLowerCase()
            .includes(searchValue);
    });


    displayPets(filteredPets);
});


// Delete
async function deletePet(id) {

    await fetch(`/pets/${id}`, {

        method: "DELETE"
    });


    alert("Pet deleted!");

    loadPets();
}


// Edit
async function editPet(id) {

    const pet = pets.find((pet) => pet.id === id);

    const newName = prompt(
        "Enter new pet name:",
        pet.name
    );


    if (!newName) {
        return;
    }


    const updatedPet = {

        name: newName,

        type: pet.type,

        age: pet.age,

        owner: pet.owner
    };


    await fetch(`/pets/${id}`, {

        method: "PUT",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(updatedPet)
    });


    alert("Pet updated!");

    loadPets();
}


// Statistics
async function loadStatistics() {

    const response = await fetch("/statistics");

    const data = await response.json();


    document.getElementById("petCount")
        .textContent = data.total_pets;

        document.getElementById("medCount")
    .textContent = data.total_medications;


    console.log("Pets by type:");

    data.types.forEach((item) => {

        console.log(
            item.type + ": " + item.total
        );
    });
}

// Add medication
const medicationForm = document.getElementById("medicationForm");

medicationForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const medication = {
        name: document.getElementById("medName").value,
        pet_id: Number(document.getElementById("medPet").value),
        dose: document.getElementById("dose").value,
        date: document.getElementById("medDate").value
    };

    await fetch("/medications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(medication)
    });

    medicationForm.reset();

    alert("Medication added successfully!");

});


// Start
loadPets();