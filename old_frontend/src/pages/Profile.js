import React, { useState } from 'react';
import { Plus, CalendarDays, Footprints, Dog, Cat } from 'lucide-react';

const ProfilePage = () => {
  const [pets, setPets] = useState([
    { type: 'dog', name: 'Bruno' },
    { type: 'cat', name: 'Whiskers' }
  ]);
  const [newPet, setNewPet] = useState({ type: 'dog', name: '' });
  const [bookings, setBookings] = useState([
    { type: 'keeping', date: '2025-08-15', pet: 'Bruno' },
    { type: 'giving', date: '2025-08-20', pet: 'Whiskers' }
  ]);

  const addPet = () => {
    if (newPet.name.trim()) {
      setPets([...pets, newPet]);
      setNewPet({ type: 'dog', name: '' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-pink-500 to-orange-400 rounded-2xl mb-4 shadow-lg">
            <Footprints className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent">
            My Profile
          </h1>
          <p className="text-gray-600 mt-2">Manage your pets and bookings</p>
        </div>

        {/* Pets List */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">My Pets</h2>
          <ul className="space-y-3">
            {pets.map((pet, idx) => (
              <li key={idx} className="flex items-center gap-3">
                {pet.type === 'dog' ? (
                  <Dog className="text-orange-500" />
                ) : (
                  <Cat className="text-pink-500" />
                )}
                <span className="text-lg">{pet.name}</span>
              </li>
            ))}
          </ul>

          {/* Add New Pet */}
          <div className="mt-6">
            <h3 className="text-sm text-gray-600 mb-1">Add a new pet</h3>
            <div className="flex items-center gap-2 mb-2">
              <select
                value={newPet.type}
                onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                className="border rounded-lg p-2"
              >
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
              <input
                type="text"
                placeholder="Pet name"
                value={newPet.name}
                onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                className="flex-grow border rounded-lg p-2"
              />
              <button
                onClick={addPet}
                className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl"
              >
                <Plus />
              </button>
            </div>
          </div>
        </div>

        {/* Bookings Calendar */}
        <div className="bg-white rounded-3xl shadow-xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <CalendarDays className="text-purple-500" />
            Upcoming Bookings
          </h2>
          <ul className="space-y-3">
            {bookings.map((b, idx) => (
              <li
                key={idx}
                className="flex items-center justify-between border rounded-xl p-3 bg-gradient-to-r from-orange-50 to-pink-50"
              >
                <div>
                  <p className="font-medium">{b.pet}</p>
                  <p className="text-sm text-gray-500">{b.type === 'keeping' ? 'You will keep' : 'You will give'} this pet</p>
                </div>
                <span className="text-sm font-semibold text-gray-700">{b.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
