import { useEffect, useState, useCallback } from 'react';

import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import { ModalAddFood } from '../../components/ModalAddFood';
import { ModalEditFood } from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

export interface FoodData {
  id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

export type FoodFormData = Omit<FoodData, 'id' | 'available'>;

export function Dashboard() {
  const [foods, setFoods] = useState<FoodData[]>([]);
  const [editingFood, setEditingFood] = useState<FoodData>({} as FoodData);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get<FoodData[]>('/foods');

      setFoods(response.data);
    }
    
    loadFoods();
  }, []);

  const toggleModal = useCallback(() => {
    setModalOpen(!modalOpen);
  }, [modalOpen]);

  const toggleEditModal = useCallback(() => {
    setEditModalOpen(!editModalOpen);
  }, [editModalOpen]);

  const handleAddFood = useCallback(async (food: FoodFormData) => {
    try {
      const response = await api.post<FoodData>('/foods', {
        ...food,
        available: true,
      });

      setFoods([...foods, response.data]);
    } catch (err) {
      console.log(err);
    }
  }, [foods]);

  const handleUpdateFood = useCallback(async (food: FoodData) => {
    try {
      const foodUpdated = await api.put<FoodData>(
        `/foods/${editingFood.id}`,
        { ...editingFood, ...food },
      );

      const foodsUpdated = foods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated);
    } catch (err) {
      console.log(err);
    }
  }, [foods, editingFood]);

  const handleEditFood = useCallback((food: FoodData) => {
    setEditingFood(food);
    setEditModalOpen(true);
  }, []);

  const handleDeleteFood = useCallback(async (food_id: string) => {
    await api.delete<FoodData>(`/foods/${food_id}`);

    const foodsFiltered = foods.filter(findFood => findFood.id !== food_id);

    setFoods(foodsFiltered);
  }, [foods]);

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  )
}
