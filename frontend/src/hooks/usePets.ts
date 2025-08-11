import { useState, useCallback } from 'react';
import { Pet } from '../types';
import { apiService } from '../services/api';

export const usePets = (initialPets: Pet[] = []) => {
  const [pets, setPets] = useState<Pet[]>(initialPets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addPet = useCallback(async (petData: Omit<Pet, 'id'>) => {
    setLoading(true);
    setError(null);

    try {
      // Call backend API
      const response = await apiService.addPet({
        name: petData.name,
        species: petData.type || 'dog',
        breed: petData.breed,
        age_years: parseInt(petData.age.split(' ')[0]) || 1,
        age_months: 0,
        gender: 'unknown',
        profile_image: petData.image
      });

      if (response.success && response.data) {
        const newPet: Pet = {
          id: response.data.id,
          name: response.data.name,
          breed: response.data.breed,
          age: `${response.data.age_years} years`,
          image: response.data.profile_image || petData.image,
          type: response.data.species as Pet['type']
        };

        setPets(prevPets => [...prevPets, newPet]);
        return { success: true, pet: newPet };
      } else {
        throw new Error(response.error || 'Failed to add pet');
      }
    } catch (err) {
      // Fallback to local storage if API fails
      const newPet: Pet = {
        id: Date.now().toString(),
        ...petData
      };
      
      setPets(prevPets => [...prevPets, newPet]);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with server, but pet added locally';
      setError(errorMessage);
      
      return { success: true, pet: newPet, warning: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePet = useCallback(async (petId: string, petData: Partial<Pet>) => {
    setLoading(true);
    setError(null);

    try {
      // Call backend API
      const response = await apiService.updatePet(petId, petData);

      if (response.success) {
        setPets(prevPets => 
          prevPets.map(pet => 
            pet.id === petId 
              ? { ...pet, ...petData }
              : pet
          )
        );
        return { success: true };
      } else {
        throw new Error(response.error || 'Failed to update pet');
      }
    } catch (err) {
      // Fallback to local update if API fails
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === petId 
            ? { ...pet, ...petData }
            : pet
        )
      );
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with server, but pet updated locally';
      setError(errorMessage);
      
      return { success: true, warning: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const removePet = useCallback(async (petId: string) => {
    setLoading(true);
    setError(null);

    try {
      // In a real app, you'd call the API to delete the pet
      // await apiService.deletePet(petId);
      
      setPets(prevPets => prevPets.filter(pet => pet.id !== petId));
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove pet';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    pets,
    setPets,
    addPet,
    updatePet,
    removePet,
    loading,
    error
  };
};