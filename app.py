from flask import Flask, request, jsonify, render_template
import sqlite3

app = Flask(__name__)


def get_db():
    db = sqlite3.connect("petcare.db")
    db.row_factory = sqlite3.Row
    return db

def init_db():
    db = get_db()

    db.execute("""
        CREATE TABLE IF NOT EXISTS medications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            pet_id INTEGER NOT NULL,
            dose TEXT NOT NULL,
            date TEXT NOT NULL
        )
    """)

    db.commit()
    db.close()


# Home page
@app.route("/")
def home():
    return render_template("index.html")

# Get all pets
@app.route("/pets", methods=["GET"])
def get_pets():

    db = get_db()

    pets = db.execute("""
        SELECT * FROM pets
        ORDER BY id DESC
    """).fetchall()

    db.close()

    return jsonify([dict(pet) for pet in pets])


# Add pet
@app.route("/pets", methods=["POST"])
def add_pet():

    data = request.json

    db = get_db()

    db.execute("""
        INSERT INTO pets (name, type, age, owner)
        VALUES (?, ?, ?, ?)
    """, (
        data["name"],
        data["type"],
        data["age"],
        data["owner"]
    ))

    db.commit()
    db.close()

    return jsonify({"message": "Pet added successfully!"})

# Add medication
@app.route("/medications", methods=["POST"])
def add_medication():

    data = request.json

    db = get_db()

    db.execute("""
        INSERT INTO medications (name, pet_id, dose, date)
        VALUES (?, ?, ?, ?)
    """, (
        data["name"],
        data["pet_id"],
        data["dose"],
        data["date"]
    ))

    db.commit()
    db.close()

    return jsonify({"message": "Medication added successfully!"})


# Update pet
@app.route("/pets/<int:pet_id>", methods=["PUT"])
def update_pet(pet_id):

    data = request.json

    db = get_db()

    db.execute("""
        UPDATE pets
        SET name = ?, type = ?, age = ?, owner = ?
        WHERE id = ?
    """, (
        data["name"],
        data["type"],
        data["age"],
        data["owner"],
        pet_id
    ))

    db.commit()
    db.close()

    return jsonify({"message": "Pet updated successfully!"})


# Delete pet
@app.route("/pets/<int:pet_id>", methods=["DELETE"])
def delete_pet(pet_id):

    db = get_db()

    db.execute("""
        DELETE FROM pets
        WHERE id = ?
    """, (pet_id,))

    db.commit()
    db.close()

    return jsonify({"message": "Pet deleted successfully!"})


# Statistics
@app.route("/statistics")
def statistics():

    db = get_db()

    total_pets = db.execute("""
        SELECT COUNT(*) AS total
        FROM pets
    """).fetchone()["total"]

    total_medications = db.execute("""
    SELECT COUNT(*) AS total
    FROM medications
    """).fetchone()["total"]

    types = db.execute("""
        SELECT type, COUNT(*) AS total
        FROM pets
        GROUP BY type
        ORDER BY total DESC
    """).fetchall()

    db.close()

    return jsonify({
        "total_pets": total_pets,
        "total_medications": total_medications,
        "types": [dict(row) for row in types]
    })

init_db()


if __name__ == "__main__":
    print("🐾 PetCare Manager is running!")
    app.run(debug=True)